'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '@/lib/api';

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  personas: string[];
  total_spent: number;
  last_order_date: string | null;
  signup_date: string;
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
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">City</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Personas</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spend</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-3.5">
                      <div className="h-6 skeleton rounded w-full" />
                    </td>
                  </tr>
                ))
              : customers.map((c) => {
                  const initials = c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  const daysSince = c.last_order_date
                    ? Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.email || c.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {c.city || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {c.personas.map(p => (
                            <span key={p} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-slate-800">
                        ₹{c.total_spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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
