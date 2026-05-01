const request = require('supertest');
const { createApp } = require('../../src/app');

let app, token;

beforeAll(async () => {
  app = createApp(':memory:');
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@subcontrol.com', password: 'admin123' });
  token = res.body.token;
});

afterAll(() => {
  const db = app.get('db');
  if (db) db.close();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe('GET /api/subscriptions', () => {
  test('returns seeded subscriptions', async () => {
    const res = await request(app).get('/api/subscriptions').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
  });

  test('filters by status', async () => {
    const res = await request(app).get('/api/subscriptions?status=Ativa').set(auth());
    expect(res.status).toBe(200);
    res.body.forEach(s => expect(s.status).toBe('Ativa'));
  });

  test('filters by category', async () => {
    const res = await request(app).get('/api/subscriptions?category=Streaming').set(auth());
    expect(res.status).toBe(200);
    res.body.forEach(s => expect(s.category).toBe('Streaming'));
  });

  test('filters by search term', async () => {
    const res = await request(app).get('/api/subscriptions?search=netflix').set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Netflix Premium');
  });

  test('filters by value range', async () => {
    const res = await request(app).get('/api/subscriptions?min_value=50&max_value=90').set(auth());
    expect(res.status).toBe(200);
    res.body.forEach(s => {
      expect(s.value).toBeGreaterThanOrEqual(50);
      expect(s.value).toBeLessThanOrEqual(90);
    });
  });
});

describe('GET /api/subscriptions/stats', () => {
  test('returns correct totals', async () => {
    const res = await request(app).get('/api/subscriptions/stats').set(auth());
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(6);
    expect(res.body.active).toBe(4);
    expect(res.body.monthly).toBeGreaterThan(0);
    expect(res.body.annual).toBeCloseTo(res.body.monthly * 12, 0);
  });
});

describe('POST /api/subscriptions', () => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  test('creates subscription with valid data (HU-001)', async () => {
    const res = await request(app).post('/api/subscriptions').set(auth())
      .send({ name: 'GitHub Copilot', category: 'Produtividade', value: 19.00, period: 'Mensal', renewal_date: tomorrow, status: 'Ativa' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('GitHub Copilot');
    expect(res.body.monthly_value).toBeCloseTo(19.00, 2);
  });

  test('calculates monthly for Anual period (CA6)', async () => {
    const res = await request(app).post('/api/subscriptions').set(auth())
      .send({ name: 'Amazon Prime', value: 120.00, period: 'Anual', renewal_date: tomorrow, status: 'Ativa' });
    expect(res.status).toBe(201);
    expect(res.body.monthly_value).toBeCloseTo(10.00, 2);
    expect(res.body.category).toBe('Outros');
  });

  test('rejects duplicate name case-insensitive (CA4/MSG003)', async () => {
    const res = await request(app).post('/api/subscriptions').set(auth())
      .send({ name: 'netflix premium', value: 55.90, period: 'Mensal', renewal_date: tomorrow, status: 'Ativa' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('Já existe uma assinatura cadastrada com este nome de serviço.');
  });

  test('rejects negative value (MSG001)', async () => {
    const res = await request(app).post('/api/subscriptions').set(auth())
      .send({ name: 'Bad Value', value: -10, period: 'Mensal', renewal_date: tomorrow, status: 'Ativa' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('O valor informado é inválido. Informe um valor numérico positivo.');
  });

  test('rejects past renewal date (MSG002)', async () => {
    const res = await request(app).post('/api/subscriptions').set(auth())
      .send({ name: 'Old Sub', value: 10, period: 'Mensal', renewal_date: '2020-01-01', status: 'Ativa' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('A data de renovação não pode ser anterior à data atual.');
  });
});

describe('PUT /api/subscriptions/:id', () => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  test('updates subscription', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const id = list.body[0].id;
    const res = await request(app).put(`/api/subscriptions/${id}`).set(auth())
      .send({ name: 'Netflix Premium Atualizado', value: 59.90, period: 'Mensal', renewal_date: tomorrow, status: 'Ativa' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Netflix Premium Atualizado');
  });

  test('returns 404 for non-existent id', async () => {
    const res = await request(app).put('/api/subscriptions/99999').set(auth())
      .send({ name: 'X', value: 10, period: 'Mensal', renewal_date: tomorrow, status: 'Ativa' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/subscriptions/:id', () => {
  test('deletes subscription', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const lastId = list.body[list.body.length - 1].id;
    const res = await request(app).delete(`/api/subscriptions/${lastId}`).set(auth());
    expect(res.status).toBe(200);
    const check = await request(app).get(`/api/subscriptions/${lastId}`).set(auth());
    expect(check.status).toBe(404);
  });
});

describe('PUT /api/subscriptions/:id/alert (HU-003)', () => {
  test('sets individual alert days', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const id = list.body[0].id;
    const res = await request(app).put(`/api/subscriptions/${id}/alert`).set(auth())
      .send({ alert_days: 5, alert_enabled: true });
    expect(res.status).toBe(200);
    expect(res.body.alert_days).toBe(5);
    expect(res.body.alert_enabled).toBe(1);
  });

  test('disables alert', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const id = list.body[0].id;
    const res = await request(app).put(`/api/subscriptions/${id}/alert`).set(auth())
      .send({ alert_enabled: false });
    expect(res.status).toBe(200);
    expect(res.body.alert_enabled).toBe(0);
  });

  test('rejects alert_days out of range (MSG009)', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const id = list.body[0].id;
    const res = await request(app).put(`/api/subscriptions/${id}/alert`).set(auth())
      .send({ alert_days: 50 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('A antecedência do alerta deve ser um valor entre 1 e 30 dias.');
  });
});

describe('PUT /api/settings/alert (HU-003 global)', () => {
  test('updates global alert days', async () => {
    const res = await request(app).put('/api/settings/alert').set(auth())
      .send({ default_alert_days: 7 });
    expect(res.status).toBe(200);
    expect(res.body.default_alert_days).toBe(7);
  });

  test('rejects invalid global alert (MSG009)', async () => {
    const res = await request(app).put('/api/settings/alert').set(auth())
      .send({ default_alert_days: 0 });
    expect(res.status).toBe(400);
  });
});
