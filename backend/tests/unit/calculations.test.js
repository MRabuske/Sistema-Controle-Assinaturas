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
