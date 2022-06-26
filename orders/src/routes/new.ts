import express, {Request, Response} from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@anonytickets/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { Ticket } from '../models/Ticket';
import { Order } from '../models/Order';
import { OrderCreatedPublisher } from '../events/publishers/order';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 15 * 60; //15 min

router.post('/',
    requireAuth,
    [
        body('ticketId')
        .not()
        .isEmpty()
        .custom((input:string)=> mongoose.Types.ObjectId.isValid(input))
        .withMessage('TicketId must be provided')

    ],
    validateRequest,
    async (req: Request, res: Response) => { 
        const {ticketId} = req.body;

        // Find the ticket the user wants to order
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }

        // Make sure that this ticket is not reserved
        // query for Order that is for this ticket and not cancelled status
        const isTicketReserved = await ticket.isReserved();

        if (isTicketReserved) {
            throw new BadRequestError('Ticket already reserved.');
        }

        // calculate an expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

        // build the order and save it to the database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });

        await order.save();

        // Publish an event saying an order was created
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            version: order.version,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: order.ticket.id,
                price: order.ticket.price
            }
        });

        res.status(201).send(order); 
    });


export { router as newOrderRouter }