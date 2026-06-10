'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { planCampaign, createCampaign, sendCampaign } from '@/lib/api';
import type { CampaignPlan, Customer, MessageVariant } from '@xenocopilot/shared-types';

// ── Count-up animation hook ───────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ── Channel Icon ──────────────────────────────────────────
function ChannelIcon({ channel }: { channel: string }) {
  const icons: Record<string, string> = { email: '📧', whatsapp: '💬', sms: '📱' };
  return <span>{icons[channel] || '📨'}</span>;
}

// ── Segment Rule Chip ─────────────────────────────────────
function RuleChip({ field, operator, value }: { field: string; operator: string; value: unknown }) {
  const fieldLabels: Record<string, string> = {
    last_order_days_ago: 'last purchase',
    total_spend: 'total spend',
    total_orders: 'orders',
    favorite_category: 'category',
    preferred_channel: 'channel',
    discount_affinity: 'discount lover',
  };
  const opLabels: Record<string, string> = {
    gt: '>', lt: '<', gte: '≥', lte: '≤', eq: '=', in: 'in',
  };

  const displayValue = () => {
    if (field === 'last_order_days_ago') return `${value} days ago`;
    if (field === 'total_spend') return `₹${Number(value).toLocaleString('en-IN')}`;
    if (Array.isArray(value)) return (value as string[]).join(', ');
    if (typeof value === 'boolean') return value ? 'yes' : 'no';
    return String(value);
  };

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium border border-teal-200">
      {fieldLabels[field] || field} {opLabels[operator] || operator} {displayValue()}
    </span>
  );
}

