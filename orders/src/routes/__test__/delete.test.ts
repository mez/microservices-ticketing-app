import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import { Order, OrderStatus } from '../../models/Order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('can cancel an order and published an event on ordercancelled', async () => {
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
    
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', u1)
        .expect(204);

    const cancelledOrder = await Order.findById(order.id);

    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

});

