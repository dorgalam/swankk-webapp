const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(`API ${res.status}`);
    err.status = res.status;
    try { err.data = await res.json(); } catch {}
    throw err;
  }
  return res.json();
}

export const api = {
  designers: {
    list: () => request('/designers'),
    filter: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/designers/filter?${qs}`);
    },
    create: (data) => request('/designers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/designers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/designers/${id}`, { method: 'DELETE' }),
  },
  collections: {
    filter: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/collections?${qs}`);
    },
    filterPublic: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/collections/public?${qs}`);
    },
    create: (data) => request('/collections', { method: 'POST', body: JSON.stringify(data) }),
    bulkCreate: (data) => request('/collections/bulk', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/collections/${id}`, { method: 'DELETE' }),
  },
  savedItems: {
    filter: (params) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/saved-items?${qs}`);
    },
    create: (data) => request('/saved-items', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/saved-items/${id}`, { method: 'DELETE' }),
  },
  designerRequests: {
    create: (data) => request('/designer-requests', { method: 'POST', body: JSON.stringify(data) }),
  },
  auth: {
    me: () => request('/auth/me'),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    tables: () => request('/admin/tables'),
    query: (sql, params) => request('/admin/query', { method: 'POST', body: JSON.stringify({ sql, params }) }),
  },
};
