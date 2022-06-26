import { BaseListener, Subjects, OrderCreatedEvent, OrderCancelledEvent } from "@anonytickets/common"
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-publishers";

export const queueGroupName = 'tickets-service';

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {        
        //find ticket in question else throw
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // mark the ticket reserved by setting orderId field
        ticket.set({orderId: data.id})
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        //save ticket and ack
        msg.ack();
    }
}

export class OrderCancelledListener extends BaseListener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        //find ticket in question else throw
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // unmark the ticket reserved by setting orderId field to null
        ticket.set({orderId: undefined})
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: undefined
        });

        msg.ack();
    }
}