'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '@/lib/api';
import { Search } from 'iconoir-react';
import { clsx } from 'clsx';

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

// Minimal background/text color combos for personas
const PERSONA_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-orange-50 text-orange-700 border-orange-100',
  'bg-pink-50 text-pink-700 border-pink-100',
  'bg-teal-50 text-teal-700 border-teal-100',
];

// Simple hash function to assign a consistent color to a persona string
function getPersonaColor(persona: string) {
  let hash = 0;
  for (let i = 0; i < persona.length; i++) {
    hash = persona.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PERSONA_COLORS[Math.abs(hash) % PERSONA_COLORS.length];
}

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
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)]">
      {/* Header & Big Centered Search */}
      <div className="flex flex-col items-center justify-center py-10 bg-canvas rounded-xl border border-hairline relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <h1 className="text-[32px] font-display font-normal text-ink mb-2 z-10">Customer Database</h1>
        <p className="text-body text-[16px] mb-8 z-10">{total.toLocaleString()} shoppers tracked in real-time.</p>
        
        <div className="relative w-full max-w-2xl z-10 px-4">
          <Search className="w-5 h-5 text-muted absolute left-8 top-1/2 -translate-y-1/2" />
          <input
            id="customer-search"
            type="text"
            placeholder="Search by name, email, phone, city, persona, or price..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-hairline shadow-sm text-[16px] text-ink placeholder-muted-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="card overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-surface-soft border-b border-hairline shadow-sm">
              <tr>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-muted uppercase tracking-wider">City</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-muted uppercase tracking-wider">Personas</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-muted uppercase tracking-wider">Total Spend</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-muted uppercase tracking-wider">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline bg-canvas">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
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
                      <tr key={c.id} className="hover:bg-surface-soft transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-surface-strong flex items-center justify-center text-ink text-[13px] font-bold flex-shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {initials}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-ink leading-tight mb-0.5">{c.name}</p>
                              <p className="text-[13px] text-muted">{c.email || c.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[14px] text-body">
                          {c.city || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            {c.personas.map(p => (
                              <span key={p} className={clsx("text-[12px] px-2.5 py-1 rounded-md border font-medium", getPersonaColor(p))}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[14px] font-mono-numbers font-medium text-ink">
                          ₹{c.total_spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-6 py-4 text-[14px] text-muted">
                          {daysSince !== null ? `${daysSince}d ago` : '—'}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="p-4 border-t border-hairline flex items-center justify-between bg-canvas">
            <p className="text-[14px] text-muted font-medium">
              Showing {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn-ghost !px-3 !py-1.5 text-[13px] disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * LIMIT >= total}
                className="btn-ghost !px-3 !py-1.5 text-[13px] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
