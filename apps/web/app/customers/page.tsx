'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '@/lib/api';

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  preferred_channel: string | null;
  favorite_category: string | null;
  discount_affinity: boolean;
  total_orders: number;
  total_spend: number;
  last_order_at: string | null;
};

const CHANNEL_STYLES: Record<string, string> = {
  email: 'bg-blue-50 text-blue-600',
  whatsapp: 'bg-emerald-50 text-emerald-600',
  sms: 'bg-purple-50 text-purple-600',
};
const CHANNEL_ICONS: Record<string, string> = { email: '📧', whatsapp: '💬', sms: '📱' };

const CATEGORY_COLORS: Record<string, string> = {
  dresses: 'bg-pink-50 text-pink-600',
  tops: 'bg-orange-50 text-orange-600',
  denim: 'bg-blue-50 text-blue-600',
  accessories: 'bg-purple-50 text-purple-600',
  footwear: 'bg-amber-50 text-amber-600',
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const LIMIT = 50;

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () =>
      getCustomers({ limit: LIMIT, offset: page * LIMIT, search: search || undefined }) as Promise<{
        customers: Customer[];
        total: number;
      }>,
  });

  const customers = data?.customers || [];
  const total = data?.total || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <p className="text-slate-500 mt-1">{total.toLocaleString()} shoppers in Drape & Co.</p>
        </div>
        <div className="relative">
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="customer-search"
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 w-72"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Channel</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spend</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-3.5">
                      <div className="h-6 skeleton rounded w-full" />
                    </td>
                  </tr>
                ))
              : customers.map((c) => {
                  const initials = c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  const daysSince = c.last_order_at
                    ? Math.floor((Date.now() - new Date(c.last_order_at).getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.email || c.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.favorite_category && (
                          <span className={`status-badge ${CATEGORY_COLORS[c.favorite_category] || 'bg-slate-100 text-slate-600'}`}>
                            {c.favorite_category}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {c.preferred_channel && (
                          <span className={`status-badge ${CHANNEL_STYLES[c.preferred_channel] || 'bg-slate-100 text-slate-600'}`}>
                            {CHANNEL_ICONS[c.preferred_channel]} {c.preferred_channel}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{c.total_orders}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                        ₹{c.total_spend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">
                        {daysSince !== null ? `${daysSince}d ago` : '—'}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn-ghost text-sm border border-slate-200 disabled:opacity-50"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * LIMIT >= total}
                className="btn-ghost text-sm border border-slate-200 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
