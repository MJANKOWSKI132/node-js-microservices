import Queue from "bull";
import { ExportCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from "../nats-wrapper";

interface Payload {
    orderId: string;
};

const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async job => {
    const publisher = new ExportCompletePublisher(natsWrapper.client);
    const { data: { orderId }} = job;
    publisher.publish({ orderId });
});

export { expirationQueue };

