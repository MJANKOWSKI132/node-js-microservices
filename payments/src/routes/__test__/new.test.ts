import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@cygnetops/common';
import { stripe } from '../../stripe';

const generateId = () => new mongoose.Types.ObjectId().toHexString();

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdf',
            orderId: generateId()
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: generateId(),
        userId: generateId(),
        version: 0,
        price: 20,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdf',
            orderId: order.id
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = generateId();

    const order = Order.build({
        id: generateId(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asdf',
            orderId: order.id
        })
        .expect(401);
});

it('returns a 201 with valid inputs', async () => {
    const userId = generateId();

    const order = Order.build({
        id: generateId(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Created
    })

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(20 * 100);
    expect(chargeOptions.currency).toEqual('usd');
})