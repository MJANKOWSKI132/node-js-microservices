import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { Order, OrderStatus } from "../../../models/order";
import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent } from "@cygnetops/common";

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'asdf',
        expiresAt: new Date(),
        ticket
    })
    await order.save();

    // @ts-ignore
    const msg = {
        ack: jest.fn()
    } as Message;
    
    const data = {
        orderId: order.id
    } as ExpirationCompleteEvent['data'];

    return {
        listener,
        order,
        ticket,
        data,
        msg
    };
};

it('updates the order status to cancelled', async () => {
    const {
        listener,
        order,
        data,
        msg
    } = await setup();

    await listener.onMessage(data, msg);

    const matchingOrder = await Order.findById(order.id);

    expect(matchingOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
    const {
        listener,
        order,
        data,
        msg
    } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(eventData.id).toEqual(order.id);
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
