import { Subjects  } from "./subjects";

export interface PaymentData {
    id: string;
    orderId: string;
    stripeId: string;
}

export interface PaymentCreatedEvent {
    subject: Subjects.PaymentCreated;
    data: PaymentData
}
