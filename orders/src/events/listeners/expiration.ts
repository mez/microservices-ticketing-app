import { BaseListener, Subjects, ExpirationCompleteEvent, OrderStatus } from "@anonytickets/common"
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { OrderCancelledPublisher } from "../publishers/order";

export const queueGroupName = 'orders-service';

export class ExpirationCompleteListener extends BaseListener<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;
    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {        
        //grab info and create our version of a ticket
        const {orderId} = data;
        const order = await Order.findById(orderId).populate('ticket');
        if (!order) {
            throw new Error('Order not found!');
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled
        });

        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: orderId,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });
        
        msg.ack();
    }
}