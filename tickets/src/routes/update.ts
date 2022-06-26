import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@anonytickets/common';
import { Ticket } from '../models/Ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-publishers';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router()

router.put('/:id', 
    requireAuth,
    [
    body('title')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Title is required!'),
    body('price')
        .isFloat({
            gt: 0
        })
        .withMessage('Price must be greater than zero')
    ], 
    validateRequest,
    async (req: Request, res: Response) => { 
        const {title, price} = req.body;
        const id = req.params.id;

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (ticket.orderId) {
            throw new BadRequestError('Ticket is reserved!');
        }

        ticket.set({
            title,
            price
        })

        await ticket.save()
        
        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

        res.status(200).send(ticket); 
    });


export { router as updateTicketRouter }