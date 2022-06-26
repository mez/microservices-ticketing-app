import { BasePublisher, Subjects, PaymentCreatedEvent } from "@anonytickets/common";

export class PaymentCreatedPublisher extends BasePublisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}

