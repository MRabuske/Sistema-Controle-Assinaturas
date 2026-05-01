# SubControl — Full-Stack Architecture Design

## Decisions

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken + bcrypt) |
| Unit Tests | Jest |
| API Tests | Jest + Supertest |
| E2E Tests | Cypress |

## Project Structure

```
subcontrol/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── database.js
│   │   ├── middleware/auth.js
│   │   ├── routes/auth.js
│   │   ├── routes/subscriptions.js
│   │   └── utils/calculations.js
│   ├── tests/
│   │   ├── unit/calculations.test.js
│   │   ├── unit/validations.test.js
│   │   └── api/auth.test.js
│   │   └── api/subscriptions.test.js
│   ├── package.json
│   └── jest.config.js
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── services/api.js
│   │   ├── pages/Login.jsx
│   │   ├── pages/Cadastrar.jsx
│   │   ├── pages/Consultar.jsx
│   │   ├── pages/Alertas.jsx
│   │   └── components/Navbar.jsx, Modal.jsx, Toast.jsx, DonutChart.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── cypress/
│   ├── e2e/login.cy.js, cadastrar.cy.js, consultar.cy.js, alertas.cy.js
│   ├── support/commands.js
│   └── cypress.config.js
└── docs/
```

## API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/auth/register | Create user | No |
| POST | /api/auth/login | Login, returns JWT | No |
| GET | /api/subscriptions | List with query filters | Yes |
| GET | /api/subscriptions/:id | Single subscription | Yes |
| POST | /api/subscriptions | Create (HU-001) | Yes |
| PUT | /api/subscriptions/:id | Update | Yes |
| DELETE | /api/subscriptions/:id | Delete | Yes |
| GET | /api/subscriptions/stats | Totals for HU-002 | Yes |
| PUT | /api/subscriptions/:id/alert | Individual alert (HU-003) | Yes |
| PUT | /api/settings/alert | Global alert (HU-003) | Yes |

## Database Schema (SQLite)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Outros',
  value REAL NOT NULL,
  period TEXT NOT NULL,
  start_date TEXT,
  renewal_date TEXT NOT NULL,
  payment TEXT,
  status TEXT DEFAULT 'Ativa',
  notes TEXT,
  monthly_value REAL NOT NULL,
  alert_days INTEGER,
  alert_enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, name COLLATE NOCASE)
);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  default_alert_days INTEGER DEFAULT 3,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Validation Rules (from HUs)

- RN001/RN002: Name required, max 100 chars, unique per user (case-insensitive) -> MSG003
- RN004: Value must be positive numeric -> MSG001
- RN005: Period required (Semanal/Mensal/Trimestral/Semestral/Anual)
- RN006: Renewal date cannot be in the past -> MSG002
- RN007: Status required (Ativa/Pausada/Cancelada), default Ativa
- RN008: Confirmation modal before save -> MSG004
- CA6 (HU-001): Auto-calculate monthly: Semanal*4.33, Mensal*1, Trimestral/3, Semestral/6, Anual/12
- RN009: Min value <= Max value in filters
- RN013: Alert days 1-30 -> MSG009
- RN014: Toggle alert on/off per subscription
- RN015: Days remaining = renewal_date - today
- RN016: Alert status: Pendente/Enviado/Desativado

## Test Coverage Map

| Type | File | HU | Tests |
|------|------|-----|-------|
| Unit | calculations.test.js | HU-001 CA6 | calcMonthly for all 5 periods |
| Unit | validations.test.js | HU-001/003 | Duplicate name, value validation, date validation, alert range |
| API | auth.test.js | Login | Register, login success, wrong password, invalid token |
| API | subscriptions.test.js | HU-001/002/003 | CRUD, filters, stats, alerts |
| E2E | login.cy.js | Login | Login flow, invalid credentials, redirect |
| E2E | cadastrar.cy.js | HU-001 | All CA1-CA7: form, validations, modal, toast, monthly calc |
| E2E | consultar.cy.js | HU-002 | All CA1-CA8: filters, sort, totals, chart, empty state |
| E2E | alertas.cy.js | HU-003 | All CA1-CA8: global, individual, toggle, urgency, timeline |
