import mongoose, { set } from "mongoose";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus, TicketUpdatedEvent } from "@cygnetops/common";
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket.save();

    const data = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: ticket.userId,
        expiresAt: 'asdf',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    } as OrderCreatedEvent['data'];

    // @ts-ignore
    const msg = {
        ack: jest.fn()
    } as Message;

    return {
        listener,
        ticket,
        data,
        msg
    };
};

it('sets the userId of the ticket', async () => {
    const {
        listener,
        ticket,
        data,
        msg
    } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const {
        listener,
        data,
        msg
    } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
    const {
        listener,
        data,
        msg
    } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]) as TicketUpdatedEvent['data'];
    expect(data.id).toEqual(ticketUpdatedData.orderId);
});