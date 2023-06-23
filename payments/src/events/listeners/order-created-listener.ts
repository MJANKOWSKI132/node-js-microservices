import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@cygnetops/common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    readonly queueGroupName = QUEUE_GROUP_NAME;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        });

        await order.save();

        msg.ack();
    }
    
}