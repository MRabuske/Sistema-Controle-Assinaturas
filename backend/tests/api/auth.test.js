const request = require('supertest');
const { createApp } = require('../../src/app');

let app;

beforeAll(() => {
  app = createApp(':memory:');
});

afterAll(() => {
  const db = app.get('db');
  if (db) db.close();
});

describe('POST /api/auth/register', () => {
  test('creates new user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: 'test123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@test.com');
    expect(res.body.user.name).toBe('Test User');
  });

  test('rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup', email: 'test@test.com', password: 'test123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email já cadastrado.');
  });

  test('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'No Pass' });

    expect(res.status).toBe(400);
  });

  test('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Short', email: 'short@test.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('mínimo 6');
  });
});

describe('POST /api/auth/login', () => {
  test('returns token for valid credentials (seeded admin)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@subcontrol.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('admin@subcontrol.com');
  });

  test('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@subcontrol.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Email ou senha incorretos.');
  });

  test('rejects non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'test123' });

    expect(res.status).toBe(401);
  });

  test('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('Auth middleware', () => {
  test('rejects request without token', async () => {
    const res = await request(app).get('/api/subscriptions');
    expect(res.status).toBe(401);
  });

  test('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/subscriptions')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
  });
});
