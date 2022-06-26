import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import { Order, OrderStatus } from '../../models/Order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('returns an error if ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId
        })
        .expect(404);

})

it('returns an error if ticket is reserved', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'concert'
    });

    await ticket.save();

    const order = Order.build({
        ticket,
        userId: 'randomID',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });

    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id
        })
        .expect(400);
});

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'concert'
    });

    await ticket.save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    const createdOrder = await Order.findById(response.body.id);
    expect(createdOrder).not.toEqual(null);
});

it('publishes an event for new order', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'concert'
    });

    await ticket.save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});