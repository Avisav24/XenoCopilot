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
export const strategizeCampaign = (goal: string) =>
  fetchAPI<{ 
    opportunityAnalysis: { score: number; potentialRevenue: number; audienceSize: number; historicalConversion: number; confidence: number; revenueAtRisk: number; };
    aiRecommendation: { recommendedVariantId: string; why: string[]; expectedOutcome: { revenue: number; purchases: number; conversion: number; }; };
    variants: { id: string; name: string; message: string; expectedRevenue: number; openRate: number; purchaseRate: number; confidence: number; strengths: string[]; risks: string[]; }[] 
  }>('/api/ai/strategize', {
    method: 'POST',
    body: JSON.stringify({ goal }),
  });
export const getDynamicSuggestions = () => fetchAPI<string[]>('/api/ai/suggestions');

export const getDynamicPersonas = () => fetchAPI<{
  id: string;
  name: string;
  customerCount: number;
  revenueContribution: number;
  avgLTV: number;
  avgAOV: number;
  churnRisk: string;
  bestChannel: string;
  bestCampaignType: string;
  revenueOpportunity: number;
  monthlyTrend: string;
  recommendedAction: string;
  expectedImpact: number;
  aiSummary: string;
}[]>('/api/ai/dynamic-personas');

export const getOpportunities = () => fetchAPI<{
  id: string;
  title: string;
  potentialRevenue: number;
  audience: number;
  confidence: number;
  score: number;
  reasoning: string[];
  aiExplanation: string;
  recommendedAction: string;
  revenueAtRisk: number;
  urgency: string;
  actionScenario: { description: string; value: number };
  noActionScenario: { description: string; value: number; churnImpact: string };
}[]>('/api/ai/opportunities');

export const getNextBestAction = (customer_id: string) => 
  fetchAPI<{ action: string; confidence: number; expectedRevenue: number; revenueAtRisk: number; reasoning: string[] }>('/api/ai/next-best-action', {
    method: 'POST',
    body: JSON.stringify({ customer_id }),
  });

export const simulateCampaign = (audience_size: number) => 
  fetchAPI<any[]>('/api/ai/simulate-campaign', {
    method: 'POST',
    body: JSON.stringify({ audience_size }),
  });
// ── Campaigns ─────────────────────────────────────────────
export const getCampaigns = () => fetchAPI<any[]>('/api/campaigns');
export const getCampaign = (id: string) => fetchAPI<any>(`/api/campaigns/${id}`);
export const getCampaignMessages = (id: string, limit?: number) => fetchAPI<any[]>(`/api/campaigns/${id}/messages${limit ? `?limit=${limit}` : ''}`);
export const getCampaignInsights = (id: string) => fetchAPI<any>(`/api/campaigns/${id}/insights`);

// ── Customers ─────────────────────────────────────────────
export const getCustomers = (params?: { limit?: number; offset?: number; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  if (params?.search) qs.set('search', params.search);
  return fetchAPI(`/api/customers?${qs}`);
};

export const getCustomer = (id: string) => fetchAPI<any>(`/api/customers/${id}`);

export const getPersonas = () => fetchAPI<any[]>('/api/personas');

export const getCustomerStats = () => fetchAPI<{
  total: number;
  active: number;
  atRisk: number;
  vip: number;
  dormant: number;
  avgLTV: number;
  avgAOV: number;
  healthDist: Record<string, number>;
  topPersonas: { name: string; count: number }[];
  topRevenuePersonas: { name: string; revenue: number }[];
}>('/api/customers/stats');

// ── Revenue ───────────────────────────────────────────────
export const getRevenueStats = () => fetchAPI<{
  totalRevenueInfluenced: number;
  customersReactivated: number;
  atRiskSaved: number;
  topPersona: string;
  topChannel: string;
  revenueByCampaign: { name: string; value: number }[];
  revenueByPersona: { name: string; value: number }[];
  revenueByOpportunity: { name: string; value: number }[];
  channelIntelligence: { channel: string; revenue: number; ctr: number; conversion: number }[];
  keyInsight?: string;
  keyRisk?: string;
  keyOpportunity?: string;
}>('/api/revenue/stats');
