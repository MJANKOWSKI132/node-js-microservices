import { Listener, OrderCreatedEvent, Subjects } from "@cygnetops/common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket)
            throw new Error(`No such ticket exists with ID: ${data.ticket.id}`);
        const { id: orderId } = data;
        ticket.set({ orderId });
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: data.id
        });
        msg.ack();
    }
};