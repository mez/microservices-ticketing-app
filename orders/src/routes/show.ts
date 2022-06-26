import { NotAuthorizedError, NotFoundError, requireAuth } from '@anonytickets/common';
import express, {Request, Response} from 'express';
import { Order } from '../models/Order';

const router = express.Router()

router.get('/:orderId', 
    requireAuth,
    async (req: Request, res: Response) => { 
        const order = await Order.findById(req.params.orderId).populate('ticket');

        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        res.status(200).send(order); 
    });


export { router as showOrderRouter }