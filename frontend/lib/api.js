import { getToken } from './auth';

function resolveApiBaseUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL;

  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined') {
    const host = String(window.location?.hostname || '').toLowerCase();
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://mandirledger.onrender.com';
    }
  }

  return 'http://localhost:5000';
}

const API_BASE_URL = resolveApiBaseUrl();

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data;
}
