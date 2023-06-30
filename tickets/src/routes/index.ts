import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
    const retrievdTickets = await Ticket.find({
        orderId: undefined
    });
    res.status(200).send(retrievdTickets);
})

export { router as indexRouter };