import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  try {
    if (!process.env.NATS_CLUSTER_ID)
      throw new Error('NATS Cluster ID for tickets service is not defined!');
    if (!process.env.NATS_URL)
      throw new Error('NATS URL for tickets service is not defined!');
    if (!process.env.NATS_CLIENT_ID)
      throw new Error('NATS Client ID for tickets service is not defined!');

    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID, 
      process.env.NATS_CLIENT_ID, 
      process.env.NATS_URL
    )
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit(0);
    })

    process.on('SIGINT', natsWrapper.client.close);
    process.on('SIGTERM', natsWrapper.client.close);

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
