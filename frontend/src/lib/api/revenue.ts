import { fetchAPI } from './core';

export const getRevenueStats = () => fetchAPI<{
  totalRevenueInfluenced: number;
  customersReactivated: number;
  atRiskSaved: number;
  topPersona: string;
  topChannel: string;
  revenueByCampaign: { name: string; value: number }[];
  revenueByPersona: { name: string; value: number }[];
  revenueByOpportunity: { name: string; value: number }[];
  channelIntelligence: { channel: string; revenue: number; ctr: number; conversion: number; roi: number }[];
  keyInsight?: string;
  keyRisk?: string;
  keyOpportunity?: string;
  revenueTrend?: { date: string, value: number }[];
  aiInsights?: { insight: string; metric: string; value: string; actionLabel: string }[];
  opportunities?: { name: string; value: string; audience: string; confidence: number; actionLabel: string }[];
}>('/api/revenue/stats');

export const getRevenueLeaks = () => fetchAPI<any[]>('/api/revenue/leaks');

export const getRevenueDebug = () => fetchAPI<any>('/api/revenue/debug');

export const saveRevenueMemory = (data: any) => fetchAPI<any>('/api/revenue/memories', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const simulateCampaign = (data: {
  segmentId?: string;
  audienceName?: string;
  channel: string;
  offer?: string;
  discount?: string;
  sendTime?: string;
  campaignGoal: string;
}) => fetchAPI<any>('/api/revenue/simulate', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const generateRevenuePlan = (revenueGoal: string) => fetchAPI<any>('/api/revenue/planner', {
  method: 'POST',
  body: JSON.stringify({ revenueGoal })
});

export const getRevenueOpportunities = () => fetchAPI<any[]>('/api/revenue/opportunities');

export const saveCampaignMemory = (data: {
  campaignName: string;
  audienceSegment: string;
  channel: string;
  revenue: number;
  conversionRate: number;
  learnings: string[];
}) => fetchAPI<any>('/api/revenue/memories', {
  method: 'POST',
  body: JSON.stringify(data)
});
