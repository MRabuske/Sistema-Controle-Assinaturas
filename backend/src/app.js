const express = require('express');
const cors = require('cors');
const path = require('path');
const { createDatabase, seedDatabase } = require('./database');
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscriptions');
const { authMiddleware } = require('./middleware/auth');
const { validateAlertDays } = require('./utils/calculations');

function createApp(dbPath) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const db = createDatabase(dbPath || path.join(__dirname, '..', 'subcontrol.db'));
  seedDatabase(db);
  app.set('db', db);

  app.use('/api/auth', authRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);

  app.put('/api/settings/alert', authMiddleware, (req, res) => {
    const { default_alert_days } = req.body;
    const error = validateAlertDays(default_alert_days);
    if (error) return res.status(400).json({ error });

    db.prepare('UPDATE settings SET default_alert_days = ? WHERE user_id = ?').run(parseInt(default_alert_days), req.userId);
    const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId);
    res.json(settings);
  });

  app.get('/api/settings', authMiddleware, (req, res) => {
    const db = req.app.get('db');
    let settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId);
    if (!settings) {
      db.prepare('INSERT INTO settings (user_id, default_alert_days) VALUES (?, 3)').run(req.userId);
      settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId);
    }
    res.json(settings);
  });

  app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
    }
  });

  return app;
}

module.exports = { createApp };
