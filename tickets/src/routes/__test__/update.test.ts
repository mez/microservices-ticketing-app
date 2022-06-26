import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import {natsWrapper} from '../../nats-wrapper';
import { Ticket } from '../../models/Ticket';

it('returns a 404 if ticket not found', async () => {
    const id: string = new mongoose.Types.ObjectId().toHexString();
    const title = 'concert'
    const price = 20;
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({title, price})
        .expect(404);
        
})

it('returns a 401 if user is not auth', async () => {
    const id: string = new mongoose.Types.ObjectId().toHexString();
    const title = 'concert'
    const price = 20;
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({title, price})
        .expect(401);
})

it('returns a 401 if user doesnt own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '2 pac',
            price: 450
        }).expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: '3 pac',
            price: 450
        })
        .expect(401)
})

it('returns a 400 if user provides invalid title or price', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: '2 pac',
            price: 450
        }).expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 450
        })
        .expect(400)

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'dsfasdfasdf sdfsdf',
            price: -450
        })
        .expect(400)
})

it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: '2 pac',
            price: 450
        }).expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '4 pac',
            price: 5000
        })
        .expect(200);

    const ticket = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticket.body.title).toEqual('4 pac')
    expect(ticket.body.price).toEqual(5000)
})


it('ticket updated event is published', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: '2 pac',
            price: 450
        }).expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '4 pac',
            price: 5000
        })
        .expect(200);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('ticket updated is rejected if ticket is reserved.', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: '2 pac',
            price: 450
        }).expect(201);

    const ticket = await Ticket.findById(response.body.id);
    ticket?.set({
        orderId: new mongoose.Types.ObjectId().toHexString()
    });
    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '4 pac',
            price: 5000
        })
        .expect(400);

        expect(natsWrapper.client.publish).toHaveBeenCalled();
})
