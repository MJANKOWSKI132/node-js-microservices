import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  try {
    if (!process.env.JWT_KEY) {
      throw new Error('JWT key is null!');
    }
    if (!process.env.MONGO_URI)
      throw new Error('Mongo URI for tickets service is not defined!');

    await mongoose.connect(process.env.MONGO_URI);

    app.listen(3000, () => {
      console.log("Tickets server listening on port 3000!!!");
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