// ── Customer Preview Card ─────────────────────────────────
function CustomerCard({ customer }: { customer: Customer }) {
  const initials = customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const daysSince = customer.last_order_at
    ? Math.floor((Date.now() - new Date(customer.last_order_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{customer.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {customer.favorite_category && (
            <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
              {customer.favorite_category}
            </span>
          )}
          {customer.preferred_channel && (
            <span className="text-xs text-slate-500 flex items-center gap-0.5">
              <ChannelIcon channel={customer.preferred_channel} />
              {customer.preferred_channel}
            </span>
          )}
        </div>
      </div>
      {daysSince !== null && (
        <span className="text-xs text-slate-400 flex-shrink-0">{daysSince}d ago</span>
      )}
    </div>
  );
}

// ── Message Variant Card ──────────────────────────────────
function VariantCard({
  variant,
  index,
  onChange,
}: {
  variant: MessageVariant;
  index: number;
  onChange: (body: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Highlight template variables
  const highlightedBody = variant.body.replace(
    /\{\{(\w+)\}\}/g,
    '<mark class="bg-teal-100 text-teal-700 px-0.5 rounded font-medium not-italic">{{$1}}</mark>'
  );

  return (
    <div className="card p-5 border-l-4 border-l-teal-500">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Variant {index + 1}
          </span>
          <h4 className="font-semibold text-slate-800 text-sm mt-0.5">{variant.persona_tag}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
            <ChannelIcon channel={variant.channel} />
            {variant.channel}
          </span>
          <button
            onClick={() => { setEditing(!editing); setTimeout(() => textRef.current?.focus(), 50); }}
            className="text-xs text-teal-600 hover:text-teal-500 font-medium"
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {variant.subject && (
        <div className="mb-2">
          <span className="text-xs text-slate-500 font-medium">Subject: </span>
          <span className="text-sm text-slate-700">{variant.subject}</span>
        </div>
      )}

      {editing ? (
        <textarea
          ref={textRef}
          value={variant.body}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="input-field text-sm resize-none"
        />
      ) : (
        <div
          className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3"
          dangerouslySetInnerHTML={{ __html: highlightedBody }}
        />
      )}
    </div>
  );
}

// ── Step Indicator ────────────────────────────────────────
function StepIndicator({ step, current }: { step: number; current: number }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
          done
            ? 'bg-teal-500 text-white'
            : active
            ? 'bg-teal-600 text-white ring-4 ring-teal-200'
            : 'bg-slate-200 text-slate-400'
        }`}
      >
        {done ? '✓' : step}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [planResult, setPlanResult] = useState<{
    plan: CampaignPlan;
    audience_count: number;
    audience_preview: Customer[];
  } | null>(null);
  const [variants, setVariants] = useState<MessageVariant[]>([]);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const audienceCount = useCountUp(planResult?.audience_count || 0);

  const planMutation = useMutation({
    mutationFn: () => planCampaign(goal) as Promise<{
      plan: CampaignPlan;
      audience_count: number;
      audience_preview: Customer[];
    }>,
    onSuccess: (data) => {
      setPlanResult(data);
      setVariants(data.plan.message_variants);
      setCampaignName(`Campaign — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`);
      setStep(2);
    },
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      createCampaign({
        name: campaignName,
        goal,
        ai_plan: { ...planResult!.plan, message_variants: variants },
        segment_rules: planResult!.plan.segment_rules,
      }) as Promise<{ id: string }>,
    onSuccess: (data) => {
      setCampaignId(data.id);
      setStep(3);
    },
  });

  const launchMutation = useMutation({
    mutationFn: () => sendCampaign(campaignId!),
    onSuccess: () => {
      router.push(`/campaigns/${campaignId}/live`);
    },
  });

  const steps = [
    { n: 1, label: 'Goal' },
    { n: 2, label: 'AI Plan' },
    { n: 3, label: 'Launch' },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">New Campaign</h1>
        <p className="text-slate-500 mt-1">Let AI generate a campaign plan from your goal</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center">
              <StepIndicator step={s.n} current={step} />
              <span className={`text-xs mt-1.5 font-medium ${step === s.n ? 'text-teal-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-20 mx-3 mb-4 transition-all duration-500 ${step > s.n ? 'bg-teal-500' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Goal Input ─────────────────────────────── */}
      {step === 1 && (
        <div className="animate-fade-in space-y-6">
          <div className="card p-8">
            <label className="block text-slate-700 font-semibold mb-3 text-lg">
              What's your campaign goal?
            </label>
            <textarea
              id="campaign-goal-input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Win back high-value dress buyers who spent over ₹3000 but haven't purchased in the last 45 days"
              rows={5}
              className="input-field text-base resize-none"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                'Win back lapsed dress buyers who spent over ₹3000',
                'Re-engage WhatsApp customers who clicked but didn\'t buy',
                'Reward top 10% spenders with an exclusive offer',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setGoal(example)}
                  className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {planMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {(planMutation.error as Error)?.message || 'Failed to generate plan. Check your API key.'}
            </div>
          )}

          <button
            id="generate-plan-btn"
            onClick={() => planMutation.mutate()}
            disabled={goal.trim().length < 10 || planMutation.isPending}
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
          >
            {planMutation.isPending ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating AI Plan…
              </>
            ) : (
              <>✨ Generate Campaign Plan →</>
            )}
          </button>
        </div>
      )}

      {/* ── STEP 2: AI Plan Review ─────────────────────────── */}
      {step === 2 && planResult && (
        <div className="animate-fade-in space-y-6">
          {/* AI Rationale */}
          <div className="teal-callout">
            <div className="flex items-start gap-3">
              <span className="text-xl">✨</span>
              <div>
                <p className="font-semibold text-teal-800 text-sm mb-1">AI Rationale</p>
                <p className="text-teal-700 text-sm">{planResult.plan.rationale}</p>
              </div>
            </div>
          </div>

          {/* Segment Rules */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-700 text-sm mb-3">Segment Rules</h3>
            <div className="flex flex-wrap gap-2">
              {planResult.plan.segment_rules.map((rule, i) => (
                <RuleChip key={i} field={rule.field} operator={rule.operator} value={rule.value} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">{planResult.plan.estimated_audience_description}</p>
          </div>

          {/* Audience Count */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 text-sm">Audience Preview</h3>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-800">{audienceCount}</span>
                <span className="text-slate-500 text-sm ml-1">customers matched</span>
              </div>
            </div>
            <div className="space-y-2">
              {planResult.audience_preview.map((c) => (
                <CustomerCard key={c.id} customer={c} />
              ))}
            </div>
          </div>

          {/* Message Variants */}
          <div>
            <h3 className="font-semibold text-slate-700 text-sm mb-3">Message Variants</h3>
            <div className="space-y-4">
              {variants.map((v, i) => (
                <VariantCard
                  key={i}
                  variant={v}
                  index={i}
                  onChange={(body) => {
                    const updated = [...variants];
                    updated[i] = { ...updated[i], body };
                    setVariants(updated);
                  }}
                />
              ))}
            </div>
          </div>

          {saveMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {(saveMutation.error as Error)?.message || 'Failed to save campaign.'}
            </div>
          )}

          <button
            id="save-campaign-btn"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
          >
            {saveMutation.isPending ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </>
            ) : (
              'Save & Continue →'
            )}
          </button>
        </div>
      )}

      {/* ── STEP 3: Launch ────────────────────────────────── */}
      {step === 3 && planResult && (
        <div className="animate-fade-in space-y-6">
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Ready to Launch</h3>
                <p className="text-slate-500 text-sm">Review and launch your campaign</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Campaign Name</label>
                <input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="input-field mt-1.5"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-teal-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-teal-700">{planResult.audience_count}</p>
                  <p className="text-xs text-teal-600 font-medium mt-1">Recipients</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-700">{variants.length}</p>
                  <p className="text-xs text-slate-600 font-medium mt-1">Variants</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-700">
                    {[...new Set(variants.map((v) => v.channel))].length}
                  </p>
                  <p className="text-xs text-slate-600 font-medium mt-1">Channels</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Channels</p>
                <div className="flex gap-2">
                  {[...new Set(variants.map((v) => v.channel))].map((ch) => (
                    <span key={ch} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm">
                      <ChannelIcon channel={ch} /> {ch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {launchMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {(launchMutation.error as Error)?.message || 'Failed to launch campaign.'}
            </div>
          )}

          <button
            id="launch-campaign-btn"
            onClick={() => launchMutation.mutate()}
            disabled={launchMutation.isPending}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
          >
            {launchMutation.isPending ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Launching…
              </>
            ) : (
              '🚀 Launch Campaign'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
