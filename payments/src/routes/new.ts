import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@anonytickets/common';
import { natsWrapper } from '../nats-wrapper';
import { Order } from '../models/Order';
import { stripe } from '../stripe';
import { Payment } from '../models/Payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment';

const router = express.Router()

router.post('/', 
    requireAuth,
    [
    body('token')
        .trim()
        .not()
        .isEmpty(),
    body('orderId')
        .trim()
        .not()
        .isEmpty()
    ], 
    validateRequest,
    async (req: Request, res: Response) => { 
        const {token, orderId} = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Order is already cancelled!');
        }

        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token
        });

        const payment = Payment.build({
            orderId: orderId,
            stripeId: charge.id
        });
        await payment.save();

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        });

        res.status(201).send({id: payment.id}); 
    });


export { router as createChargeRouter }