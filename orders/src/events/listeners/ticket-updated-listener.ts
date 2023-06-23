import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@cygnetops/common';
import { Ticket } from '../../models/ticket';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
        const { 
            id: ticketId, 
            title, 
            price 
        } = data;
        const fetchedTicket = await Ticket.findByEvent(data);
        if (!fetchedTicket)
            throw new Error(`Ticket with ID: ${ticketId} not found!`);
        fetchedTicket.set({
            title,
            price
        })
        await fetchedTicket.save();

        msg.ack();
    }
}