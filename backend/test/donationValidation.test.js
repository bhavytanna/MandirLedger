const request = require('supertest');

const { createApp } = require('../src/app');
const { connect, closeDatabase, clearDatabase } = require('./setupTestDb');

const app = createApp();

let token;

beforeAll(async () => {
  await connect();

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ username: process.env.EDITOR_USERNAME, password: process.env.EDITOR_PASSWORD })
    .expect(200);

  token = loginRes.body.token;
});

afterAll(async () => {
  await closeDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

test('donor_name required when member_id not provided', async () => {
  await request(app)
    .post('/api/donations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      amount: 100,
      payment_mode: 'cash',
    })
    .expect(400);
});

test('amount must be > 0', async () => {
  await request(app)
    .post('/api/donations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      donor_name: 'Anon',
      amount: 0,
      payment_mode: 'cash',
    })
    .expect(400);
});
