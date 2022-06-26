import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@anonytickets/common';
import { Ticket } from '../models/Ticket';
import { natsWrapper } from '../nats-wrapper';
import { TicketCreatedPublisher } from '../events/publishers/ticket-publishers';
const router = express.Router()

router.post('/', 
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

        const ticket = Ticket.build({
            title,
            price,
            userId: req.currentUser!.id
        })

        await ticket.save()

        await new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

        res.status(201).send(ticket); 
    });


export { router as createTicketRouter }