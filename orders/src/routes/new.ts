import express, { Request, Response } from 'express';
import { 
    BadRequestError,
    NotFoundError,
    OrderCreatedEvent,
    OrderStatus,
    requireAuth,
    validateRequest
} from '@cygnetops/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('Ticket ID must be provided')
], validateRequest, async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket)
        throw new NotFoundError();
    const isReserved = await ticket.isReserved();
    if (isReserved) 
        throw new BadRequestError(`Ticket is already reserved!`)

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    const order = Order.build({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt,
        ticket
    });
    await order.save();

    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        },
        version: order.version
    })
    res.status(201).send(order);
});

export { router as newOrderRouter };