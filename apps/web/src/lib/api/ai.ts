import { fetchAPI } from './core';

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
