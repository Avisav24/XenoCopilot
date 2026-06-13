const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

const API_URL = typeof window === 'undefined'
  ? (process.env.BACKEND_API_URL || 'http://localhost:3001')
  : isLocalhost 
    ? '' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://xenocopilot-production.up.railway.app');

export async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }

  return res.json();
}
