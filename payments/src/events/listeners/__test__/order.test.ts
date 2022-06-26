import { OrderCreatedListener, OrderCancelledListener } from "../order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedEvent, OrderCancelledEvent, OrderStatus } from "@anonytickets/common";
import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { Order } from "../../../models/Order";
// import {req} from 'supertest';

const setupOrderCreatedListener = async ()=> {
    //creates an instance of listern
    const listener = new OrderCreatedListener(natsWrapper.client);


    //create a fake message object
    const data: OrderCreatedEvent['data'] = {
        version: 0,
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString(),
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 10,
        },
    }

    // @ts-ignore
    const msg: Message = {  
        ack: jest.fn()
    }

    return {listener, data, msg}
};

const setupOrderCancelledListener = async ()=> {
    //creates an instance of listern
    const listern = new OrderCancelledListener(natsWrapper.client);

    const orderId =  new mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: orderId,
        version: 0,
        status: OrderStatus.Created,
        price: 10,
        userId: 'blah'
    });
    await order.save();

    // //create a fake message object
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 1,
        ticket: {
            id: 'fake ticket'
        }
    }

    // @ts-ignore
    const msg: Message = {  
        ack: jest.fn()
    }

    return {listern, data, msg, order}
};


it('replicates order info and acks message', async ()=> {
    // call setup
    const {listener, data, msg} = await setupOrderCreatedListener();
    //call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertion to make sure a ticket was created
    const updatedOrder = await Order.findById(data.id);

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder!.price).toEqual(data.ticket.price)
    expect(msg.ack).toHaveBeenCalled()

});



it('updates the order status to cancelled and acks the message', async ()=> {
    // call setup
    const {listern, data, msg, order} = await setupOrderCancelledListener();
    //call the onMessage function with the data object + message object
    await listern.onMessage(data, msg);

    const udpateOrder = await Order.findById(order.id);

    expect(udpateOrder!.status).toEqual(OrderStatus.Cancelled);
    expect(msg.ack).toHaveBeenCalled()

});


