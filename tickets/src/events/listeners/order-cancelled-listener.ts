import { Listener, OrderCancelledEvent, Subjects } from "@cygnetops/common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message): Promise<void> {
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket)
            throw new Error(`No such ticket with ID: ${data.ticket.id} exists!`);
        ticket.set({
            orderId: undefined
        });
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: undefined
        })
        msg.ack();
    }
};