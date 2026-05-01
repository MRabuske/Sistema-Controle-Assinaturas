const express = require('express');
const { calcMonthly, validateSubscription, validateAlertDays } = require('../utils/calculations');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = req.app.get('db');
  const { status, category, search, min_value, max_value } = req.query;

  let sql = 'SELECT * FROM subscriptions WHERE user_id = ?';
  const params = [req.userId];

  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
  if (min_value) { sql += ' AND value >= ?'; params.push(parseFloat(min_value)); }
  if (max_value) { sql += ' AND value <= ?'; params.push(parseFloat(max_value)); }

  sql += ' ORDER BY renewal_date ASC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

router.get('/stats', (req, res) => {
  const db = req.app.get('db');
  const all = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').all(req.userId);
  const active = all.filter(s => s.status === 'Ativa');
  const totalMonthly = active.reduce((sum, s) => sum + s.monthly_value, 0);

  res.json({
    total: all.length,
    active: active.length,
    monthly: Math.round(totalMonthly * 100) / 100,
    annual: Math.round(totalMonthly * 12 * 100) / 100,
  });
});

router.get('/:id', (req, res) => {
  const db = req.app.get('db');
  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!sub) return res.status(404).json({ error: 'Assinatura não encontrada.' });
  res.json(sub);
});

router.post('/', (req, res) => {
  const db = req.app.get('db');
  const existingNames = db.prepare('SELECT name FROM subscriptions WHERE user_id = ?').all(req.userId).map(r => r.name);

  const errors = validateSubscription(req.body, existingNames);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { name, category, value, period, start_date, renewal_date, payment, status, notes } = req.body;
  const monthlyValue = calcMonthly(parseFloat(value), period);

  const result = db.prepare(`
    INSERT INTO subscriptions (user_id, name, category, value, period, start_date, renewal_date, payment, status, notes, monthly_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId, name.trim(), category || 'Outros', parseFloat(value), period, start_date || null, renewal_date, payment || '', status || 'Ativa', notes || '', monthlyValue);

  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(sub);
});

router.put('/:id', (req, res) => {
  const db = req.app.get('db');
  const existing = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Assinatura não encontrada.' });

  const existingNames = db.prepare('SELECT name FROM subscriptions WHERE user_id = ? AND id != ?').all(req.userId, req.params.id).map(r => r.name);
  const errors = validateSubscription(req.body, existingNames);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { name, category, value, period, start_date, renewal_date, payment, status, notes } = req.body;
  const monthlyValue = calcMonthly(parseFloat(value), period);

  db.prepare(`
    UPDATE subscriptions SET name=?, category=?, value=?, period=?, start_date=?, renewal_date=?, payment=?, status=?, notes=?, monthly_value=?, updated_at=datetime('now')
    WHERE id=? AND user_id=?
  `).run(name.trim(), category || 'Outros', parseFloat(value), period, start_date || null, renewal_date, payment || '', status || 'Ativa', notes || '', monthlyValue, req.params.id, req.userId);

  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
  res.json(sub);
});

router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  const existing = db.prepare('SELECT id FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Assinatura não encontrada.' });

  db.prepare('DELETE FROM subscriptions WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: 'Assinatura excluída com sucesso.' });
});

router.put('/:id/alert', (req, res) => {
  const db = req.app.get('db');
  const existing = db.prepare('SELECT id FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Assinatura não encontrada.' });

  const { alert_days, alert_enabled } = req.body;

  if (alert_days !== undefined && alert_days !== null) {
    const error = validateAlertDays(alert_days);
    if (error) return res.status(400).json({ error });
  }

  db.prepare(`
    UPDATE subscriptions SET alert_days=?, alert_enabled=?, updated_at=datetime('now')
    WHERE id=? AND user_id=?
  `).run(
    alert_days !== undefined ? alert_days : null,
    alert_enabled !== undefined ? (alert_enabled ? 1 : 0) : 1,
    req.params.id, req.userId
  );

  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
  res.json(sub);
});

module.exports = router;
