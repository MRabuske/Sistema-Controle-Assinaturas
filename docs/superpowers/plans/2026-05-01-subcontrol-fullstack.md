# SubControl Full-Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack SubControl subscription management system with login, CRUD API, SQLite database, React frontend, and comprehensive test suite (unit, API, E2E).

**Architecture:** Express REST API with JWT auth serving a React SPA. SQLite stores users, subscriptions, and settings. The frontend calls the API for all data operations. Tests cover business logic (Jest unit), endpoints (Jest+Supertest), and user flows (Cypress E2E).

**Tech Stack:** Node.js, Express, better-sqlite3, jsonwebtoken, bcryptjs, React, Vite, Jest, Supertest, Cypress

---

## File Map

### Backend (`backend/`)
| File | Responsibility |
|------|---------------|
| `src/app.js` | Express app setup, middleware, routes. Exported for Supertest. |
| `src/server.js` | Starts HTTP server on port 3001. |
| `src/database.js` | SQLite connection, table creation, seed data. |
| `src/middleware/auth.js` | JWT verification middleware. |
| `src/routes/auth.js` | POST /register, POST /login |
| `src/routes/subscriptions.js` | Full CRUD + /stats + /alert endpoints |
| `src/utils/calculations.js` | calcMonthly, validateSubscription, validateAlertDays |
| `tests/unit/calculations.test.js` | Unit tests for calcMonthly |
| `tests/unit/validations.test.js` | Unit tests for validation functions |
| `tests/api/auth.test.js` | API tests for auth endpoints |
| `tests/api/subscriptions.test.js` | API tests for subscription CRUD, filters, alerts |
| `package.json` | Dependencies and scripts |
| `jest.config.js` | Jest configuration |

### Frontend (`frontend/`)
| File | Responsibility |
|------|---------------|
| `index.html` | HTML entry point |
| `src/main.jsx` | React root render |
| `src/App.jsx` | Router, auth state, toast system |
| `src/services/api.js` | Fetch wrapper with JWT header |
| `src/pages/Login.jsx` | Login/register form |
| `src/pages/Cadastrar.jsx` | HU-001: subscription form |
| `src/pages/Consultar.jsx` | HU-002: list, filters, chart, summary |
| `src/pages/Alertas.jsx` | HU-003: alerts config, timeline |
| `src/components/Navbar.jsx` | Top navigation bar |
| `src/components/Modal.jsx` | Confirmation modal |
| `src/components/Toast.jsx` | Toast notification system |
| `src/components/DonutChart.jsx` | SVG donut chart |
| `package.json` | Dependencies and scripts |
| `vite.config.js` | Vite config with API proxy |

### E2E (`cypress/`)
| File | Responsibility |
|------|---------------|
| `cypress.config.js` | Cypress configuration |
| `support/commands.js` | Login helper command |
| `e2e/login.cy.js` | Login flow tests |
| `e2e/cadastrar.cy.js` | HU-001 E2E tests |
| `e2e/consultar.cy.js` | HU-002 E2E tests |
| `e2e/alertas.cy.js` | HU-003 E2E tests |
| `package.json` | Cypress dependency |

---

## Task 1: Initialize Backend Project

**Files:**
- Create: `backend/package.json`
- Create: `backend/jest.config.js`
- Create: `backend/.gitignore`

- [ ] **Step 1: Create backend/package.json**

```json
{
  "name": "subcontrol-backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest --verbose",
    "test:unit": "jest tests/unit --verbose",
    "test:api": "jest tests/api --verbose",
    "test:coverage": "jest --coverage --verbose"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^11.0.0",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

- [ ] **Step 2: Create backend/jest.config.js**

```js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
};
```

- [ ] **Step 3: Create backend/.gitignore**

```
node_modules/
*.db
coverage/
```

- [ ] **Step 4: Install dependencies**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npm install`
Expected: `added XX packages` with no errors.

- [ ] **Step 5: Commit**

```bash
git add backend/package.json backend/jest.config.js backend/.gitignore backend/package-lock.json
git commit -m "chore: initialize backend project with Express, SQLite, Jest"
```

---

## Task 2: Backend Utility Functions + Unit Tests (TDD)

**Files:**
- Create: `backend/src/utils/calculations.js`
- Create: `backend/tests/unit/calculations.test.js`
- Create: `backend/tests/unit/validations.test.js`

- [ ] **Step 1: Write failing unit tests for calcMonthly**

Create `backend/tests/unit/calculations.test.js`:

```js
const { calcMonthly, validateSubscription, validateAlertDays } = require('../../src/utils/calculations');

describe('calcMonthly', () => {
  test('Semanal: multiplies value by 4.33', () => {
    expect(calcMonthly(10, 'Semanal')).toBeCloseTo(43.3, 1);
  });

  test('Mensal: returns same value', () => {
    expect(calcMonthly(55.90, 'Mensal')).toBeCloseTo(55.90, 2);
  });

  test('Trimestral: divides by 3', () => {
    expect(calcMonthly(150, 'Trimestral')).toBeCloseTo(50, 2);
  });

  test('Semestral: divides by 6', () => {
    expect(calcMonthly(600, 'Semestral')).toBeCloseTo(100, 2);
  });

  test('Anual: divides by 12', () => {
    expect(calcMonthly(50, 'Anual')).toBeCloseTo(4.17, 2);
  });

  test('unknown period throws error', () => {
    expect(() => calcMonthly(10, 'Diario')).toThrow('Periodicidade inválida');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npx jest tests/unit/calculations.test.js --verbose`
Expected: FAIL — `Cannot find module '../../src/utils/calculations'`

- [ ] **Step 3: Implement calcMonthly**

Create `backend/src/utils/calculations.js`:

```js
const VALID_PERIODS = ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'];
const VALID_CATEGORIES = ['Streaming', 'Música', 'Produtividade', 'Saúde/Academia', 'Armazenamento/Cloud', 'Educação', 'Jogos', 'Delivery', 'Seguros', 'Outros'];
const VALID_STATUSES = ['Ativa', 'Pausada', 'Cancelada'];
const VALID_PAYMENTS = ['Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Pix', 'Débito Automático', ''];

function calcMonthly(value, period) {
  switch (period) {
    case 'Semanal': return value * 4.33;
    case 'Mensal': return value;
    case 'Trimestral': return value / 3;
    case 'Semestral': return value / 6;
    case 'Anual': return value / 12;
    default: throw new Error('Periodicidade inválida');
  }
}

function validateSubscription(data, existingNames = []) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Nome do serviço é obrigatório.' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Nome do serviço deve ter no máximo 100 caracteres.' });
  } else if (existingNames.some(n => n.toLowerCase() === data.name.trim().toLowerCase())) {
    errors.push({ field: 'name', message: 'Já existe uma assinatura cadastrada com este nome de serviço.' });
  }

  const value = parseFloat(data.value);
  if (isNaN(value) || value <= 0) {
    errors.push({ field: 'value', message: 'O valor informado é inválido. Informe um valor numérico positivo.' });
  }

  if (!data.period || !VALID_PERIODS.includes(data.period)) {
    errors.push({ field: 'period', message: 'Periodicidade é obrigatória.' });
  }

  if (!data.renewal_date) {
    errors.push({ field: 'renewal_date', message: 'Data de renovação é obrigatória.' });
  } else {
    const renewal = new Date(data.renewal_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    renewal.setHours(0, 0, 0, 0);
    if (renewal < today) {
      errors.push({ field: 'renewal_date', message: 'A data de renovação não pode ser anterior à data atual.' });
    }
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push({ field: 'status', message: 'Status inválido.' });
  }

  return errors;
}

function validateAlertDays(days) {
  const n = parseInt(days);
  if (isNaN(n) || n < 1 || n > 30) {
    return 'A antecedência do alerta deve ser um valor entre 1 e 30 dias.';
  }
  return null;
}

module.exports = { calcMonthly, validateSubscription, validateAlertDays, VALID_PERIODS, VALID_CATEGORIES, VALID_STATUSES, VALID_PAYMENTS };
```

- [ ] **Step 4: Run calcMonthly tests to verify they pass**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npx jest tests/unit/calculations.test.js --verbose`
Expected: 6 tests PASS

- [ ] **Step 5: Write failing validation tests**

Create `backend/tests/unit/validations.test.js`:

```js
const { validateSubscription, validateAlertDays } = require('../../src/utils/calculations');

