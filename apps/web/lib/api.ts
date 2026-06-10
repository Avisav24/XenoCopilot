const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
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

// ── AI ────────────────────────────────────────────────────
export const planCampaign = (goal: string) =>
  fetchAPI('/api/ai/plan-campaign', {
    method: 'POST',
    body: JSON.stringify({ goal }),
  });

// ── Campaigns ─────────────────────────────────────────────
export const getCampaigns = () => fetchAPI('/api/campaigns');

export const getCampaign = (id: string) => fetchAPI(`/api/campaigns/${id}`);

export const createCampaign = (data: {
  name: string;
  goal: string;
  ai_plan?: unknown;
  segment_rules?: unknown;
}) =>
  fetchAPI('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const sendCampaign = (id: string) =>
  fetchAPI(`/api/campaigns/${id}/send`, { method: 'POST' });

export const getCampaignMessages = (id: string, limit = 50) =>
  fetchAPI(`/api/campaigns/${id}/messages?limit=${limit}`);

export const getCampaignInsights = (id: string) =>
  fetchAPI(`/api/campaigns/${id}/insights`);

// ── Customers ─────────────────────────────────────────────
export const getCustomers = (params?: { limit?: number; offset?: number; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  if (params?.search) qs.set('search', params.search);
  return fetchAPI(`/api/customers?${qs}`);
};

export const getCustomerStats = () => fetchAPI('/api/customers/stats');
