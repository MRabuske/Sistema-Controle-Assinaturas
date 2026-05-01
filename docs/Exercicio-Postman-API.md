# Exercicio de Teste de API com Postman

**Projeto:** SubControl - Sistema de Controle de Assinaturas  
**Disciplina:** Teste de Software  
**Aluno:** Joao Victor Martins Albernaz

---

## Objetivo

Testar a API REST do SubControl utilizando o Postman, validando respostas (status code, corpo e tempo) e criando testes automatizados.

---

## API Testada

- **Base URL:** `http://localhost:3001`
- **Tipo:** API REST com autenticacao JWT
- **Formato:** JSON

---

## Estrutura da Collection

A collection **"SubControl API Tests"** possui 4 pastas com 19 requests:

### Pasta 1 — Auth (5 requests)

| # | Request | Metodo | Endpoint | Status Esperado | O que valida |
|---|---------|--------|----------|-----------------|-------------|
| 1.1 | Login com credenciais validas | POST | /api/auth/login | 200 | Retorna token JWT |
| 1.2 | Login com senha errada | POST | /api/auth/login | 401 | Mensagem "Credenciais invalidas" |
| 1.3 | Login com campos vazios | POST | /api/auth/login | 400 | Mensagem de erro |
| 1.4 | Registrar novo usuario | POST | /api/auth/register | 201 | Retorna token e user |
| 1.5 | Acesso sem token | GET | /api/subscriptions | 401 | Bloqueia acesso nao autenticado |

### Pasta 2 — Assinaturas CRUD / HU-001 (9 requests)

| # | Request | Metodo | Endpoint | Status Esperado | O que valida |
|---|---------|--------|----------|-----------------|-------------|
| 2.1 | Listar assinaturas | GET | /api/subscriptions | 200 | Retorna array com assinaturas |
| 2.2 | Criar assinatura valida | POST | /api/subscriptions | 201 | Campos corretos, calculo mensal |
| 2.3 | Criar duplicada (MSG003) | POST | /api/subscriptions | 400 | "Ja existe uma assinatura cadastrada com este nome" |
| 2.4 | Criar com valor negativo (MSG001) | POST | /api/subscriptions | 400 | "O valor informado e invalido" |
| 2.5 | Criar com data passada (MSG002) | POST | /api/subscriptions | 400 | "A data de renovacao nao pode ser anterior a data atual" |
| 2.6 | Criar assinatura Anual (CA6) | POST | /api/subscriptions | 201 | Valor mensal = valor / 12 |
| 2.7 | Atualizar assinatura | PUT | /api/subscriptions/:id | 200 | Nome atualizado corretamente |
| 2.8 | Deletar assinatura | DELETE | /api/subscriptions/:id | 200 | Mensagem de sucesso |
| 2.9 | Verificar exclusao (404) | GET | /api/subscriptions/:id | 404 | Assinatura nao existe mais |

### Pasta 3 — Filtros e Estatisticas / HU-002 (5 requests)

| # | Request | Metodo | Endpoint | Status Esperado | O que valida |
|---|---------|--------|----------|-----------------|-------------|
| 3.1 | Filtrar por status | GET | /api/subscriptions?status=Ativa | 200 | Todos os resultados com status "Ativa" |
| 3.2 | Filtrar por categoria | GET | /api/subscriptions?category=Streaming | 200 | Todos com categoria "Streaming" |
| 3.3 | Buscar por nome | GET | /api/subscriptions?search=netflix | 200 | Retorna somente Netflix |
| 3.4 | Filtrar por faixa de valor | GET | /api/subscriptions?min_value=50&max_value=100 | 200 | Valores dentro da faixa |
| 3.5 | Estatisticas | GET | /api/subscriptions/stats | 200 | Total, ativos, gasto mensal e anual |

### Pasta 4 — Alertas / HU-003 (5 requests)

| # | Request | Metodo | Endpoint | Status Esperado | O que valida |
|---|---------|--------|----------|-----------------|-------------|
| 4.1 | Obter configuracoes | GET | /api/settings | 200 | Retorna default_alert_days |
| 4.2 | Atualizar alerta global | PUT | /api/settings/alert | 200 | Dias atualizados corretamente |
| 4.3 | Alerta global fora do range (MSG009) | PUT | /api/settings/alert | 400 | "Antecedencia entre 1 e 30 dias" |
| 4.4 | Configurar alerta individual (CA1) | PUT | /api/subscriptions/:id/alert | 200 | alert_days e alert_enabled corretos |
| 4.5 | Desabilitar alerta individual (CA6) | PUT | /api/subscriptions/:id/alert | 200 | alert_enabled = 0 |

---

## Testes Automatizados

Cada request possui scripts de teste (`pm.test`) que validam 3 aspectos:

### 1. Status Code
```javascript
pm.test('Status code e 200', function () {
    pm.response.to.have.status(200);
});
```

### 2. Corpo da Resposta
```javascript
pm.test('Retorna token JWT', function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property('token');
    pm.expect(json.token).to.be.a('string');
});
```

### 3. Tempo de Resposta
```javascript
pm.test('Tempo de resposta menor que 3 segundos', function () {
    pm.expect(pm.response.responseTime).to.be.below(3000);
});
```

---

## Variaveis da Collection

A collection utiliza variaveis para encadear as requests automaticamente:

| Variavel | Uso |
|----------|-----|
| `baseUrl` | URL base da API (`http://localhost:3001`) |
| `token` | Token JWT salvo automaticamente apos o login (request 1.1) |
| `subscriptionId` | ID da assinatura salvo automaticamente apos criacao (request 2.2) |

Isso permite que o **Collection Runner** execute todas as 19 requests em sequencia sem intervencao manual.

---

## Como Executar

1. Iniciar a API: `npm run dev:backend`
2. No Postman: **Import** > `docs/SubControl-Postman-Collection.json`
3. Clicar com botao direito na collection > **Run collection**
4. Todas as 19 requests executam em ordem com **~50 assertions**

---

## Resultados Esperados

- **19/19 requests** executadas com sucesso
- **~50 assertions** passando (status, corpo, tempo)
- **Tempo medio** de resposta < 100ms
- **Cobertura:** autenticacao, CRUD completo, validacoes de negocio, filtros e alertas
