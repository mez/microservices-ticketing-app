import { ExpirationCompleteListener } from "../expiration";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteEvent, OrderStatus } from "@anonytickets/common";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../../models/Ticket";
import { Order } from "../../../models/Order";
import mongoose from "mongoose";

const setupExpirationCompleteListener = async ()=> {
    //creates an instance of listern
    const listern = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'bob',
        expiresAt: new Date(),
        ticket
    });

    await order.save();

    //create a fake message object
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg: Message = {  
        ack: jest.fn()
    }

    return {listern, data, msg, ticket, order}
};

it('updates the order status to cancelled', async ()=> {
    // call setup
    const {listern, data, msg, order} = await setupExpirationCompleteListener();
    
    //call the onMessage function with the data object + message object
    await listern.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);


    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('emit an order cancelled event', async ()=> {
    // call setup
    const {listern, data, msg, order} = await setupExpirationCompleteListener();
    
    //call the onMessage function with the data object + message object
    await listern.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled()
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id)

});

it('ack the message', async ()=> {
    // call setup
    const {listern, data, msg} = await setupExpirationCompleteListener();
    
    //call the onMessage function with the data object + message object
    await listern.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled()
});
