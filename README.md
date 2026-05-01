# SubControl - Sistema de Controle de Assinaturas

Projeto da disciplina de Teste de Software. Sistema completo para gerenciar assinaturas de servicos recorrentes (streaming, software, etc).

## Requisitos

- **Node.js** v18 ou superior — [Download](https://nodejs.org/)
- **Postman** (para testes de API) — [Download](https://www.postman.com/downloads/)

## Como Rodar

### 1. Clonar o repositorio

```bash
git clone https://github.com/MRabuske/Sistema-Controle-Assinaturas.git
cd Sistema-Controle-Assinaturas
```

### 2. Instalar dependencias

```bash
npm run install:all
```

### 3. Iniciar o sistema

```bash
npm run dev
```

Isso inicia o backend (porta 3001) e o frontend (porta 5173) simultaneamente.

### 4. Acessar no navegador

```
http://localhost:5173
```

### Login

| Campo | Valor |
|-------|-------|
| Email | `admin@subcontrol.com` |
| Senha | `admin123` |

## Funcionalidades

### Cadastrar (HU-001)
- Cadastro de novas assinaturas com nome, categoria, valor, periodicidade, forma de pagamento, data de renovacao e status
- Calculo automatico do valor mensal equivalente
- Validacoes: nome duplicado, valor positivo, data futura

### Consultar (HU-002)
- Listagem de todas as assinaturas com filtros por status, categoria, busca por nome e faixa de valor
- Painel com estatisticas: total de assinaturas, assinaturas ativas, gasto mensal e gasto anual
- Grafico de distribuicao por categoria

### Alertas (HU-003)
- Configuracao global de dias de antecedencia para alertas de renovacao
- Configuracao individual por assinatura
- Timeline de proximos vencimentos (30 dias)

## Testes

### Testes Unitarios e de API

```bash
npm run test:backend
```

Resultado esperado: **51 testes passando** (22 unitarios + 29 de API)

### Testes E2E (Cypress)

Com o sistema rodando (`npm run dev`), em outro terminal:

```bash
npm run test:e2e
```

Ou para abrir a interface visual do Cypress:

```bash
npm run test:e2e:open
```

## Exercicio de Teste de API com Postman

A collection do Postman esta em `docs/SubControl-Postman-Collection.json`.

### Como usar

1. Abra o **Postman**
2. Clique em **Import** > selecione o arquivo `docs/SubControl-Postman-Collection.json`
3. Certifique-se de que o backend esta rodando (`npm run dev:backend`)
4. Execute as requests **na ordem** (a primeira request de login salva o token automaticamente)

### Executar todos os testes de uma vez

1. Clique com botao direito na collection **"SubControl - Testes de API"**
2. Selecione **"Run collection"**
3. Clique em **"Run SubControl - Testes de API"**

### O que a collection testa

| Pasta | Requests | O que valida |
|-------|----------|-------------|
| Auth | 5 | Login valido/invalido, registro, acesso sem token |
| Assinaturas CRUD (HU-001) | 9 | Criar, editar, deletar, validacoes de nome duplicado, valor negativo, data passada |
| Filtros (HU-002) | 5 | Filtro por status, categoria, busca, faixa de valor, estatisticas |
| Alertas (HU-003) | 5 | Alerta global, individual, validacao de range |

**Total: 19 requests com ~50 assertions automatizadas**

Cada request valida:
- **Status code** (200, 201, 400, 401, 404)
- **Corpo da resposta** (campos e mensagens de erro)
- **Tempo de resposta** (< 3 segundos)

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Banco de Dados | SQLite (better-sqlite3) |
| Autenticacao | JWT (jsonwebtoken + bcryptjs) |
| Testes Unitarios/API | Jest + Supertest |
| Testes E2E | Cypress |
| Testes de API | Postman |

## Estrutura do Projeto

```
├── backend/
│   ├── src/
│   │   ├── app.js              # Configuracao do Express
│   │   ├── server.js           # Ponto de entrada
│   │   ├── database.js         # SQLite + seed de dados
│   │   ├── middleware/auth.js   # Middleware JWT
│   │   ├── routes/auth.js      # Rotas de autenticacao
│   │   ├── routes/subscriptions.js  # Rotas CRUD
│   │   └── utils/calculations.js   # Logica de negocio
│   └── tests/
│       ├── unit/               # Testes unitarios
│       └── api/                # Testes de API
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Componente raiz
│   │   ├── pages/              # Telas (Login, Cadastrar, Consultar, Alertas)
│   │   ├── components/         # Componentes reutilizaveis
│   │   └── services/api.js     # Comunicacao com backend
│   └── vite.config.js
├── cypress/
│   └── e2e/                    # Testes E2E
├── docs/
│   └── SubControl-Postman-Collection.json  # Collection Postman
└── package.json
```
