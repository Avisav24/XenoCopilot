import { fetchAPI } from './core';

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
