import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided ID does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'updated_title',
            price: 20
        })
        .expect(404)

});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'updated_title',
            price: 20
        })
        .expect(401)
});

it('returns a 401 if the user does not own the ticket', async () => {
    const ticket = {
        title: 'some_title',
        price: 10
    };

    const { body: originalTicket } = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send(ticket)
        .expect(201);

    await request(app)
        .put(`/api/tickets/${originalTicket.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'updated_title',
            price: 20
        })
        .expect(401)

    const { body: afterTicket } = await request(app)
        .get(`/api/tickets/${originalTicket.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(200);

    expect(originalTicket.title).toEqual(afterTicket.title);
    expect(originalTicket.price).toEqual(afterTicket.price);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
    const ticket = {
        title: 'some_title',
        price: 10
    };

    const cookie = global.signin();

    const { body: originalTicket } = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send(ticket)
        .expect(201);

    await request(app)
        .put(`/api/tickets/${originalTicket.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 20
        })
        .expect(400)

    await request(app)
        .put(`/api/tickets/${originalTicket.id}`)
        .set('Cookie', cookie)
        .send({
            price: 20
        })
        .expect(400)

    await request(app)
        .put(`/api/tickets/${originalTicket.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'updated_title',
            price: -1
        })
        .expect(400)

    await request(app)
        .put(`/api/tickets/${originalTicket.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'updated_title',
        })
        .expect(400)
});

it('updates the ticket provided valid inputs', async () => {
    const ticket = {
        title: 'some_title',
        price: 10
    };

    const updatedTitle = 'updated_title';
    const updatedPrice = 20;

    const cookie = global.signin();

    const { body: { id } } = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send(ticket)
        .expect(201);

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: updatedTitle,
            price: updatedPrice
        })
        .expect(200)

    const { body: afterTicket } = await request(app)
        .get(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(afterTicket.title).toEqual(updatedTitle);
    expect(afterTicket.price).toEqual(updatedPrice);
});

it('publishes an event', async () => {
    const ticket = {
        title: 'some_title',
        price: 10
    };

    const updatedTitle = 'updated_title';
    const updatedPrice = 20;

    const cookie = global.signin();

    const { body: { id } } = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send(ticket)
        .expect(201);

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send({
            title: updatedTitle,
            price: updatedPrice
        })
        .expect(200)

    const { body: afterTicket } = await request(app)
        .get(`/api/tickets/${id}`)
        .set('Cookie', cookie)
        .send()
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
})