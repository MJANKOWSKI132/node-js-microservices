import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password'
        })
        .expect(201);
});

it('returns a 400 with an invalid email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'invalidemail',
            password: 'password'
        })
        .expect(400);
})

it('returns a 400 with an invalid password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'p'
        })
        .expect(400);
})

it('returns a 400 with an invalid request body', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com'
        })
        .expect(400);

    await request(app)
        .post('/api/users/signup')
        .send({
            password: 'password'
        })
        .expect(400);
})

it('should return 400 if user already exists', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'user1@test.com',
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'user1@test.com',
            password: 'password2'
        })
        .expect(400);
})

it('sets a cookie after successful signup', async () => {
    const res = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'user1@test.com',
            password: 'password'
        })
        .expect(201);
    
    expect(res.get('Set-Cookie')).toBeDefined();
})