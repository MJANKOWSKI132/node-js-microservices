import express, { Request, Response } from 'express';

const router = express.Router();

router.delete('/api/order/:id', async (req: Request, res: Response) => {
    res.send('Orders delete request sent!');
});

export { router as deleteOrderRouter };