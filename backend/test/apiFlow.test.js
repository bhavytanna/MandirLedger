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

test('end-to-end: member -> donation -> pending -> receipt -> logs', async () => {
  const memberRes = await request(app)
    .post('/api/members')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Rajesh Patel',
      phone: '8888888888',
      address: 'Main Road',
      family_name: 'Patel',
    })
    .expect(201);

  const member = memberRes.body.member;
  expect(member.member_id).toMatch(/^M\d{3}$/);

  const donationRes = await request(app)
    .post('/api/donations')
    .set('Authorization', `Bearer ${token}`)
    .send({
      member_id: member.member_id,
      amount: 2000,
      donation_type: 'Annual',
      payment_mode: 'cash',
      transaction_reference: '',
      donated_at: new Date().toISOString(),
    })
    .expect(201);

  const donation = donationRes.body.donation;
  expect(donation.donation_id).toMatch(/^D\d{4}$/);
  expect(donation.donor_name).toBe('Rajesh Patel');

  const year = new Date().getFullYear();
  const pendingRes = await request(app)
    .get(`/api/pending?year=${year}`)
    .expect(200);

  expect(pendingRes.body.items.length).toBe(0);

  const receiptRes = await request(app)
    .post(`/api/receipts/from-donation/${donation.donation_id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(201);

  const receipt = receiptRes.body.receipt;
  expect(receipt.receipt_id).toMatch(/^R\d{5}$/);

  await request(app)
    .get(`/api/receipts/${receipt.receipt_id}/pdf`)
    .expect(200)
    .expect('Content-Type', /pdf/);

  const logsRes = await request(app)
    .get('/api/activity-logs')
    .expect(200);

  expect(logsRes.body.total).toBeGreaterThanOrEqual(3);
});

test('reject write operations without authentication', async () => {
  await request(app)
    .post('/api/members')
    .send({ name: 'X', phone: '123456' })
    .expect(401);
});
