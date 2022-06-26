import { BasePublisher, Subjects, TicketCreatedEvent, TicketUpdatedEvent } from "@anonytickets/common";


export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}

export class TicketUpdatedPublisher extends BasePublisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}