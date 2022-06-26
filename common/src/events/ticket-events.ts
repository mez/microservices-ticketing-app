import { Subjects  } from "./subjects";

export interface TicketData {
    id: string;
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
}

export interface TicketCreatedEvent {
    subject: Subjects.TicketCreated;
    data: TicketData
}


export interface TicketUpdatedEvent {
    subject: Subjects.TicketUpdated;
    data: TicketData
}