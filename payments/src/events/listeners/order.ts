import { BaseListener, Subjects, OrderCreatedEvent, OrderCancelledEvent, OrderStatus } from "@anonytickets/common"
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";

export const queueGroupName = 'payments-service';

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            version: data.version,
            userId: data.userId
        });

        await order.save();

        //save ticket and ack
        msg.ack();
    }
}

export class OrderCancelledListener extends BaseListener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {

        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });

        if (!order) {
            throw new Error('Order not found!');
        }

        order.set({status: OrderStatus.Cancelled});
        await order.save();

        msg.ack();
    }
}