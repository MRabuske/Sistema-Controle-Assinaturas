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
