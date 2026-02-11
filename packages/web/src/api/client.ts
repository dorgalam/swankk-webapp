const BASE = '/api';

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers as Record<string, string> },
    ...options,
  });
  if (!res.ok) {
    let data: unknown;
    try { data = await res.json(); } catch {}
    throw new ApiError(`API ${res.status}`, res.status, data);
  }
  return res.json();
}

export const api = {
  designers: {
    list: () => request('/designers'),
    filter: (params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/designers/filter?${qs}`);
    },
    create: (data: Record<string, unknown>) => request('/designers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number | string, data: Record<string, unknown>) => request(`/designers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number | string) => request(`/designers/${id}`, { method: 'DELETE' }),
  },
  collections: {
    filter: (params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/collections?${qs}`);
    },
    filterPublic: (params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/collections/public?${qs}`);
    },
    create: (data: Record<string, unknown>) => request('/collections', { method: 'POST', body: JSON.stringify(data) }),
    bulkCreate: (data: Record<string, unknown>[]) => request('/collections/bulk', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number | string, data: Record<string, unknown>) => request(`/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number | string) => request(`/collections/${id}`, { method: 'DELETE' }),
  },
  savedItems: {
    filter: (params: Record<string, string>) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/saved-items?${qs}`);
    },
    create: (data: Record<string, unknown>) => request('/saved-items', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number | string) => request(`/saved-items/${id}`, { method: 'DELETE' }),
  },
  designerRequests: {
    create: (data: Record<string, unknown>) => request('/designer-requests', { method: 'POST', body: JSON.stringify(data) }),
  },
  auth: {
    me: () => request('/auth/me'),
    login: (data: { email: string; password: string }) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    register: (data: { email: string; password: string; full_name: string }) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  admin: {
    tables: () => request('/admin/tables'),
    query: (sql: string, params?: unknown[]) => request('/admin/query', { method: 'POST', body: JSON.stringify({ sql, params }) }),
  },
};
