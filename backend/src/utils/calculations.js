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
