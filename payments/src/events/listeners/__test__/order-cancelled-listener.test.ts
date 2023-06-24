import { OrderCancelledEvent, OrderStatus } from "@cygnetops/common";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import mongoose from "mongoose";
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    });

    await order.save();

    const data = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString()
        }
    } as OrderCancelledEvent['data'];

    // @ts-ignore
    const msg = {
        ack: jest.fn()
    } as Message;

    return {
        listener,
        order,
        data,
        msg
    };
}

it('should set the status of the order to cancelled', async () => {
    const {
        listener,
        order,
        data,
        msg
    } = await setup();

    await listener.onMessage(data, msg);

    const matchingOrder = await Order.findById(order.id);

    expect(matchingOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('acks the message', async () => {
    const {
        listener,
        order,
        data,
        msg
    } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})