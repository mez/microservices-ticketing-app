import { BaseListener, Subjects, OrderCreatedEvent, OrderCancelledEvent } from "@anonytickets/common"
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export const queueGroupName = 'expiration-service';


export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {     
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        
        expirationQueue.add({
            orderId: data.id
        }, {
            delay: delay
        });   
        msg.ack();
    }
}

export class OrderCancelledListener extends BaseListener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        msg.ack();
    }
}