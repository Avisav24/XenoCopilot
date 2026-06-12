import { fetchAPI } from './core';

export const getCampaigns = () => fetchAPI<any[]>('/api/campaigns');

export const getCampaign = (id: string) => fetchAPI<any>(`/api/campaigns/${id}`);

export const getCampaignMessages = (id: string, limit?: number) => 
  fetchAPI<any[]>(`/api/campaigns/${id}/messages${limit ? `?limit=${limit}` : ''}`);

export const getCampaignInsights = (id: string) => fetchAPI<any>(`/api/campaigns/${id}/insights`);
