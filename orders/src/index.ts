import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  try {
    if (!process.env.JWT_KEY) {
      throw new Error('JWT key is null!');
    }
    if (!process.env.MONGO_URI)
      throw new Error('Mongo URI for orders service is not defined!');
    if (!process.env.NATS_CLUSTER_ID)
      throw new Error('NATS Cluster ID for orders service is not defined!');
    if (!process.env.NATS_URL)
      throw new Error('NATS URL for orders service is not defined!');
    if (!process.env.NATS_CLIENT_ID)
      throw new Error('NATS Client ID for orders service is not defined!');

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
    await mongoose.connect(process.env.MONGO_URI);

    app.listen(3000, () => {
      console.log("Orders server listening on port 3000!!!");
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
