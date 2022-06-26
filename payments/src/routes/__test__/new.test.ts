import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import {Order} from '../../models/Order';
import { OrderStatus } from '@anonytickets/common';
import {stripe} from '../../stripe';
import { Payment } from '../../models/Payment';


it('errors if trying to charged a non existing order', async () => {
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asfsdf',
            orderId: new mongoose.Types.ObjectId().toHexString()
        });

    expect(response.status).toEqual(404);
})

it('errors if order does not belong to logged in user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 10,
        version: 0,
        status: OrderStatus.Created
    });
    await order.save();

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asfsdf',
            orderId: order.id
        })
        .expect(401);

})


it('errors if order is already cancelled', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        price: 10,
        version: 0,
        status: OrderStatus.Cancelled
    });
    await order.save();

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asfsdf',
            orderId: order.id
        })
        .expect(400);
});


it('returns a 204 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        price: 10,
        version: 0,
        status: OrderStatus.Created
    });
    await order.save();

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(1000);
    expect(chargeOptions.currency).toEqual('usd');

    const payment = await Payment.findOne({
        orderId: order.id
    });

    expect(payment).toBeDefined();
});

