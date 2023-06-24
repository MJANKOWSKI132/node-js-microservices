import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    requireAuth,
    validateRequest,
    BadRequestError,
    NotFoundError,
    NotAuthorizedError,
    OrderStatus
} from '@cygnetops/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', requireAuth, [
    body('token')
        .not()
        .isEmpty(),
    body('orderId')
        .not()
        .isEmpty()
], validateRequest, async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    const order = await Order.findById(orderId);
    if (!order)
        throw new NotFoundError();
    if (req.currentUser!.id !== order.userId)
        throw new NotAuthorizedError();
    if (order.status === OrderStatus.Cancelled)
        throw new BadRequestError(`The order with ID: ${orderId} is cancelled`);
    const stripeResponse = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token
    })
    const payment = Payment.build({
        orderId,
        stripeId: stripeResponse.id
    });
    await payment.save();
    new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId,
        stripeId: stripeResponse.id
    })
    res.status(201).send({
        id: stripeResponse.id
    });
});

export { router as createChargeRouter };