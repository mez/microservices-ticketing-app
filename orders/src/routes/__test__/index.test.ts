import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import { Order, OrderStatus } from '../../models/Order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

const createTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        title: 'concert'
    });
    await ticket.save();

    return ticket;
}

it('returns a list of orders for a auth user', async () => {
    
    const t1 = await createTicket();
    const t2 = await createTicket();
    const t3 = await createTicket();
    
    const u1 = global.signin();
    const u2 = global.signin();

    await request(app)
        .post('/api/orders')
        .set('Cookie', u1)
        .send({
            ticketId: t1.id
        })
        .expect(201);

    const {body: order1 } = await request(app)
        .post('/api/orders')
        .set('Cookie', u2)
        .send({
            ticketId: t2.id
        })
        .expect(201);

    const {body: order2 } = await request(app)
        .post('/api/orders')
        .set('Cookie', u2)
        .send({
            ticketId: t3.id
        })
        .expect(201);

    
    const {body: orders} = await request(app)
    .get('/api/orders')
    .set('Cookie', u2)
    .expect(200);

    expect(orders.length).toEqual(2);
    expect(orders[0].id).toEqual(order1.id);
    expect(orders[1].id).toEqual(order2.id);
    expect(orders[0].ticket.id).toEqual(t2.id);
    expect(orders[1].ticket.id).toEqual(t3.id);
    
});