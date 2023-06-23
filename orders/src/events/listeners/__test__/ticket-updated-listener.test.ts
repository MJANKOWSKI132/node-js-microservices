import mongoose, { set } from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedEvent } from "@cygnetops/common";
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);
    
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const data = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'new concert',
        price: 999,
        userId: new mongoose.Types.ObjectId().toHexString()
    } as TicketUpdatedEvent['data'];

    // @ts-ignore
    const msg = {
        ack: jest.fn()
    } as Message;

    return {
        listener,
        msg,
        data,
        ticket
    };
};

it('finds, updates and saves a ticket', async () => {
    const {
        listener,
        msg,
        data
    } = await setup();

    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(data.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const {
        listener,
        msg,
        data
    } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version', async () => {
    const {
        listener,
        msg,
        data
    } = await setup();

    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {
        
    }

    expect(msg.ack).not.toHaveBeenCalled();
});