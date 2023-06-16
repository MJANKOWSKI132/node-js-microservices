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

    retrievdTicket.title = title;
    retrievdTicket.price = price;

    await retrievdTicket.save();

    res.status(200).send(retrievdTicket);
})

export { router as updateTicketRouter };