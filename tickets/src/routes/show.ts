import { 
    requireAuth, 
    validateRequest,
    currentUser,
    NotFoundError,
    BadRequestError
} from '@cygnetops/common';
import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/api/tickets/:id', currentUser, requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequestError('ID provided is not valid!'));
    }
    const retrievdTicket = await Ticket.findById(id);
    if (!retrievdTicket) {
        return next(new NotFoundError());
    }
    res.status(200).send(retrievdTicket);
})

export { router as showTicketRouter };