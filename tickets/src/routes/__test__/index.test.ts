import request from 'supertest';
import { app } from '../../app';

it('can fetch a list of tickets', async () => {
    const numTickets = 3;

    for (let i = 1; i <= numTickets; ++i) {
        const ticket = {
            title: `title${i}`,
            price: i * 10
        };

        const response = await request(app)
            .post('/api/tickets')
            .set('Cookie', global.signin())
            .send(ticket)
            .expect(201);
    }

    const response = await request(app)
        .get('/api/tickets')
        .set('Cookie', global.signin())
        .send()
        .expect(200);

    const ticketsRetrieved = response.body;
    expect(ticketsRetrieved.length).toEqual(numTickets);
    for (let i = 1; i <= numTickets; ++i) {
        expect(ticketsRetrieved[i - 1].title).toEqual(`title${i}`);
        expect(ticketsRetrieved[i - 1].price).toEqual(i * 10);
    }
})