describe('validateSubscription', () => {
  const validData = {
    name: 'Netflix',
    value: 55.90,
    period: 'Mensal',
    renewal_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'Ativa',
  };

  test('valid subscription returns no errors', () => {
    expect(validateSubscription(validData)).toEqual([]);
  });

  test('empty name returns error', () => {
    const errors = validateSubscription({ ...validData, name: '' });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('name');
  });

  test('name longer than 100 chars returns error', () => {
    const errors = validateSubscription({ ...validData, name: 'A'.repeat(101) });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('name');
  });

  test('duplicate name (case-insensitive) returns MSG003', () => {
    const errors = validateSubscription(validData, ['netflix']);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Já existe uma assinatura cadastrada com este nome de serviço.');
  });

  test('negative value returns MSG001', () => {
    const errors = validateSubscription({ ...validData, value: -10 });
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('O valor informado é inválido. Informe um valor numérico positivo.');
  });

  test('zero value returns MSG001', () => {
    const errors = validateSubscription({ ...validData, value: 0 });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('value');
  });

  test('missing period returns error', () => {
    const errors = validateSubscription({ ...validData, period: '' });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('period');
  });

  test('past renewal date returns MSG002', () => {
    const errors = validateSubscription({ ...validData, renewal_date: '2020-01-01' });
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('A data de renovação não pode ser anterior à data atual.');
  });

  test('invalid status returns error', () => {
    const errors = validateSubscription({ ...validData, status: 'Invalido' });
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('status');
  });

  test('multiple errors returned at once', () => {
    const errors = validateSubscription({ name: '', value: -1, period: '', renewal_date: '' });
    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe('validateAlertDays', () => {
  test('valid value (3) returns null', () => {
    expect(validateAlertDays(3)).toBeNull();
  });

  test('value 1 (min) returns null', () => {
    expect(validateAlertDays(1)).toBeNull();
  });

  test('value 30 (max) returns null', () => {
    expect(validateAlertDays(30)).toBeNull();
  });

  test('value 0 returns MSG009', () => {
    expect(validateAlertDays(0)).toBe('A antecedência do alerta deve ser um valor entre 1 e 30 dias.');
  });

  test('value 31 returns MSG009', () => {
    expect(validateAlertDays(31)).toBe('A antecedência do alerta deve ser um valor entre 1 e 30 dias.');
  });

  test('non-numeric returns MSG009', () => {
    expect(validateAlertDays('abc')).toBe('A antecedência do alerta deve ser um valor entre 1 e 30 dias.');
  });
});
```

- [ ] **Step 6: Run all unit tests**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npx jest tests/unit --verbose`
Expected: All 17 tests PASS

- [ ] **Step 7: Commit**

```bash
git add backend/src/utils/calculations.js backend/tests/unit/
git commit -m "feat: add calculation and validation utilities with unit tests"
```

---

## Task 3: Database Layer

**Files:**
- Create: `backend/src/database.js`

- [ ] **Step 1: Create database.js with schema and seed**

Create `backend/src/database.js`:

```js
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
```

- [ ] **Step 2: Verify database creates without errors**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && node -e "const {createDatabase,seedDatabase}=require('./src/database');const db=createDatabase(':memory:');seedDatabase(db);console.log(db.prepare('SELECT COUNT(*) as c FROM subscriptions').get());db.close()"`
Expected: `{ c: 6 }`

- [ ] **Step 3: Commit**

```bash
git add backend/src/database.js
git commit -m "feat: add SQLite database layer with schema and seed data"
```

---

## Task 4: Auth Middleware + Auth Routes

**Files:**
- Create: `backend/src/middleware/auth.js`
- Create: `backend/src/routes/auth.js`

- [ ] **Step 1: Create JWT auth middleware**

Create `backend/src/middleware/auth.js`:

```js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'subcontrol-secret-key-dev';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
```

- [ ] **Step 2: Create auth routes**

Create `backend/src/routes/auth.js`:

```js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
  }

  const db = req.app.get('db');

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email já cadastrado.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, hash);
  const userId = result.lastInsertRowid;

  db.prepare('INSERT INTO settings (user_id, default_alert_days) VALUES (?, 3)').run(userId);

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });

  res.status(201).json({ token, user: { id: userId, name, email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const db = req.app.get('db');

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/middleware/auth.js backend/src/routes/auth.js
git commit -m "feat: add JWT auth middleware and register/login routes"
```

---

## Task 5: Subscriptions Routes (CRUD + Stats + Alerts)

**Files:**
- Create: `backend/src/routes/subscriptions.js`

- [ ] **Step 1: Create subscriptions routes**

Create `backend/src/routes/subscriptions.js`:

```js
const express = require('express');
const { calcMonthly, validateSubscription, validateAlertDays } = require('../utils/calculations');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/subscriptions — list with optional filters
router.get('/', (req, res) => {
  const db = req.app.get('db');
  const { status, category, search, min_value, max_value } = req.query;

  let sql = 'SELECT * FROM subscriptions WHERE user_id = ?';
  const params = [req.userId];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  if (min_value) {
    sql += ' AND value >= ?';
    params.push(parseFloat(min_value));
  }
  if (max_value) {
    sql += ' AND value <= ?';
    params.push(parseFloat(max_value));
  }

  sql += ' ORDER BY renewal_date ASC';

  const rows = db.prepare(sql).all(...params);
  res.json(rows);
});

// GET /api/subscriptions/stats — totals for HU-002
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

// GET /api/subscriptions/:id
router.get('/:id', (req, res) => {
  const db = req.app.get('db');
  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!sub) return res.status(404).json({ error: 'Assinatura não encontrada.' });
  res.json(sub);
});

// POST /api/subscriptions — create (HU-001)
router.post('/', (req, res) => {
  const db = req.app.get('db');

  const existingNames = db.prepare('SELECT name FROM subscriptions WHERE user_id = ?').all(req.userId).map(r => r.name);

  const errors = validateSubscription(req.body, existingNames);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { name, category, value, period, start_date, renewal_date, payment, status, notes } = req.body;
  const monthlyValue = calcMonthly(parseFloat(value), period);

  const result = db.prepare(`
    INSERT INTO subscriptions (user_id, name, category, value, period, start_date, renewal_date, payment, status, notes, monthly_value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.userId,
    name.trim(),
    category || 'Outros',
    parseFloat(value),
    period,
    start_date || null,
    renewal_date,
    payment || '',
    status || 'Ativa',
    notes || '',
    monthlyValue
  );

  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(sub);
});

// PUT /api/subscriptions/:id — update
router.put('/:id', (req, res) => {
  const db = req.app.get('db');
  const existing = db.prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Assinatura não encontrada.' });

  const existingNames = db.prepare('SELECT name FROM subscriptions WHERE user_id = ? AND id != ?').all(req.userId, req.params.id).map(r => r.name);

  const errors = validateSubscription(req.body, existingNames);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { name, category, value, period, start_date, renewal_date, payment, status, notes } = req.body;
  const monthlyValue = calcMonthly(parseFloat(value), period);

  db.prepare(`
    UPDATE subscriptions SET name=?, category=?, value=?, period=?, start_date=?, renewal_date=?, payment=?, status=?, notes=?, monthly_value=?, updated_at=datetime('now')
    WHERE id=? AND user_id=?
  `).run(name.trim(), category || 'Outros', parseFloat(value), period, start_date || null, renewal_date, payment || '', status || 'Ativa', notes || '', monthlyValue, req.params.id, req.userId);

  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
  res.json(sub);
});

// DELETE /api/subscriptions/:id
router.delete('/:id', (req, res) => {
  const db = req.app.get('db');
  const existing = db.prepare('SELECT id FROM subscriptions WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Assinatura não encontrada.' });

  db.prepare('DELETE FROM subscriptions WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: 'Assinatura excluída com sucesso.' });
});

// PUT /api/subscriptions/:id/alert — individual alert config (HU-003)
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
    req.params.id,
    req.userId
  );

  const sub = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
  res.json(sub);
});

module.exports = router;
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/routes/subscriptions.js
git commit -m "feat: add subscription CRUD, stats, and alert routes"
```

---

## Task 6: Express App + Settings Route + Server

**Files:**
- Create: `backend/src/app.js`
- Create: `backend/src/server.js`

- [ ] **Step 1: Create app.js**

Create `backend/src/app.js`:

```js
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

  // PUT /api/settings/alert — global alert config (HU-003)
  app.put('/api/settings/alert', authMiddleware, (req, res) => {
    const { default_alert_days } = req.body;
    const error = validateAlertDays(default_alert_days);
    if (error) return res.status(400).json({ error });

    db.prepare('UPDATE settings SET default_alert_days = ? WHERE user_id = ?').run(parseInt(default_alert_days), req.userId);
    const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId);
    res.json(settings);
  });

  // GET /api/settings
  app.get('/api/settings', authMiddleware, (req, res) => {
    const db = req.app.get('db');
    let settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId);
    if (!settings) {
      db.prepare('INSERT INTO settings (user_id, default_alert_days) VALUES (?, 3)').run(req.userId);
      settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId);
    }
    res.json(settings);
  });

  // Serve frontend in production
  app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
    }
  });

  return app;
}

module.exports = { createApp };
```

- [ ] **Step 2: Create server.js**

Create `backend/src/server.js`:

```js
const { createApp } = require('./app');

const PORT = process.env.PORT || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`SubControl API running on http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Verify server starts**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && timeout 3 node src/server.js || true`
Expected: `SubControl API running on http://localhost:3001`

- [ ] **Step 4: Commit**

```bash
git add backend/src/app.js backend/src/server.js
git commit -m "feat: add Express app with all routes and server entry point"
```

---

## Task 7: API Tests — Auth

**Files:**
- Create: `backend/tests/api/auth.test.js`

- [ ] **Step 1: Write auth API tests**

Create `backend/tests/api/auth.test.js`:

```js
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
```

- [ ] **Step 2: Run auth API tests**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npx jest tests/api/auth.test.js --verbose`
Expected: All 8 tests PASS

- [ ] **Step 3: Commit**

```bash
git add backend/tests/api/auth.test.js
git commit -m "test: add API tests for auth register, login, and middleware"
```

---

## Task 8: API Tests — Subscriptions

**Files:**
- Create: `backend/tests/api/subscriptions.test.js`

- [ ] **Step 1: Write subscription API tests**

Create `backend/tests/api/subscriptions.test.js`:

```js
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
    const res = await request(app)
      .get('/api/subscriptions')
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
  });

  test('filters by status', async () => {
    const res = await request(app)
      .get('/api/subscriptions?status=Ativa')
      .set(auth());

    expect(res.status).toBe(200);
    res.body.forEach(s => expect(s.status).toBe('Ativa'));
  });

  test('filters by category', async () => {
    const res = await request(app)
      .get('/api/subscriptions?category=Streaming')
      .set(auth());

    expect(res.status).toBe(200);
    res.body.forEach(s => expect(s.category).toBe('Streaming'));
  });

  test('filters by search term', async () => {
    const res = await request(app)
      .get('/api/subscriptions?search=netflix')
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Netflix Premium');
  });

  test('filters by value range', async () => {
    const res = await request(app)
      .get('/api/subscriptions?min_value=50&max_value=90')
      .set(auth());

    expect(res.status).toBe(200);
    res.body.forEach(s => {
      expect(s.value).toBeGreaterThanOrEqual(50);
      expect(s.value).toBeLessThanOrEqual(90);
    });
  });
});

describe('GET /api/subscriptions/stats', () => {
  test('returns correct totals', async () => {
    const res = await request(app)
      .get('/api/subscriptions/stats')
      .set(auth());

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(6);
    expect(res.body.active).toBe(4);
    expect(res.body.monthly).toBeGreaterThan(0);
    expect(res.body.annual).toBe(Math.round(res.body.monthly * 12 * 100) / 100);
  });
});

describe('POST /api/subscriptions', () => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  test('creates subscription with valid data (HU-001)', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set(auth())
      .send({
        name: 'GitHub Copilot',
        category: 'Produtividade',
        value: 19.00,
        period: 'Mensal',
        renewal_date: tomorrow,
        status: 'Ativa',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('GitHub Copilot');
    expect(res.body.monthly_value).toBeCloseTo(19.00, 2);
    expect(res.body.category).toBe('Produtividade');
  });

  test('calculates monthly for Anual period (CA6)', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set(auth())
      .send({
        name: 'Amazon Prime',
        value: 120.00,
        period: 'Anual',
        renewal_date: tomorrow,
        status: 'Ativa',
      });

    expect(res.status).toBe(201);
    expect(res.body.monthly_value).toBeCloseTo(10.00, 2);
    expect(res.body.category).toBe('Outros');
  });

  test('rejects duplicate name case-insensitive (CA4/MSG003)', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set(auth())
      .send({
        name: 'netflix premium',
        value: 55.90,
        period: 'Mensal',
        renewal_date: tomorrow,
        status: 'Ativa',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('Já existe uma assinatura cadastrada com este nome de serviço.');
  });

  test('rejects negative value (MSG001)', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set(auth())
      .send({
        name: 'Bad Value',
        value: -10,
        period: 'Mensal',
        renewal_date: tomorrow,
        status: 'Ativa',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('O valor informado é inválido. Informe um valor numérico positivo.');
  });

  test('rejects past renewal date (MSG002)', async () => {
    const res = await request(app)
      .post('/api/subscriptions')
      .set(auth())
      .send({
        name: 'Old Sub',
        value: 10,
        period: 'Mensal',
        renewal_date: '2020-01-01',
        status: 'Ativa',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].message).toBe('A data de renovação não pode ser anterior à data atual.');
  });
});

describe('PUT /api/subscriptions/:id', () => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  test('updates subscription', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const id = list.body[0].id;

    const res = await request(app)
      .put(`/api/subscriptions/${id}`)
      .set(auth())
      .send({
        name: 'Netflix Premium Atualizado',
        value: 59.90,
        period: 'Mensal',
        renewal_date: tomorrow,
        status: 'Ativa',
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Netflix Premium Atualizado');
    expect(res.body.value).toBe(59.90);
  });

  test('returns 404 for non-existent id', async () => {
    const res = await request(app)
      .put('/api/subscriptions/99999')
      .set(auth())
      .send({ name: 'X', value: 10, period: 'Mensal', renewal_date: tomorrow, status: 'Ativa' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/subscriptions/:id', () => {
  test('deletes subscription', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const lastId = list.body[list.body.length - 1].id;

    const res = await request(app)
      .delete(`/api/subscriptions/${lastId}`)
      .set(auth());

    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/subscriptions/${lastId}`).set(auth());
    expect(check.status).toBe(404);
  });
});

describe('PUT /api/subscriptions/:id/alert (HU-003)', () => {
  test('sets individual alert days', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const id = list.body[0].id;

    const res = await request(app)
      .put(`/api/subscriptions/${id}/alert`)
      .set(auth())
      .send({ alert_days: 5, alert_enabled: true });

    expect(res.status).toBe(200);
    expect(res.body.alert_days).toBe(5);
    expect(res.body.alert_enabled).toBe(1);
  });

  test('disables alert', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const id = list.body[0].id;

    const res = await request(app)
      .put(`/api/subscriptions/${id}/alert`)
      .set(auth())
      .send({ alert_enabled: false });

    expect(res.status).toBe(200);
    expect(res.body.alert_enabled).toBe(0);
  });

  test('rejects alert_days out of range (MSG009)', async () => {
    const list = await request(app).get('/api/subscriptions').set(auth());
    const id = list.body[0].id;

    const res = await request(app)
      .put(`/api/subscriptions/${id}/alert`)
      .set(auth())
      .send({ alert_days: 50 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('A antecedência do alerta deve ser um valor entre 1 e 30 dias.');
  });
});

describe('PUT /api/settings/alert (HU-003 global)', () => {
  test('updates global alert days', async () => {
    const res = await request(app)
      .put('/api/settings/alert')
      .set(auth())
      .send({ default_alert_days: 7 });

    expect(res.status).toBe(200);
    expect(res.body.default_alert_days).toBe(7);
  });

  test('rejects invalid global alert (MSG009)', async () => {
    const res = await request(app)
      .put('/api/settings/alert')
      .set(auth())
      .send({ default_alert_days: 0 });

    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run all API tests**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npx jest tests/api --verbose`
Expected: All 22 tests PASS

- [ ] **Step 3: Run full backend test suite**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npx jest --verbose --coverage`
Expected: 39 total tests PASS. Coverage report generated.

- [ ] **Step 4: Commit**

```bash
git add backend/tests/api/subscriptions.test.js
git commit -m "test: add API tests for subscriptions CRUD, stats, filters, and alerts"
```

---

## Task 9: Initialize Frontend Project

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/.gitignore`

- [ ] **Step 1: Create frontend/package.json**

```json
{
  "name": "subcontrol-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create frontend/vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 3: Create frontend/index.html**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SubControl</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 4: Create frontend/.gitignore**

```
node_modules/
dist/
```

- [ ] **Step 5: Install dependencies**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/frontend && npm install`
Expected: `added XX packages` with no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/vite.config.js frontend/index.html frontend/.gitignore frontend/package-lock.json
git commit -m "chore: initialize frontend project with React and Vite"
```

---

## Task 10: Frontend — API Service + Main Entry + Global Styles

**Files:**
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/services/api.js`

- [ ] **Step 1: Create API service**

Create `frontend/src/services/api.js`:

```jsx
const API_BASE = '/api';

function getToken() {
  return window.__subcontrol_token || null;
}

export function setToken(token) {
  window.__subcontrol_token = token;
}

export function clearToken() {
  window.__subcontrol_token = null;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.error || data?.errors?.[0]?.message || 'Erro no servidor');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  getSubscriptions: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/subscriptions${query ? '?' + query : ''}`);
  },
  getSubscription: (id) => request(`/subscriptions/${id}`),
  createSubscription: (data) => request('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
  updateSubscription: (id, data) => request(`/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubscription: (id) => request(`/subscriptions/${id}`, { method: 'DELETE' }),
  getStats: () => request('/subscriptions/stats'),
  updateAlert: (id, data) => request(`/subscriptions/${id}/alert`, { method: 'PUT', body: JSON.stringify(data) }),

  getSettings: () => request('/settings'),
  updateGlobalAlert: (days) => request('/settings/alert', { method: 'PUT', body: JSON.stringify({ default_alert_days: days }) }),
};
```

- [ ] **Step 2: Create main.jsx**

Create `frontend/src/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/main.jsx frontend/src/services/api.js
git commit -m "feat: add API service layer and main entry point"
```

---

## Task 11: Frontend — Shared Components (Navbar, Modal, Toast, DonutChart)

**Files:**
- Create: `frontend/src/components/Navbar.jsx`
- Create: `frontend/src/components/Modal.jsx`
- Create: `frontend/src/components/Toast.jsx`
- Create: `frontend/src/components/DonutChart.jsx`

- [ ] **Step 1: Create Navbar.jsx**

Create `frontend/src/components/Navbar.jsx` — Sticky navbar with backdrop blur, SubControl logo, 3 navigation tabs (Cadastrar, Consultar, Alertas), and logout button. Receives `active`, `onChange`, `onLogout`, `userName` as props. Uses inline styles matching the existing design (teal active state, DM Sans font).

The full component code from the existing `index.html` Navbar but with an added logout button:

```jsx
export default function Navbar({ active, onChange, onLogout, userName }) {
  const tabs = [
    { id: 'cadastrar', label: 'Cadastrar', icon: '+' },
    { id: 'consultar', label: 'Consultar', icon: '◎' },
    { id: 'alertas', label: 'Alertas', icon: '🔔' },
  ];
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px) saturate(180%)',
      borderBottom: '1px solid #e2e8f0', padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: "'Sora', sans-serif",
          }}>S</div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: '#0f172a' }}>
            Sub<span style={{ color: '#0d9488' }}>Control</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: active === t.id ? '#0d94880f' : 'transparent',
              color: active === t.id ? '#0d9488' : '#64748b',
              fontWeight: active === t.id ? 700 : 500,
              fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 8px' }} />
          <span style={{ fontSize: 13, color: '#64748b', marginRight: 8 }}>{userName}</span>
          <button onClick={onLogout} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: '#fff', color: '#ef4444', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>Sair</button>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create Modal.jsx**

Create `frontend/src/components/Modal.jsx` — same as existing Modal from `index.html`:

```jsx
export default function Modal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'overlayIn 0.2s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '32px 36px', maxWidth: 440, width: '90%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'scaleIn 0.25s ease',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>{title}</h3>
        <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 28 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '10px 24px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>Cancelar</button>
          <button onClick={onConfirm} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
            fontFamily: "'DM Sans', sans-serif",
          }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Toast.jsx**

Create `frontend/src/components/Toast.jsx`:

```jsx
export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onRemove(t.id)} style={{
          animation: t.leaving ? 'toastOut 0.3s ease forwards' : 'toastIn 0.4s ease',
          background: t.type === 'error' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #0d9488, #0f766e)',
          color: '#fff', padding: '14px 24px', borderRadius: 12,
          fontSize: 14, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          cursor: 'pointer', maxWidth: 360, fontFamily: "'DM Sans', sans-serif",
        }}>{t.msg}</div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create DonutChart.jsx**

Create `frontend/src/components/DonutChart.jsx` — same SVG donut from existing `index.html`:

```jsx
export default function DonutChart({ data, total }) {
  const size = 220, cx = size / 2, cy = size / 2, r = 80;
  const fmtBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  let cumAngle = -90;
  const slices = data.map(d => {
    const angle = (d.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { ...d, startAngle: start, angle };
  });
  const polar = (cx, cy, r, deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => {
          if (s.angle <= 0) return null;
          const a = s.angle >= 360 ? 359.99 : s.angle;
          const start = polar(cx, cy, r, s.startAngle);
          const end = polar(cx, cy, r, s.startAngle + a);
          const large = a > 180 ? 1 : 0;
          const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
          return <path key={i} d={d} fill="none" stroke={s.color} strokeWidth={32} />;
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}>Total</text>
        <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fill: '#0f172a', fontWeight: 700 }}>{fmtBRL(total)}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ color: '#475569', minWidth: 130 }}>{d.label}</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{d.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add shared components — Navbar, Modal, Toast, DonutChart"
```

---

## Task 12: Frontend — Login Page

**Files:**
- Create: `frontend/src/pages/Login.jsx`

- [ ] **Step 1: Create Login.jsx**

Create `frontend/src/pages/Login.jsx` — A centered login card with email/password fields, login/register toggle, form validation, and error display. Calls `api.login` or `api.register`, then passes the token and user up via `onLogin` prop.

```jsx
import { useState } from 'react';
import { api, setToken } from '../services/api';

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1.5px solid #e2e8f0', fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", color: '#1e293b',
  background: '#fff', outline: 'none',
};

export default function Login({ onLogin, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (isRegister) {
        if (!form.name) { setError('Nome é obrigatório.'); setLoading(false); return; }
        res = await api.register(form.name, form.email, form.password);
      } else {
        res = await api.login(form.email, form.password);
      }
      setToken(res.token);
      onLogin(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #f1f5f9 50%, #eef2ff 100%)',
      padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 420, width: '100%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)', animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 24, fontFamily: "'Sora', sans-serif",
          }}>S</div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            Sub<span style={{ color: '#0d9488' }}>Control</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            {isRegister ? 'Crie sua conta' : 'Faça login para continuar'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Nome</label>
              <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Seu nome" />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Senha</label>
            <input style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Sua senha" required />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
            fontFamily: "'Sora', sans-serif", boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Carregando...' : (isRegister ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          {isRegister ? 'Já tem conta? ' : 'Não tem conta? '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{
            background: 'none', border: 'none', color: '#0d9488', fontWeight: 600,
            cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
          }}>
            {isRegister ? 'Fazer login' : 'Criar conta'}
          </button>
        </p>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
          Usuário demo: admin@subcontrol.com / admin123
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Login.jsx
git commit -m "feat: add Login page with register toggle and JWT auth"
```

---

## Task 13: Frontend — Cadastrar Page (HU-001)

**Files:**
- Create: `frontend/src/pages/Cadastrar.jsx`

- [ ] **Step 1: Create Cadastrar.jsx**

Create `frontend/src/pages/Cadastrar.jsx` — The subscription registration form from the existing `index.html` CadastrarScreen, adapted to call `api.createSubscription` instead of local state. Includes all form fields (name, category, value, period, start_date, renewal_date, payment, status, notes), client-side validation matching CA1-CA7, confirmation Modal, and success toast. The form layout, styles, and validation messages are identical to the existing implementation.

```jsx
import { useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

const CATEGORIES = ['Streaming', 'Música', 'Produtividade', 'Saúde/Academia', 'Armazenamento/Cloud', 'Educação', 'Jogos', 'Delivery', 'Seguros', 'Outros'];
const PERIODS = ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'];
const PAYMENTS = ['Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Pix', 'Débito Automático'];
const STATUSES = ['Ativa', 'Pausada', 'Cancelada'];

const inputStyle = (hasError) => ({
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  color: '#1e293b', background: '#fff', outline: 'none',
});

const selectStyle = (hasError) => ({
  ...inputStyle(hasError), appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36,
});

function Field({ label, required, error, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontWeight: 500 }}>{error}</p>}
      {hint && <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export default function Cadastrar({ showToast }) {
  const emptyForm = { name: '', category: '', value: '', period: '', startDate: '', renewalDate: '', payment: '', status: 'Ativa', notes: '' };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const todayStr = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Campo obrigatório.';
    const val = parseFloat(form.value);
    if (!form.value || isNaN(val) || val <= 0) e.value = 'O valor informado é inválido. Informe um valor numérico positivo.';
    if (!form.period) e.period = 'Campo obrigatório.';
    if (!form.renewalDate) e.renewalDate = 'Campo obrigatório.';
    else if (form.renewalDate < todayStr) e.renewalDate = 'A data de renovação não pode ser anterior à data atual.';
    if (!form.status) e.status = 'Campo obrigatório.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => { if (validate()) setModal(true); };

  const confirm = async () => {
    setLoading(true);
    try {
      await api.createSubscription({
        name: form.name.trim(),
        category: form.category || 'Outros',
        value: parseFloat(form.value),
        period: form.period,
        start_date: form.startDate || null,
        renewal_date: form.renewalDate,
        payment: form.payment || '',
        status: form.status,
        notes: form.notes,
      });
      setModal(false);
      setForm(emptyForm);
      setErrors({});
      showToast('Assinatura cadastrada com sucesso.');
    } catch (err) {
      setModal(false);
      if (err.data?.errors) {
        const map = {};
        err.data.errors.forEach(e => { map[e.field] = e.message; });
        setErrors(map);
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Cadastrar Assinatura</h1>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>Adicione uma nova assinatura de serviço recorrente.</p>

      <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Nome do Serviço" required error={errors.name}>
              <input style={inputStyle(errors.name)} maxLength={100} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Netflix, Spotify..." />
            </Field>
          </div>
          <Field label="Categoria">
            <select style={selectStyle()} value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Selecione (padrão: Outros)</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Valor (R$)" required error={errors.value}>
            <input style={inputStyle(errors.value)} type="number" step="0.01" min="0.01" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0,00" />
          </Field>
          <Field label="Periodicidade" required error={errors.period}>
            <select style={selectStyle(errors.period)} value={form.period} onChange={e => set('period', e.target.value)}>
              <option value="">Selecione</option>
              {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Data de Início" hint="Formato DD/MM/AAAA">
            <input style={inputStyle()} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </Field>
          <Field label="Próxima Renovação" required error={errors.renewalDate}>
            <input style={inputStyle(errors.renewalDate)} type="date" value={form.renewalDate} onChange={e => set('renewalDate', e.target.value)} min={todayStr} />
          </Field>
          <Field label="Forma de Pagamento">
            <select style={selectStyle()} value={form.payment} onChange={e => set('payment', e.target.value)}>
              <option value="">Selecione</option>
              {PAYMENTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Status" required error={errors.status}>
            <select style={selectStyle(errors.status)} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Observações" hint={`${form.notes.length}/500 caracteres`}>
              <textarea style={{ ...inputStyle(), minHeight: 80, resize: 'vertical' }} maxLength={500} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anotações adicionais..." />
            </Field>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => { setForm(emptyForm); setErrors({}); }} style={{
            padding: '12px 28px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(13,148,136,0.3)', fontFamily: "'DM Sans', sans-serif",
          }}>Gravar Assinatura</button>
        </div>

        <p style={{
          marginTop: 24, padding: '14px 18px', background: '#f0fdfa', borderRadius: 10,
          fontSize: 13, color: '#0f766e', lineHeight: 1.5, border: '1px solid #99f6e4',
        }}>
          Após o cadastro, o sistema calcula automaticamente o valor mensal equivalente com base na periodicidade informada.
        </p>
      </div>

      <Modal show={modal} title="Confirmar Cadastro"
        message={`Deseja confirmar o cadastro da assinatura ${form.name}?`}
        onConfirm={confirm} onCancel={() => setModal(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Cadastrar.jsx
git commit -m "feat: add Cadastrar page with form validation and API integration (HU-001)"
```

---

## Task 14: Frontend — Consultar Page (HU-002)

**Files:**
- Create: `frontend/src/pages/Consultar.jsx`

- [ ] **Step 1: Create Consultar.jsx**

Create `frontend/src/pages/Consultar.jsx` — Adapted from the existing ConsultarScreen. Fetches data from `api.getSubscriptions` and `api.getStats`. Contains: totalizador cards (active count, monthly total, annual estimate), filter bar (status tabs, search, category, value range), sortable table with status badges and "Configurar Alerta" links, DonutChart for category distribution, and dark summary card (next renewal, highest/lowest spend, paused savings). All styles and layout match the existing implementation.

The component is large (matches the existing ~300 lines) but is a single page with no sub-extraction needed. Key differences from the single-file version:
- Uses `useEffect` to fetch from API on mount and when filters change
- Imports DonutChart from components
- Uses `api.getSubscriptions(params)` with query params for server-side filtering
- Calls `goToAlerts` prop to navigate to alerts page

```jsx
import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import DonutChart from '../components/DonutChart';

const CATEGORIES = ['Streaming', 'Música', 'Produtividade', 'Saúde/Academia', 'Armazenamento/Cloud', 'Educação', 'Jogos', 'Delivery', 'Seguros', 'Outros'];
const PERIODS = ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'];
const STATUSES = ['Ativa', 'Pausada', 'Cancelada'];
const CATEGORY_COLORS = {
  'Streaming': '#ef4444', 'Música': '#8b5cf6', 'Produtividade': '#3b82f6',
  'Saúde/Academia': '#22c55e', 'Armazenamento/Cloud': '#06b6d4', 'Educação': '#f59e0b',
  'Jogos': '#ec4899', 'Delivery': '#f97316', 'Seguros': '#6366f1', 'Outros': '#64748b',
};
const STATUS_COLORS = { Ativa: '#16a34a', Pausada: '#eab308', Cancelada: '#dc2626' };
const STATUS_BG = { Ativa: '#dcfce7', Pausada: '#fef9c3', Cancelada: '#fee2e2' };

const inputStyle = () => ({
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e2e8f0', fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", color: '#1e293b', background: '#fff', outline: 'none',
});
const selectStyle = () => ({
  ...inputStyle(), appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36,
});

const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmtBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (s) => { const d = new Date(s + 'T00:00:00'); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };

export default function Consultar({ goToAlerts }) {
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, monthly: 0, annual: 0 });
  const [statusTab, setStatusTab] = useState('Todas');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const fetchData = async () => {
    try {
      const params = {};
      if (statusTab !== 'Todas') params.status = statusTab;
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      if (minVal) params.min_value = minVal;
      if (maxVal) params.max_value = maxVal;
      const [subsData, statsData] = await Promise.all([api.getSubscriptions(params), api.getStats()]);
      setSubs(subsData);
      setStats(statsData);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [statusTab, search, catFilter, minVal, maxVal]);

  const sorted = useMemo(() => {
    if (!sortCol) return subs;
    return [...subs].sort((a, b) => {
      let va, vb;
      switch (sortCol) {
        case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
        case 'value': va = a.value; vb = b.value; break;
        case 'period': va = PERIODS.indexOf(a.period); vb = PERIODS.indexOf(b.period); break;
        case 'monthly': va = a.monthly_value; vb = b.monthly_value; break;
        case 'renewal': va = a.renewal_date; vb = b.renewal_date; break;
        case 'status': va = STATUSES.indexOf(a.status); vb = STATUSES.indexOf(b.status); break;
        default: return 0;
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [subs, sortCol, sortAsc]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  const activeSubs = useMemo(() => subs.filter(s => s.status === 'Ativa'), [subs]);

  const chartData = useMemo(() => {
    const map = {};
    activeSubs.forEach(s => { map[s.category] = (map[s.category] || 0) + s.monthly_value; });
    const total = activeSubs.reduce((sum, s) => sum + s.monthly_value, 0);
    return Object.entries(map).map(([label, value]) => ({
      label, value, color: CATEGORY_COLORS[label] || '#64748b',
      pct: total > 0 ? (value / total) * 100 : 0,
    })).sort((a, b) => b.value - a.value);
  }, [activeSubs]);

  const nextRenewal = useMemo(() => {
    const valid = subs.filter(s => s.status !== 'Cancelada').sort((a, b) => a.renewal_date.localeCompare(b.renewal_date));
    return valid[0] || null;
  }, [subs]);
  const highest = useMemo(() => activeSubs.reduce((m, s) => s.monthly_value > (m?.monthly_value || 0) ? s : m, null), [activeSubs]);
  const lowest = useMemo(() => activeSubs.reduce((m, s) => s.monthly_value < (m?.monthly_value || Infinity) ? s : m, null), [activeSubs]);
  const pausedSavings = subs.filter(s => s.status === 'Pausada').reduce((sum, s) => sum + s.monthly_value, 0);

  const clearFilters = () => { setSearch(''); setCatFilter(''); setMinVal(''); setMaxVal(''); setStatusTab('Todas'); };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ opacity: 0.3, fontSize: 11 }}> ↕</span>;
    return <span style={{ fontSize: 11, color: '#0d9488' }}> {sortAsc ? '↑' : '↓'}</span>;
  };

  const thStyle = {
    padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600,
    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
    borderBottom: '2px solid #e2e8f0',
  };
  const tdStyle = { padding: '14px 14px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Consultar Assinaturas</h1>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Visualize, filtre e analise suas assinaturas.</p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Assinaturas Ativas', value: `${stats.active} de ${stats.total}`, sub: 'cadastradas', color: '#16a34a' },
          { label: 'Gasto Mensal', value: fmtBRL(stats.monthly), sub: 'total ativas', color: '#0d9488' },
          { label: 'Gasto Anual Estimado', value: fmtBRL(stats.annual), sub: 'projeção 12 meses', color: '#6366f1' },
        ].map((c, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '24px 20px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            animation: `slideUp 0.4s ease ${i * 0.1}s both`,
          }}>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>{c.label}</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {['Todas', 'Ativa', 'Pausada', 'Cancelada'].map(t => (
            <button key={t} onClick={() => setStatusTab(t)} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: statusTab === t ? '#0d9488' : '#f1f5f9',
              color: statusTab === t ? '#fff' : '#64748b',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>{t === 'Todas' ? 'Todas' : t + 's'}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>BUSCAR</label>
            <input style={inputStyle()} placeholder="Nome do serviço..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>CATEGORIA</label>
            <select style={selectStyle()} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">Todas</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>VALOR MÍN</label>
            <input style={inputStyle()} type="number" min="0" step="0.01" value={minVal} onChange={e => setMinVal(e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>VALOR MÁX</label>
            <input style={inputStyle()} type="number" min="0" step="0.01" value={maxVal} onChange={e => setMaxVal(e.target.value)} placeholder="0,00" />
          </div>
          <button onClick={clearFilters} style={{
            padding: '10px 18px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Limpar</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'auto', marginBottom: 28 }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Nenhuma assinatura encontrada para os filtros selecionados.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => toggleSort('name')}>Serviço<SortIcon col="name" /></th>
                <th style={thStyle} onClick={() => toggleSort('value')}>Valor<SortIcon col="value" /></th>
                <th style={thStyle} onClick={() => toggleSort('period')}>Período<SortIcon col="period" /></th>
                <th style={thStyle} onClick={() => toggleSort('monthly')}>Mensal Eq.<SortIcon col="monthly" /></th>
                <th style={thStyle} onClick={() => toggleSort('renewal')}>Renovação<SortIcon col="renewal" /></th>
                <th style={thStyle} onClick={() => toggleSort('status')}>Status<SortIcon col="status" /></th>
                <th style={{ ...thStyle, cursor: 'default' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={s.id} style={{ animation: `slideUp 0.3s ease ${i * 0.04}s both` }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: (CATEGORY_COLORS[s.category] || '#64748b') + '18',
                        color: CATEGORY_COLORS[s.category] || '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13, fontFamily: "'Sora', sans-serif", flexShrink: 0,
                      }}>{initials(s.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>{fmtBRL(s.value)}</td>
                  <td style={tdStyle}>{s.period}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#0d9488', fontFamily: "'Sora', sans-serif" }}>{fmtBRL(s.monthly_value)}</td>
                  <td style={tdStyle}>{s.renewal_date ? fmtDate(s.renewal_date) : '—'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600,
                      background: STATUS_BG[s.status], color: STATUS_COLORS[s.status],
                    }}>{s.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => goToAlerts()} style={{
                      background: 'none', border: 'none', color: '#0d9488',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      textDecoration: 'underline', textUnderlineOffset: 2,
                    }}>Configurar Alerta</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Chart + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Distribuição por Categoria</h3>
          {chartData.length > 0 ? (
            <DonutChart data={chartData} total={stats.monthly} />
          ) : (
            <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', padding: 32 }}>Sem dados para exibir.</p>
          )}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 14, padding: 28, color: '#fff' }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Resumo Rápido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Próxima Renovação</p>
              <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                {nextRenewal ? `${fmtDate(nextRenewal.renewal_date)} — ${nextRenewal.name}` : '—'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Maior Gasto</p>
                <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: '#f87171' }}>
                  {highest ? `${fmtBRL(highest.monthly_value)}/mês` : '—'}
                </p>
                <p style={{ fontSize: 12, color: '#64748b' }}>{highest?.name || ''}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Menor Gasto</p>
                <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: '#34d399' }}>
                  {lowest ? `${fmtBRL(lowest.monthly_value)}/mês` : '—'}
                </p>
                <p style={{ fontSize: 12, color: '#64748b' }}>{lowest?.name || ''}</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #334155', paddingTop: 16 }}>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Economia se cancelar pausadas</p>
              <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: '#fbbf24' }}>
                {fmtBRL(pausedSavings)}<span style={{ fontSize: 14, fontWeight: 500 }}>/mês</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Consultar.jsx
git commit -m "feat: add Consultar page with filters, table, chart, and summary (HU-002)"
```

---

## Task 15: Frontend — Alertas Page (HU-003)

**Files:**
- Create: `frontend/src/pages/Alertas.jsx`

- [ ] **Step 1: Create Alertas.jsx**

Create `frontend/src/pages/Alertas.jsx` — Adapted from existing AlertasScreen. Fetches from API. Contains: global alert config card, upcoming renewals list with urgency colors, individual alert toggle/input, timeline, and save button. Uses `api.getSubscriptions`, `api.getSettings`, `api.updateAlert`, `api.updateGlobalAlert`.

```jsx
import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';

const CATEGORY_COLORS = {
  'Streaming': '#ef4444', 'Música': '#8b5cf6', 'Produtividade': '#3b82f6',
  'Saúde/Academia': '#22c55e', 'Armazenamento/Cloud': '#06b6d4', 'Educação': '#f59e0b',
  'Jogos': '#ec4899', 'Delivery': '#f97316', 'Seguros': '#6366f1', 'Outros': '#64748b',
};
const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmtDate = (s) => { const d = new Date(s + 'T00:00:00'); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };
const diffDays = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
};

export default function Alertas({ showToast }) {
  const [subs, setSubs] = useState([]);
  const [globalDays, setGlobalDays] = useState(3);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [subsData, settings] = await Promise.all([api.getSubscriptions(), api.getSettings()]);
        setSubs(subsData);
        setGlobalDays(settings.default_alert_days || 3);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const upcoming = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    const limit = new Date(now); limit.setDate(limit.getDate() + 30);
    return subs
      .filter(s => s.status !== 'Cancelada')
      .filter(s => new Date(s.renewal_date + 'T00:00:00') <= limit)
      .sort((a, b) => a.renewal_date.localeCompare(b.renewal_date));
  }, [subs]);

  const handleGlobalChange = (v) => {
    setGlobalDays(v);
    const n = parseInt(v);
    if (isNaN(n) || n < 1 || n > 30) {
      setGlobalError('A antecedência do alerta deve ser um valor entre 1 e 30 dias.');
    } else {
      setGlobalError('');
    }
  };

  const updateSubAlert = async (id, updates) => {
    try {
      const updated = await api.updateAlert(id, updates);
      setSubs(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getAlertStatus = (sub) => {
    if (!sub.alert_enabled) return 'Desativado';
    const days = diffDays(sub.renewal_date);
    const alertD = sub.alert_days || globalDays;
    if (days <= alertD) return 'Enviado';
    return 'Pendente';
  };

  const alertStatusColors = {
    Enviado: { bg: '#dcfce7', color: '#16a34a' },
    Pendente: { bg: '#fef9c3', color: '#a16207' },
    Desativado: { bg: '#f1f5f9', color: '#64748b' },
  };

  const getUrgencyBg = (days) => {
    if (days < 0) return '#fff1f2';
    if (days <= 3) return '#fee2e2';
    if (days <= 7) return '#fef3c7';
    return 'transparent';
  };

  const handleSave = async () => {
    try {
      await api.updateGlobalAlert(parseInt(globalDays));
      showToast('Configuração de alerta salva com sucesso.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Alertas de Renovação</h1>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Configure alertas para ser notificado antes das renovações.</p>

      {/* Global config */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 14, padding: 28,
        color: '#fff', marginBottom: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Alerta Padrão Global</h3>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>Defina a antecedência padrão para todos os alertas.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="number" min="1" max="30" value={globalDays}
              onChange={e => handleGlobalChange(e.target.value)}
              style={{
                width: 80, padding: '12px 8px', borderRadius: 12,
                border: `2px solid ${globalError ? '#ef4444' : '#334155'}`,
                background: '#1e293b', color: '#fff',
                fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif",
                textAlign: 'center', outline: 'none',
              }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8' }}>dias antes</span>
          </div>
        </div>
        {globalError && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{globalError}</p>}
      </div>

      {/* Upcoming */}
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Próximos Vencimentos (30 dias)</h3>

      {upcoming.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: 48, textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
          Nenhuma assinatura vencendo nos próximos 30 dias.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {upcoming.map((s, i) => {
            const days = diffDays(s.renewal_date);
            const alertSt = getAlertStatus(s);
            const stColors = alertStatusColors[alertSt];
            return (
              <div key={s.id} style={{
                background: getUrgencyBg(days) || '#fff', borderRadius: 14, padding: '18px 20px',
                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                animation: `slideInRight 0.3s ease ${i * 0.06}s both`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: (CATEGORY_COLORS[s.category] || '#64748b') + '18',
                  color: CATEGORY_COLORS[s.category] || '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15, fontFamily: "'Sora', sans-serif", flexShrink: 0,
                }}>{initials(s.name)}</div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Renova em {fmtDate(s.renewal_date)}</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 70 }}>
                  <div style={{
                    fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, lineHeight: 1,
                    color: days < 0 ? '#dc2626' : days <= 3 ? '#dc2626' : days <= 7 ? '#d97706' : '#0d9488',
                  }}>{days}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{days < 0 ? 'vencido' : 'dias'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
                  <input type="number" min="1" max="30"
                    value={s.alert_days || globalDays}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      if (v >= 1 && v <= 30) updateSubAlert(s.id, { alert_days: v, alert_enabled: s.alert_enabled });
                    }}
                    style={{
                      width: 52, padding: '8px 4px', borderRadius: 8,
                      border: '1.5px solid #e2e8f0', fontSize: 15, fontWeight: 700,
                      fontFamily: "'Sora', sans-serif", textAlign: 'center',
                      color: '#0f172a', background: '#fff', outline: 'none',
                    }} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>dias</span>
                </div>
                <button onClick={() => updateSubAlert(s.id, { alert_days: s.alert_days, alert_enabled: !s.alert_enabled })}
                  style={{
                    width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                    background: s.alert_enabled ? '#0d9488' : '#cbd5e1',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3,
                    left: s.alert_enabled ? 25 : 3, transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: stColors.bg, color: stColors.color, minWidth: 80, textAlign: 'center',
                }}>{alertSt}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Timeline</h3>
      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 20px', border: '1px solid #e2e8f0', marginBottom: 28 }}>
        {upcoming.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center' }}>Sem vencimentos nos próximos 30 dias.</p>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 2, background: '#e2e8f0', borderRadius: 1 }} />
            {upcoming.map((s, i) => {
              const days = diffDays(s.renewal_date);
              const dotColor = days < 0 ? '#dc2626' : days <= 3 ? '#dc2626' : days <= 7 ? '#eab308' : '#94a3b8';
              return (
                <div key={s.id} style={{ position: 'relative', paddingBottom: i < upcoming.length - 1 ? 20 : 0, animation: `fadeIn 0.3s ease ${i * 0.06}s both` }}>
                  <div style={{
                    position: 'absolute', left: -24, top: 4,
                    width: 14, height: 14, borderRadius: '50%',
                    background: dotColor, border: '3px solid #fff', boxShadow: `0 0 0 2px ${dotColor}33`,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: '#0f172a', minWidth: 80 }}>{fmtDate(s.renewal_date)}</span>
                    <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>{s.name}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                      color: days < 0 ? '#dc2626' : days <= 3 ? '#dc2626' : days <= 7 ? '#d97706' : '#64748b',
                      background: days < 0 ? '#fee2e2' : days <= 3 ? '#fee2e2' : days <= 7 ? '#fef3c7' : '#f1f5f9',
                    }}>{days < 0 ? `${Math.abs(days)}d atrás` : `em ${days}d`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} style={{
          padding: '14px 32px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif",
          boxShadow: '0 4px 20px rgba(13,148,136,0.3)',
        }}>Salvar Configuração</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Alertas.jsx
git commit -m "feat: add Alertas page with global/individual config and timeline (HU-003)"
```

---

## Task 16: Frontend — App.jsx (Router + Auth State)

**Files:**
- Create: `frontend/src/App.jsx`

- [ ] **Step 1: Create App.jsx**

Create `frontend/src/App.jsx`:

```jsx
import { useState, useCallback } from 'react';
import { clearToken } from './services/api';
import Login from './pages/Login';
import Cadastrar from './pages/Cadastrar';
import Consultar from './pages/Consultar';
import Alertas from './pages/Alertas';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f1f5f9; color: #1e293b; min-height: 100vh; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes toastIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
  @keyframes toastOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }
  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input[type="number"] { -moz-appearance: textfield; }
  ::selection { background: #0d948833; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('consultar');
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 350);
    }, 3000);
  }, []);

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setPage('consultar');
  };

  const goToAlerts = () => setPage('alertas');

  return (
    <>
      <style>{globalStyles}</style>
      {!user ? (
        <Login onLogin={setUser} showToast={showToast} />
      ) : (
        <div>
          <Navbar active={page} onChange={setPage} onLogout={handleLogout} userName={user.name} />
          {page === 'cadastrar' && <Cadastrar showToast={showToast} />}
          {page === 'consultar' && <Consultar goToAlerts={goToAlerts} />}
          {page === 'alertas' && <Alertas showToast={showToast} />}
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(t => t.filter(x => x.id !== id))} />
    </>
  );
}
```

- [ ] **Step 2: Verify frontend builds**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/frontend && npx vite build`
Expected: Build completes with no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat: add App root with auth state, routing, and toast system"
```

---

## Task 17: E2E Tests — Cypress Setup + Login Tests

**Files:**
- Create: `cypress/package.json`
- Create: `cypress/cypress.config.js`
- Create: `cypress/support/commands.js`
- Create: `cypress/support/e2e.js`
- Create: `cypress/e2e/login.cy.js`

- [ ] **Step 1: Create cypress/package.json**

```json
{
  "name": "subcontrol-e2e",
  "private": true,
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run"
  },
  "devDependencies": {
    "cypress": "^13.0.0"
  }
}
```

- [ ] **Step 2: Create cypress/cypress.config.js**

```js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'support/e2e.js',
    specPattern: 'e2e/**/*.cy.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
  },
});
```

- [ ] **Step 3: Create cypress/support/e2e.js**

```js
import './commands';
```

- [ ] **Step 4: Create cypress/support/commands.js**

```js
Cypress.Commands.add('login', (email = 'admin@subcontrol.com', password = 'admin123') => {
  cy.visit('/');
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  cy.contains('button', 'Entrar').click();
  cy.contains('SubControl').should('be.visible');
  cy.contains('Consultar').should('be.visible');
});
```

- [ ] **Step 5: Create cypress/e2e/login.cy.js**

```js
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows login page by default', () => {
    cy.contains('SubControl').should('be.visible');
    cy.contains('Faça login para continuar').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('logs in with valid credentials', () => {
    cy.get('input[type="email"]').type('admin@subcontrol.com');
    cy.get('input[type="password"]').type('admin123');
    cy.contains('button', 'Entrar').click();
    cy.contains('Consultar Assinaturas').should('be.visible');
    cy.contains('Admin').should('be.visible');
  });

  it('shows error for wrong password', () => {
    cy.get('input[type="email"]').type('admin@subcontrol.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.contains('button', 'Entrar').click();
    cy.contains('Email ou senha incorretos').should('be.visible');
  });

  it('shows error for non-existent user', () => {
    cy.get('input[type="email"]').type('nobody@test.com');
    cy.get('input[type="password"]').type('test123');
    cy.contains('button', 'Entrar').click();
    cy.contains('Email ou senha incorretos').should('be.visible');
  });

  it('toggles to register form', () => {
    cy.contains('Criar conta').click();
    cy.contains('Crie sua conta').should('be.visible');
    cy.get('input').should('have.length', 3);
  });

  it('logs out successfully', () => {
    cy.login();
    cy.contains('button', 'Sair').click();
    cy.contains('Faça login para continuar').should('be.visible');
  });
});
```

- [ ] **Step 6: Install Cypress**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/cypress && npm install`

- [ ] **Step 7: Commit**

```bash
git add cypress/
git commit -m "test: add Cypress setup and login E2E tests"
```

---

## Task 18: E2E Tests — Cadastrar (HU-001)

**Files:**
- Create: `cypress/e2e/cadastrar.cy.js`

- [ ] **Step 1: Create cadastrar.cy.js**

```js
describe('HU-001: Cadastrar Assinatura', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('Cadastrar').click();
    cy.contains('Cadastrar Assinatura').should('be.visible');
  });

  it('CA1: displays all required form fields', () => {
    cy.contains('Nome do Serviço').should('be.visible');
    cy.contains('Categoria').should('be.visible');
    cy.contains('Valor (R$)').should('be.visible');
    cy.contains('Periodicidade').should('be.visible');
    cy.contains('Data de Início').should('be.visible');
    cy.contains('Próxima Renovação').should('be.visible');
    cy.contains('Forma de Pagamento').should('be.visible');
    cy.contains('Status').should('be.visible');
    cy.contains('Observações').should('be.visible');
  });

  it('CA2: rejects invalid value with MSG001', () => {
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').type('Test Service');
    cy.get('input[type="number"]').first().clear().type('-10');
    cy.contains('button', 'Gravar Assinatura').click();
    cy.contains('O valor informado é inválido. Informe um valor numérico positivo.').should('be.visible');
  });

  it('CA3: rejects past renewal date with MSG002', () => {
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').type('Test Service');
    cy.get('input[type="number"]').first().clear().type('10');
    cy.get('select').eq(1).select('Mensal');
    cy.get('input[type="date"]').last().type('2020-01-01');
    cy.contains('button', 'Gravar Assinatura').click();
    cy.contains('A data de renovação não pode ser anterior à data atual.').should('be.visible');
  });

  it('CA5/CA6: shows confirmation modal and creates subscription', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').type('Teste E2E');
    cy.get('input[type="number"]').first().clear().type('29.90');
    cy.get('select').eq(1).select('Mensal');
    cy.get('input[type="date"]').last().type(tomorrow);

    cy.contains('button', 'Gravar Assinatura').click();
    cy.contains('Deseja confirmar o cadastro da assinatura Teste E2E').should('be.visible');
    cy.contains('button', 'Confirmar').click();
    cy.contains('Assinatura cadastrada com sucesso.').should('be.visible');
  });

  it('CA4: rejects duplicate name with MSG003', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').type('Netflix Premium');
    cy.get('input[type="number"]').first().clear().type('55.90');
    cy.get('select').eq(1).select('Mensal');
    cy.get('input[type="date"]').last().type(tomorrow);

    cy.contains('button', 'Gravar Assinatura').click();
    cy.contains('button', 'Confirmar').click();
    cy.contains('Já existe uma assinatura cadastrada com este nome de serviço.').should('be.visible');
  });

  it('CA7: defaults category to Outros when not selected', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').type('Sem Categoria');
    cy.get('input[type="number"]').first().clear().type('10');
    cy.get('select').eq(1).select('Mensal');
    cy.get('input[type="date"]').last().type(tomorrow);

    cy.contains('button', 'Gravar Assinatura').click();
    cy.contains('button', 'Confirmar').click();
    cy.contains('Assinatura cadastrada com sucesso.').should('be.visible');

    cy.contains('Consultar').click();
    cy.contains('Sem Categoria').should('be.visible');
    cy.contains('Outros').should('be.visible');
  });

  it('clears form on Cancel', () => {
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').type('Will be cleared');
    cy.contains('button', 'Cancelar').click();
    cy.get('input[placeholder="Ex: Netflix, Spotify..."]').should('have.value', '');
  });

  it('shows hint about monthly calculation', () => {
    cy.contains('calcula automaticamente o valor mensal equivalente').should('be.visible');
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add cypress/e2e/cadastrar.cy.js
git commit -m "test: add E2E tests for HU-001 Cadastrar Assinatura"
```

---

## Task 19: E2E Tests — Consultar (HU-002)

**Files:**
- Create: `cypress/e2e/consultar.cy.js`

- [ ] **Step 1: Create consultar.cy.js**

```js
describe('HU-002: Consultar e Filtrar Assinaturas', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('Consultar Assinaturas').should('be.visible');
  });

  it('CA1: displays subscription list with required columns', () => {
    cy.contains('th', 'Serviço').should('be.visible');
    cy.contains('th', 'Valor').should('be.visible');
    cy.contains('th', 'Período').should('be.visible');
    cy.contains('th', 'Mensal Eq.').should('be.visible');
    cy.contains('th', 'Renovação').should('be.visible');
    cy.contains('th', 'Status').should('be.visible');
    cy.contains('Netflix Premium').should('be.visible');
  });

  it('CA3: shows totalizador cards', () => {
    cy.contains('Assinaturas Ativas').should('be.visible');
    cy.contains('Gasto Mensal').should('be.visible');
    cy.contains('Gasto Anual Estimado').should('be.visible');
    cy.contains('4 de 6').should('be.visible');
  });

  it('CA2/CA4: filters by status tab', () => {
    cy.contains('button', 'Pausadas').click();
    cy.contains('Smart Fit').should('be.visible');
    cy.contains('Netflix Premium').should('not.exist');
  });

  it('CA2: filters by search text', () => {
    cy.get('input[placeholder="Nome do serviço..."]').type('spotify');
    cy.contains('Spotify Família').should('be.visible');
    cy.contains('Netflix Premium').should('not.exist');
  });

  it('CA2: filters by category', () => {
    cy.get('select').first().select('Streaming');
    cy.contains('Netflix Premium').should('be.visible');
    cy.contains('Spotify Família').should('not.exist');
  });

  it('CA5: shows status badges with correct colors', () => {
    cy.contains('Ativa').should('be.visible');
    cy.contains('Pausada').should('be.visible');
    cy.contains('Cancelada').should('be.visible');
  });

  it('CA6: sorts by column click', () => {
    cy.contains('th', 'Valor').click();
    cy.get('table tbody tr').first().should('contain', 'Spotify');
  });

  it('CA7: shows empty message with no results', () => {
    cy.get('input[placeholder="Nome do serviço..."]').type('XYZNONEXISTENT');
    cy.contains('Nenhuma assinatura encontrada para os filtros selecionados.').should('be.visible');
  });

  it('CA8: displays donut chart', () => {
    cy.contains('Distribuição por Categoria').should('be.visible');
    cy.get('svg').should('be.visible');
  });

  it('clears all filters', () => {
    cy.get('input[placeholder="Nome do serviço..."]').type('test');
    cy.contains('button', 'Limpar').click();
    cy.get('input[placeholder="Nome do serviço..."]').should('have.value', '');
    cy.contains('Netflix Premium').should('be.visible');
  });

  it('shows quick summary card', () => {
    cy.contains('Resumo Rápido').should('be.visible');
    cy.contains('Próxima Renovação').should('be.visible');
    cy.contains('Maior Gasto').should('be.visible');
    cy.contains('Menor Gasto').should('be.visible');
    cy.contains('Economia se cancelar pausadas').should('be.visible');
  });

  it('navigate to alerts via Configurar Alerta link', () => {
    cy.contains('Configurar Alerta').first().click();
    cy.contains('Alertas de Renovação').should('be.visible');
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add cypress/e2e/consultar.cy.js
git commit -m "test: add E2E tests for HU-002 Consultar e Filtrar Assinaturas"
```

---

## Task 20: E2E Tests — Alertas (HU-003)

**Files:**
- Create: `cypress/e2e/alertas.cy.js`

- [ ] **Step 1: Create alertas.cy.js**

```js
describe('HU-003: Configurar Alertas de Renovação', () => {
  beforeEach(() => {
    cy.login();
    cy.contains('Alertas').click();
    cy.contains('Alertas de Renovação').should('be.visible');
  });

  it('CA2: shows global alert config', () => {
    cy.contains('Alerta Padrão Global').should('be.visible');
    cy.contains('dias antes').should('be.visible');
  });

  it('CA3: validates alert days range (MSG009)', () => {
    cy.get('input[type="number"]').first().clear().type('0');
    cy.contains('A antecedência do alerta deve ser um valor entre 1 e 30 dias.').should('be.visible');
  });

  it('CA4: shows upcoming renewals within 30 days', () => {
    cy.contains('Próximos Vencimentos').should('be.visible');
    cy.contains('Netflix Premium').should('be.visible');
    cy.contains('Spotify Família').should('be.visible');
    cy.contains('Duolingo Plus').should('be.visible');
  });

  it('CA4: excludes cancelled subscriptions', () => {
    cy.contains('HBO Max').should('not.exist');
  });

  it('CA5: displays days remaining counter', () => {
    cy.contains('dias').should('be.visible');
  });

  it('CA6: toggle alert on/off', () => {
    cy.get('button[style*="width: 48px"]').first().click();
    cy.contains('Desativado').should('be.visible');
    cy.get('button[style*="width: 48px"]').first().click();
  });

  it('CA7: saves config with success toast (MSG010)', () => {
    cy.contains('button', 'Salvar Configuração').click();
    cy.contains('Configuração de alerta salva com sucesso.').should('be.visible');
  });

  it('CA8: shows urgency highlighting', () => {
    cy.contains('Netflix Premium').parent().parent()
      .should('have.css', 'background-color');
  });

  it('shows timeline section', () => {
    cy.contains('Timeline').should('be.visible');
  });

  it('CA1: allows individual alert days config', () => {
    cy.get('input[type="number"]').eq(1).clear().type('7');
    cy.wait(500);
  });
});
```

- [ ] **Step 2: Commit**

```bash
git add cypress/e2e/alertas.cy.js
git commit -m "test: add E2E tests for HU-003 Configurar Alertas de Renovação"
```

---

## Task 21: Root Setup + README

**Files:**
- Create: `package.json` (root)
- Create: `.gitignore` (root)

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "subcontrol",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "test:unit": "cd backend && npm run test:unit",
    "test:api": "cd backend && npm run test:api",
    "test:backend": "cd backend && npm test",
    "test:e2e": "cd cypress && npx cypress run",
    "test:e2e:open": "cd cypress && npx cypress open",
    "install:all": "cd backend && npm install && cd ../frontend && npm install && cd ../cypress && npm install"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

- [ ] **Step 2: Create root .gitignore**

```
node_modules/
*.db
dist/
coverage/
.DS_Store
```

- [ ] **Step 3: Install root dependencies**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol && npm install`

- [ ] **Step 4: Initialize git repo**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol && git init`

- [ ] **Step 5: Commit everything**

```bash
git add -A
git commit -m "feat: SubControl full-stack system with tests

- Backend: Node.js + Express + SQLite + JWT auth
- Frontend: React + Vite with 4 pages (Login, Cadastrar, Consultar, Alertas)
- Unit tests: Jest (calculations, validations)
- API tests: Jest + Supertest (auth, subscriptions CRUD, filters, alerts)
- E2E tests: Cypress (login, HU-001, HU-002, HU-003)
- Covers all acceptance criteria from HU-001, HU-002, HU-003"
```

---

## Task 22: Verify Everything Works

- [ ] **Step 1: Start backend**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && node src/server.js &`
Expected: `SubControl API running on http://localhost:3001`

- [ ] **Step 2: Start frontend**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/frontend && npx vite &`
Expected: `Local: http://localhost:5173/`

- [ ] **Step 3: Run unit tests**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npx jest tests/unit --verbose`
Expected: All 17 unit tests PASS

- [ ] **Step 4: Run API tests**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npx jest tests/api --verbose`
Expected: All 22 API tests PASS

- [ ] **Step 5: Run E2E tests**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/cypress && npx cypress run`
Expected: All 4 spec files pass (login + HU-001 + HU-002 + HU-003)

- [ ] **Step 6: Run full coverage report**

Run: `cd /Users/joaoalbernaz/Desktop/subcontrol/backend && npx jest --coverage`
Expected: Coverage report with statements/branches/functions summary
