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
