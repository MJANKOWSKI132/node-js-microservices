import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
  try {
    if (!process.env.JWT_KEY) {
      throw new Error('JWT key is null!');
    }
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');

    app.listen(3000, () => {
      console.log("Listening on port 3000!!!");
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
