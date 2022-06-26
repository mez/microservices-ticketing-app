import { BasePublisher, ExpirationCompleteEvent, Subjects } from "@anonytickets/common";

export class ExpirationCompletePublisher extends BasePublisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}