import { BaseListener, Subjects, PaymentCreatedEvent, OrderStatus } from "@anonytickets/common"
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";

export const queueGroupName = 'orders-service';

export class PaymentCreatedListener extends BaseListener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {        
        //grab info and create our version of a ticket
        const {orderId} = data;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found!');
        }

        order.set({
            status: OrderStatus.Complete
        });

        await order.save();
        
        msg.ack();
    }
}