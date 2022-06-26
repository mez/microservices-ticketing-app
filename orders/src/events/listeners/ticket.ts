import { BaseListener, Subjects, TicketCreatedEvent, TicketUpdatedEvent } from "@anonytickets/common"
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";

export const queueGroupName = 'orders-service';

export class TicketCreatedListener extends BaseListener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {        
        //grab info and create our version of a ticket
        const {id, title, price} = data;
        const ticket = Ticket.build({
            id,
            title,
            price
        });

        await ticket.save();
        msg.ack();
    }
}

export class TicketUpdatedListener extends BaseListener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;
    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findByEvent(data);

        if (!ticket) {
            throw new Error('Ticket not found')
        }
        
        const {title, price} = data;
        ticket.set({title, price});
        await ticket.save()

        msg.ack();
    }
}