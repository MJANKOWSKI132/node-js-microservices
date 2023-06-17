import { 
    requireAuth, 
    validateRequest,
    currentUser,
    BadRequestError,
    NotFoundError,
    NotAuthorizedError
} from '@cygnetops/common';
import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import mongoose from 'mongoose';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', currentUser, requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({
            gt: 0
        })
        .withMessage('Price must be greater than zero')
], validateRequest, async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequestError('ID provided is not valid!'));
    }
    const retrievdTicket = await Ticket.findById(id);
    if (!retrievdTicket) {
        return next(new NotFoundError());
    }
    const { id: currentUserId } = req.currentUser!;

    if (currentUserId !== retrievdTicket.userId)
        return next(new NotAuthorizedError());

    const { title, price } = req.body;

    retrievdTicket.set({
        title,
        price
    })

    await retrievdTicket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: retrievdTicket.id,
        version: -1,
        price: retrievdTicket.price,
        userId: retrievdTicket.userId,
        title: retrievdTicket.title
    });
    res.status(200).send(retrievdTicket);
})

export { router as updateTicketRouter };