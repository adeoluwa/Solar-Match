const request = require('supertest');

// app.js loads the users routes, which load the email queue, which opens a Redis
// connection. Mock the queue so the test doesn't need Redis and Jest can exit cleanly.
jest.mock('./shared/queue/emailQueue', () => ({
  sendWelcomeEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendOrderConfirmationEmail: jest.fn(),
}));

const app = require('./app');

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('unknown routes', () => {
  it('returns 404 from the notFound middleware', async () => {
    const res = await request(app).get('/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});