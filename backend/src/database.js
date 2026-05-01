const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { calcMonthly } = require('./utils/calculations');

function createDatabase(dbPath) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Outros',
      value REAL NOT NULL,
      period TEXT NOT NULL,
      start_date TEXT,
      renewal_date TEXT NOT NULL,
      payment TEXT DEFAULT '',
      status TEXT DEFAULT 'Ativa',
      notes TEXT DEFAULT '',
      monthly_value REAL NOT NULL,
      alert_days INTEGER,
      alert_enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, name COLLATE NOCASE)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      default_alert_days INTEGER DEFAULT 3,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  return db;
}

function seedDatabase(db) {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@subcontrol.com');
  if (existingUser) return;

  const hash = bcrypt.hashSync('admin123', 10);
  const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run('Admin', 'admin@subcontrol.com', hash);
  const userId = result.lastInsertRowid;

  db.prepare('INSERT INTO settings (user_id, default_alert_days) VALUES (?, ?)').run(userId, 3);

  const today = new Date();
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r.toISOString().split('T')[0]; };

  const subs = [
    { name: 'Netflix Premium', category: 'Streaming', value: 55.90, period: 'Mensal', renewal: addDays(today, 3), payment: 'Cartão de Crédito', status: 'Ativa' },
    { name: 'Spotify Família', category: 'Música', value: 34.90, period: 'Mensal', renewal: addDays(today, 8), payment: 'Cartão de Crédito', status: 'Ativa' },
    { name: 'iCloud 200GB', category: 'Armazenamento/Cloud', value: 50.00, period: 'Anual', renewal: addDays(today, 60), payment: 'Débito Automático', status: 'Ativa' },
    { name: 'Smart Fit', category: 'Saúde/Academia', value: 89.90, period: 'Mensal', renewal: addDays(today, 12), payment: 'Cartão de Débito', status: 'Pausada' },
    { name: 'HBO Max', category: 'Streaming', value: 34.90, period: 'Mensal', renewal: addDays(today, 25), payment: 'Cartão de Crédito', status: 'Cancelada' },
    { name: 'Duolingo Plus', category: 'Educação', value: 41.90, period: 'Mensal', renewal: addDays(today, 5), payment: 'Pix', status: 'Ativa' },
  ];

  const insert = db.prepare(`
    INSERT INTO subscriptions (user_id, name, category, value, period, renewal_date, payment, status, monthly_value, alert_enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (const s of subs) {
    insert.run(userId, s.name, s.category, s.value, s.period, s.renewal, s.payment, s.status, calcMonthly(s.value, s.period));
  }
}

let _db;
function getDatabase(dbPath) {
  if (!_db) {
    _db = createDatabase(dbPath || path.join(__dirname, '..', 'subcontrol.db'));
    seedDatabase(_db);
  }
  return _db;
}

function closeDatabase() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

module.exports = { createDatabase, seedDatabase, getDatabase, closeDatabase };
