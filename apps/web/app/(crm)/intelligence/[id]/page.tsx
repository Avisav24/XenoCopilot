'use client';

import { useQuery } from '@tanstack/react-query';
import { getCustomer } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Pulse, Clock, Heart, ArrowFatRight, Phone, Envelope, MapPin, WarningCircle } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const PERSONA_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-orange-50 text-orange-700 border-orange-100',
  'bg-pink-50 text-pink-700 border-pink-100',
  'bg-teal-50 text-teal-700 border-teal-100',
];

function getPersonaColor(persona: string) {
  let hash = 0;
  for (let i = 0; i < persona.length; i++) {
    hash = persona.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PERSONA_COLORS[Math.abs(hash) % PERSONA_COLORS.length];
}

export default function Customer360Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: c, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
  });

  if (isLoading) {
    return <div className="p-8 max-w-5xl mx-auto flex items-center justify-center h-full">Loading Profile...</div>;
  }

  if (!c) {
    return <div className="p-8 max-w-5xl mx-auto flex items-center justify-center h-full">Customer not found.</div>;
  }

  const daysSince = c.last_order_date
    ? Math.floor((Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isAtRisk = c.health_score < 40;
  const isVip = c.customer_personas.some((cp: any) => cp.persona.name === 'VIP Customer');

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6 h-[calc(100vh-4rem)] overflow-y-auto pb-20">
      
      {/* Navigation */}
      <button 
        onClick={() => router.push('/intelligence')}
        className="flex items-center gap-2 text-muted hover:text-ink text-[13px] font-semibold w-fit transition-colors mb-2"
      >
        <ArrowLeft size={54} /> Back to Intelligence
      </button>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-canvas p-6 rounded-2xl border border-hairline shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-surface-strong flex items-center justify-center text-ink text-[28px] font-display flex-shrink-0">
            {c.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[32px] font-display font-normal text-ink leading-none">{c.name}</h1>
              {isVip && <span className="px-2.5 py-0.5 rounded-full bg-[#d48166]/10 text-[#d48166] text-[10px] font-bold uppercase tracking-wider border border-[#d48166]/20">VIP</span>}
              {isAtRisk && <span className="px-2.5 py-0.5 rounded-full bg-semantic-down/10 text-semantic-down text-[10px] font-bold uppercase tracking-wider border border-semantic-down/20 flex items-center gap-1"><WarningCircle size={54}/> At Risk</span>}
            </div>
            <div className="flex gap-4 text-[13px] text-muted mt-2">
              <span className="flex items-center gap-1.5"><Envelope size={54}/> {c.email || 'No email'}</span>
              <span className="flex items-center gap-1.5"><Phone size={54}/> {c.phone || 'No phone'}</span>
              <span className="flex items-center gap-1.5"><MapPin size={54}/> {c.city || 'Unknown location'}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Health Score</span>
          <div className="flex items-end gap-1">
            <span className={clsx(
              "text-[48px] font-mono-numbers leading-none",
              isAtRisk ? "text-semantic-down" : c.health_score > 75 ? "text-semantic-up" : "text-ink"
            )}>
              {c.health_score}
            </span>
            <span className="text-[14px] text-muted font-bold mb-1.5">/100</span>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-5 bg-surface-soft border border-hairline flex flex-col justify-between">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Lifetime Value</p>
          <p className="text-[24px] font-mono-numbers text-ink leading-none">₹{c.total_spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="card p-5 bg-surface-soft border border-hairline flex flex-col justify-between">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Orders</p>
          <p className="text-[24px] font-mono-numbers text-ink leading-none">{c.orders.length}</p>
        </div>
        <div className="card p-5 bg-surface-soft border border-hairline flex flex-col justify-between">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Avg Order Value</p>
          <p className="text-[24px] font-mono-numbers text-ink leading-none">₹{c.orders.length > 0 ? Math.round(c.total_spent / c.orders.length).toLocaleString('en-IN') : 0}</p>
        </div>
        <div className="card p-5 bg-surface-soft border border-hairline flex flex-col justify-between">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Last Purchase</p>
          <p className="text-[24px] font-mono-numbers text-ink leading-none">{daysSince !== null ? `${daysSince}d ago` : 'Never'}</p>
        </div>
        <div className="card p-5 bg-surface-soft border border-hairline flex flex-col justify-between">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Preferred Channel</p>
          <p className="text-[24px] font-semibold text-ink leading-none">{c.preferred_channel || 'None'}</p>
        </div>
      </div>

      {/* AI Persona Engine & Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Persona Engine */}
        <div className="col-span-1 lg:col-span-1 flex flex-col gap-4">
          <h2 className="text-[18px] font-semibold text-ink mb-2">Persona Intelligence</h2>
          
          {c.customer_personas.map((cp: any) => (
            <div key={cp.persona.id} className="card p-4 border border-hairline bg-canvas">
              <div className="flex items-center gap-2 mb-3">
                <span className={clsx("text-[12px] px-2.5 py-1 rounded-md font-bold", getPersonaColor(cp.persona.name))}>
                  {cp.persona.name}
                </span>
              </div>
              <div className="p-3 bg-surface-soft rounded-lg text-[13px] text-ink leading-relaxed flex gap-3 items-start border border-hairline">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Pulse size={54} />
                </div>
                <p>
                  <span className="font-bold">AI Reasoning:</span> Customer was assigned to this persona because their behavior matches: <span className="italic">{cp.persona.description}</span>
                </p>
              </div>
            </div>
          ))}

          {c.customer_personas.length === 0 && (
             <div className="card p-6 border border-hairline bg-canvas flex items-center justify-center text-muted text-[13px]">
               No distinct personas identified yet.
             </div>
          )}
        </div>

        {/* Order History */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-[18px] font-semibold text-ink mb-2">Order History ({c.orders.length})</h2>
          
          <div className="card bg-canvas border border-hairline overflow-hidden flex-1">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-surface-soft border-b border-hairline sticky top-0">
                  <tr>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-muted uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-muted uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold text-muted uppercase tracking-wider">Discount</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold text-muted uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {c.orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-surface-soft transition-colors">
                      <td className="px-5 py-3 text-[13px] text-ink">
                        {format(new Date(o.order_date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-3 text-[13px] font-medium text-ink">
                        {o.category}
                      </td>
                      <td className="px-5 py-3 text-[13px]">
                        {o.discount_used ? (
                          <span className="px-2 py-0.5 bg-semantic-up/10 text-semantic-up rounded text-[11px] font-bold uppercase tracking-wider">Yes</span>
                        ) : (
                          <span className="text-muted text-[13px]">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[14px] font-mono-numbers font-medium text-ink text-right">
                        ₹{o.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                  {c.orders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-muted">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
