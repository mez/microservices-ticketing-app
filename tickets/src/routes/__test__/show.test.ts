import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import mongoose from 'mongoose';

it('returns a 404 if ticket not found', async () => {
    const id: string = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .get(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(404);
        
})

it('returns the ticket if found', async () => {
    const title = 'concert'
    const price = 20;


    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price
        })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200)

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
})