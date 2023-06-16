import { 
    requireAuth, 
    validateRequest,
    currentUser
} from '@cygnetops/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.post('/api/tickets', currentUser, requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({
            gt: 0
        })
        .withMessage('Price must be greater than zero')
], validateRequest, async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const { id } = req.currentUser!
    const newTicket = Ticket.build({
        title,
        price,
        userId: id
    });
    await newTicket.save();

    res.status(201).send(newTicket);
})

export { router as createTicketRouter };