import { requireAuth } from '@anonytickets/common';
import express, {Request, Response} from 'express';
import { Order } from '../models/Order';

const router = express.Router()

router.get('/', 
    requireAuth,
    async (req: Request, res: Response) => { 

        const orders = await Order.find({userId: req.currentUser!.id}).populate('ticket');

        res.status(200).send(orders); 
    });


export { router as indexOrderRouter }