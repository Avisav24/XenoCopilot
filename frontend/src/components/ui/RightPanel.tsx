'use client';

import React from 'react';
import { Spark } from 'iconoir-react';
import { clsx } from 'clsx';

interface RightPanelProps {
  title?: string;
  children: React.ReactNode;
}

export function RightPanel({ title = "AI Intelligence", children }: RightPanelProps) {
  return (
    <div className="w-[340px] flex-shrink-0 h-full border-l border-hairline bg-canvas flex flex-col hidden lg:flex">
      <div className="h-[60px] border-b border-hairline flex items-center px-6 shrink-0 bg-canvas-soft">
        <h2 className="text-[14px] font-semibold text-ink flex items-center gap-2">
          <Spark className="text-primary" height={16} width={16} />
          {title}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

export function PanelSection({ title, children, noBorder = false }: { title: string, children: React.ReactNode, noBorder?: boolean }) {
  return (
    <div className={clsx("flex flex-col gap-2", !noBorder && "border-b border-hairline pb-5")}>
      <h3 className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider">{title}</h3>
      <div className="text-[13px] text-ink leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function PanelMetric({ label, value, trend }: { label: string, value: string | React.ReactNode, trend?: 'positive' | 'negative' | 'neutral' }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[13px] text-ink-muted">{label}</span>
      <span className={clsx(
        "text-[13px] font-semibold",
        trend === 'positive' && "text-success",
        trend === 'negative' && "text-danger",
        (!trend || trend === 'neutral') && "text-ink"
      )}>
        {value}
      </span>
    </div>
  );
}
