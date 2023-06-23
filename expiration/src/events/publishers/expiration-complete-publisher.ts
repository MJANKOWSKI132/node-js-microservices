import { ExpirationCompleteEvent, Publisher, Subjects } from "@cygnetops/common";

export class ExportCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}