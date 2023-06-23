import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import { TicketCreatedEvent } from "@cygnetops/common";
import { Message } from 'node-nats-streaming';
import { Ticket } from "../../../models/ticket";

const setup = async () => {
    const listener = new TicketCreatedListener(natsWrapper.client);
    const data = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString()
    } as TicketCreatedEvent['data'];

    // @ts-ignore
    const msg = {
        ack: jest.fn()
    } as Message;

    return {
        listener,
        data,
        msg
    };
};

it('creates and saves a ticket', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);
    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acknowledges the messages', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});