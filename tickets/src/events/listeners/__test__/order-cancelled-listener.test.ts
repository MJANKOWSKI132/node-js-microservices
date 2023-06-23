import mongoose, { set } from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent } from "@cygnetops/common";
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    ticket.set({
        orderId
    })
    await ticket.save();

    const data = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    } as OrderCancelledEvent['data'];

    // @ts-ignore
    const msg = {
        ack: jest.fn()
    } as Message;

    return {
        msg,
        data,
        ticket,
        orderId,
        listener
    };
};

it('updates the ticket, publishes an event and acks the message', async () => {
    const {
        msg,
        data,
        ticket,
        orderId,
        listener
    } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});