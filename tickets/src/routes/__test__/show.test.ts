import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 400 if the ticket ID supplied is invalid', async () => {
    await request(app)
        .get('/api/tickets/invalid_id')
        .set('Cookie', global.signin())
        .send()
        .expect(400)
})

it('returns a 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(404)
})

it('returns the ticket if the ticket is found', async () => {
    const ticket = {
        title: 'some_title',
        price: 10
    };

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send(ticket)
        .expect(201);

    const { id } = response.body;

    const retrievedTicket = (await request(app)
        .get(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(200)).body;

    expect(retrievedTicket.title).toEqual(ticket.title);
    expect(retrievedTicket.price).toEqual(ticket.price);
})
