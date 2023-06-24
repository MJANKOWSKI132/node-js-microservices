import { PaymentCreatedEvent, Publisher, Subjects } from "@cygnetops/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}