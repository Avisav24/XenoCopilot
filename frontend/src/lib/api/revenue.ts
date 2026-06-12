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
