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

// ── AI Persona Agent Workflow ─────────────────────────────
export const queryPersonas = (goal: string) =>
  fetchAPI<{ persona: { id: string; name: string; description: string }; count: number }>('/api/ai/query-personas', {
    method: 'POST',
    body: JSON.stringify({ goal }),
  });

export const recommendCampaign = (persona_id: string) =>
  fetchAPI<{ channel: string; expectedRevenue: number; expectedPurchasers: number; audienceCount: number }>('/api/ai/recommend-campaign', {
    method: 'POST',
    body: JSON.stringify({ persona_id }),
  });

export const draftMessages = (persona_name: string, channel: string) =>
  fetchAPI<{ variantA: string; variantB: string }>('/api/ai/draft-messages', {
    method: 'POST',
    body: JSON.stringify({ persona_name, channel }),
  });

export const launchCampaign = (data: { name: string; persona_id: string; channel: string; message: string }) =>
  fetchAPI<{ success: boolean; campaign_id: string; queued_count: number }>('/api/ai/launch-campaign', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ── Campaigns ─────────────────────────────────────────────
export const getCampaigns = () => fetchAPI('/api/campaigns');
export const getCampaign = (id: string) => fetchAPI(`/api/campaigns/${id}`);
export const getCampaignMessages = (id: string, limit?: number) => fetchAPI(`/api/campaigns/${id}/messages${limit ? `?limit=${limit}` : ''}`);
export const getCampaignInsights = (id: string) => fetchAPI(`/api/campaigns/${id}/insights`);

// ── Customers ─────────────────────────────────────────────
export const getCustomers = (params?: { limit?: number; offset?: number; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  if (params?.search) qs.set('search', params.search);
  return fetchAPI(`/api/customers?${qs}`);
};

export const getCustomerStats = () => fetchAPI('/api/customers/stats');
