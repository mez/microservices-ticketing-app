import { TicketCreatedListener, TicketUpdatedListener } from "../ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent, TicketUpdatedEvent } from "@anonytickets/common";
import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../../models/Ticket";

const setupTicketCreatedListener = async ()=> {
    //creates an instance of listern
    const listern = new TicketCreatedListener(natsWrapper.client);

    //create a fake message object
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // @ts-ignore
    const msg: Message = {  
        ack: jest.fn()
    }

    return {listern, data, msg}
};

const setupTicketUpdatedListener = async ()=> {
    //creates an instance of listern
    const listern = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
    });

    await ticket.save();

    //create a fake message object
    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'update concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    // @ts-ignore
    const msg: Message = {  
        ack: jest.fn()
    }

    return {listern, data, msg, ticket}
};


it('creates and saves a ticket and acks message event', async ()=> {
    // call setup
    const {listern, data, msg} = await setupTicketCreatedListener();
    //call the onMessage function with the data object + message object
    await listern.onMessage(data, msg);

    // write assertion to make sure a ticket was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(msg.ack).toHaveBeenCalled()

});

it('finds, updates and saves a ticket then acks the message event', async ()=> {
    // call setup
    const {listern, data, msg, ticket} = await setupTicketUpdatedListener();
    //call the onMessage function with the data object + message object
    await listern.onMessage(data, msg);

    // write assertion to make sure a ticket was created
    const updateTicket = await Ticket.findById(data.id);

    expect(updateTicket).toBeDefined();
    expect(updateTicket!.title).toEqual(data.title);
    expect(updateTicket!.price).toEqual(data.price);
    expect(updateTicket!.version).toEqual(data.version);

    expect(msg.ack).toHaveBeenCalled();

});

it('should not ack an out of order event', async () => {
    // call setup
    const {listern, data, msg, ticket} = await setupTicketUpdatedListener();
    data.version += 10;

     //call the onMessage function with the data object + message object
    try {
        await listern.onMessage(data, msg);
    } catch (error) {
    }

    expect(msg.ack).not.toHaveBeenCalled();
});
