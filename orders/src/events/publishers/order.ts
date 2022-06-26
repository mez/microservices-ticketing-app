import { BasePublisher, Subjects, OrderCreatedEvent, OrderCancelledEvent } from "@anonytickets/common";


export class OrderCreatedPublisher extends BasePublisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}

export class OrderCancelledPublisher extends BasePublisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}