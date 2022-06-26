import { OrderCreatedListener, OrderCancelledListener } from "../order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedEvent, OrderCancelledEvent, OrderStatus } from "@anonytickets/common";
import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../../models/Ticket";
// import {req} from 'supertest';

const setupOrderCreatedListener = async ()=> {
    //creates an instance of listern
    const listern = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });
    

    await ticket.save();

    //create a fake message object
    const data: OrderCreatedEvent['data'] = {
        version: 0,
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString(),
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    }

    // @ts-ignore
    const msg: Message = {  
        ack: jest.fn()
    }

    return {listern, data, msg, ticket}
};

const setupOrderCancelledListener = async ()=> {
    //creates an instance of listern
    const listern = new OrderCancelledListener(natsWrapper.client);

    const orderId =  new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    });

    ticket.set({orderId});
    await ticket.save();

    // //create a fake message object
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    // @ts-ignore
    const msg: Message = {  
        ack: jest.fn()
    }

    return {listern, data, msg, ticket, orderId}
};


it('locks a ticket when order for it is created and acks message event', async ()=> {
    // call setup
    const {listern, data, msg, ticket} = await setupOrderCreatedListener();
    //call the onMessage function with the data object + message object
    await listern.onMessage(data, msg);

    // write assertion to make sure a ticket was created
    const updatedTicket = await Ticket.findById(data.ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toEqual(data.id)
    expect(msg.ack).toHaveBeenCalled()

});

it('publishes a ticket updated event', async ()=> {
    // call setup
    const {listern, data, msg, ticket} = await setupOrderCreatedListener();
    //call the onMessage function with the data object + message object
    await listern.onMessage(data, msg);

    
    expect(natsWrapper.client.publish).toHaveBeenCalled()

});

it('updates the ticket, publishes an event, anc acks the message', async ()=> {
    // call setup
    const {listern, data, msg, ticket, orderId} = await setupOrderCancelledListener();
    //call the onMessage function with the data object + message object
    await listern.onMessage(data, msg);

    // write assertion to make sure a ticket was created
    const updateTicket = await Ticket.findById(data.ticket.id);

    expect(updateTicket).toBeDefined();
    expect(updateTicket!.orderId).not.toBeDefined();

    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});


