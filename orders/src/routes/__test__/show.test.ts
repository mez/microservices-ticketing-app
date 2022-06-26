import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import { Order, OrderStatus } from '../../models/Order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('fetches the order', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'concert'
    });

    await ticket.save();

    const u1 = global.signin();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', u1)
        .send({
            ticketId: ticket.id
        })
        .expect(201);
    
    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', u1)
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if try to fetch order not yours', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'concert'
    });

    await ticket.save();

    const u1 = global.signin();
    const u2 = global.signin();

    const {body: order} = await request(app)
        .post('/api/orders')
        .set('Cookie', u1)
        .send({
            ticketId: ticket.id
        })
        .expect(201);
    
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', u2)
        .expect(401);

});