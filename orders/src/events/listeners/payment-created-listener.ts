import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from "@cygnetops/common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
        const order = await Order.findById(data.orderId);
        if (!order)
            throw new Error(`No such order exists with ID: ${data.orderId}`);
        if (order.status === OrderStatus.Cancelled)
            throw new Error(`The order with ID: ${order.id} has been cancelled`);
        order.set({
            status: OrderStatus.Complete
        });
        await order.save();
        msg.ack();
    }
}