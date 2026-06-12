'use client';

import { useQuery } from '@tanstack/react-query';
import { getOpportunities } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowRight, Spark, ArrowUp, Search, Filter } from 'iconoir-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [revenueFilter, setRevenueFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('revenue_desc');
  
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: getOpportunities,
  });

  // Auto-select first opportunity when loaded
  useEffect(() => {
    if (opportunities && opportunities.length > 0 && !selectedId) {
      setSelectedId(opportunities[0].id);
    }
  }, [opportunities, selectedId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] text-ink-muted">
        Loading revenue opportunities...
      </div>
    );
  }

  const totalRecovery = opportunities?.reduce((acc: number, opp: any) => acc + (opp.potentialRevenue || 0), 0) || 0;
  const highConfidence = opportunities?.filter((o: any) => o.confidence > 80).length || 0;
  const totalAudience = opportunities?.reduce((acc: number, opp: any) => acc + (opp.audience || 0), 0) || 0;

  // Apply filters and sorting
  let filteredOpportunities = opportunities || [];

  if (searchQuery) {
    filteredOpportunities = filteredOpportunities.filter((opp: any) => 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (confidenceFilter !== 'all') {
    const minConfidence = parseInt(confidenceFilter, 10);
    filteredOpportunities = filteredOpportunities.filter((opp: any) => opp.confidence >= minConfidence);
  }

  if (revenueFilter !== 'all') {
    const minRevenue = parseInt(revenueFilter, 10);
    filteredOpportunities = filteredOpportunities.filter((opp: any) => opp.potentialRevenue >= minRevenue);
  }

  filteredOpportunities = [...filteredOpportunities].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'revenue_desc': return b.potentialRevenue - a.potentialRevenue;
      case 'revenue_asc': return a.potentialRevenue - b.potentialRevenue;
      case 'confidence_desc': return b.confidence - a.confidence;
      case 'audience_desc': return b.audience - a.audience;
      default: return 0;
    }
  });

  const selectedOpp = filteredOpportunities.find((o: any) => o.id === selectedId) || filteredOpportunities[0];

  return (
    <div className="flex flex-col gap-8 w-full pb-24">
      
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1>Revenue Opportunities</h1>
          <p className="max-w-2xl text-[15px] text-ink-muted">
            AI-generated opportunities discovered from customer behavior and revenue patterns.
          </p>
        </div>
      </div>

      {/* KPI Row (Redesigned for Enterprise) */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card flex flex-col gap-0.5 p-4 shadow-sm border-hairline">
          <span className="text-[28px] leading-tight font-bold text-ink font-mono-numbers tracking-tight">₹{totalRecovery.toLocaleString()}</span>
          <span className="text-[13px] font-medium text-ink-muted">Recoverable Revenue</span>
          <span className="text-[12px] font-semibold text-semantic-success flex items-center gap-1 mt-2">
             <ArrowUp height={12} width={12} strokeWidth={3} /> +18% potential impact
          </span>
        </div>
        <div className="card flex flex-col gap-0.5 p-4 shadow-sm border-hairline">
          <span className="text-[28px] leading-tight font-bold text-ink font-mono-numbers tracking-tight">{opportunities?.length || 0}</span>
          <span className="text-[13px] font-medium text-ink-muted">Active Opportunities</span>
          <span className="text-[12px] font-medium text-ink-muted flex items-center gap-1 mt-2">
             Updated 2 hours ago
          </span>
        </div>
        <div className="card flex flex-col gap-0.5 p-4 shadow-sm border-hairline">
          <span className="text-[28px] leading-tight font-bold text-ink font-mono-numbers tracking-tight">{highConfidence}</span>
          <span className="text-[13px] font-medium text-ink-muted">High Confidence (&gt;80%)</span>
          <span className="text-[12px] font-medium text-ink-muted flex items-center gap-1 mt-2">
             Ready for launch
          </span>
        </div>
        <div className="card flex flex-col gap-0.5 p-4 shadow-sm border-hairline">
          <span className="text-[28px] leading-tight font-bold text-ink font-mono-numbers tracking-tight">{totalAudience.toLocaleString()}</span>
          <span className="text-[13px] font-medium text-ink-muted">Target Audience Size</span>
          <span className="text-[12px] font-semibold text-semantic-success flex items-center gap-1 mt-2">
             <ArrowUp height={12} width={12} strokeWidth={3} /> +4% vs last month
          </span>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        
        {/* Left Column: Toolbar & Table (75% Width) */}
        <div className="flex-[3] flex flex-col gap-4">
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative flex-1 min-w-[200px]">
               <Search height={16} width={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
               <input 
                 type="text" 
                 placeholder="Search opportunities..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-white border border-hairline rounded-md pl-9 py-2 text-[13px] text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
               />
             </div>
             
             <select 
               value={confidenceFilter}
               onChange={(e) => setConfidenceFilter(e.target.value)}
               className="bg-white border border-hairline text-ink-muted hover:text-ink hover:bg-canvas-soft font-medium px-3 py-2 text-[13px] rounded-md shadow-sm transition-colors focus:outline-none focus:border-primary appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:10px_10px]"
             >
               <option value="all">Any Confidence</option>
               <option value="90">90%+ Confidence</option>
               <option value="80">80%+ Confidence</option>
               <option value="70">70%+ Confidence</option>
             </select>

             <select 
               value={revenueFilter}
               onChange={(e) => setRevenueFilter(e.target.value)}
               className="bg-white border border-hairline text-ink-muted hover:text-ink hover:bg-canvas-soft font-medium px-3 py-2 text-[13px] rounded-md shadow-sm transition-colors focus:outline-none focus:border-primary appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:10px_10px]"
             >
               <option value="all">Any Revenue</option>
               <option value="20000">₹20k+ Revenue</option>
               <option value="10000">₹10k+ Revenue</option>
               <option value="5000">₹5k+ Revenue</option>
             </select>

             <select 
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
               className="bg-white border border-hairline text-ink-muted hover:text-ink hover:bg-canvas-soft font-medium px-3 py-2 text-[13px] rounded-md shadow-sm transition-colors focus:outline-none focus:border-primary appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:10px_10px]"
             >
               <option value="revenue_desc">Sort: Highest ROI</option>
               <option value="revenue_asc">Sort: Lowest ROI</option>
               <option value="confidence_desc">Sort: Confidence</option>
               <option value="audience_desc">Sort: Audience Size</option>
             </select>
          </div>

          <div className="table-container shadow-sm border border-hairline rounded-lg overflow-hidden bg-white">
            <table className="table-enterprise w-full text-left">
              <thead className="bg-canvas-soft border-b border-hairline">
                <tr>
                  <th className="py-3 px-4 text-[11px] font-bold text-ink-muted uppercase tracking-wider">Opportunity</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-ink-muted uppercase tracking-wider">Audience</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-ink-muted uppercase tracking-wider">Revenue</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-ink-muted uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredOpportunities.length > 0 ? filteredOpportunities.map((opp: any) => (
                  <tr 
                    key={opp.id} 
                    className={clsx(
                      "cursor-pointer transition-colors hover:bg-canvas-soft",
                      selectedId === opp.id ? "bg-primary/5" : ""
                    )}
                    onClick={() => setSelectedId(opp.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[14px] text-ink">{opp.title}</div>
                    </td>
                    <td className="py-3 px-4 text-[14px] font-mono-numbers text-ink">{opp.audience.toLocaleString()}</td>
                    <td className="py-3 px-4 text-[14px] font-mono-numbers text-semantic-success font-semibold">₹{opp.potentialRevenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className={clsx(
                          "text-[13px] font-mono-numbers font-semibold w-8",
                          opp.confidence > 80 ? "text-semantic-success" : "text-semantic-warning"
                        )}>
                          {opp.confidence}%
                        </span>
                        <div className="w-16 h-1.5 bg-hairline rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={clsx("h-full", opp.confidence > 80 ? "bg-semantic-success" : "bg-semantic-warning")} 
                            style={{ width: `${opp.confidence}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-ink-muted text-[13px]">
                      No opportunities match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Inspector Panel (25% Width) */}
        {selectedOpp && (
          <div className="flex-1 flex flex-col sticky top-8 bg-white border border-hairline rounded-lg overflow-hidden shadow-sm min-w-[300px]">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-hairline bg-canvas-soft">
              <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Opportunity Details</span>
              <h3 className="text-ink font-bold text-[18px] leading-tight mt-1">{selectedOpp.title}</h3>
            </div>
            
            <div className="p-5 flex flex-col gap-6">
               {/* Metrics Grid */}
               <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                 <div className="flex flex-col gap-1">
                   <span className="text-[12px] text-ink-muted font-semibold uppercase tracking-wider">Revenue Impact</span>
                   <span className="text-[18px] font-bold text-semantic-success font-mono-numbers tracking-tight">₹{selectedOpp.potentialRevenue.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-[12px] text-ink-muted font-semibold uppercase tracking-wider">Audience Size</span>
                   <span className="text-[16px] font-semibold text-ink font-mono-numbers">{selectedOpp.audience.toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col gap-1 col-span-2">
                   <span className="text-[12px] text-ink-muted font-semibold uppercase tracking-wider">Confidence</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[16px] font-semibold text-ink font-mono-numbers">{selectedOpp.confidence}%</span>
                      <div className="w-full h-1.5 bg-hairline rounded-full overflow-hidden flex-1 max-w-[120px]">
                        <div 
                          className={clsx("h-full", selectedOpp.confidence > 80 ? "bg-semantic-success" : "bg-semantic-warning")} 
                          style={{ width: `${selectedOpp.confidence}%` }} 
                        />
                      </div>
                   </div>
                 </div>
               </div>

               {/* Recommended Campaign */}
               <div className="flex flex-col gap-2">
                 <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider">Recommended Campaign</span>
                 <div className="text-[14px] font-semibold text-ink bg-canvas-soft border border-hairline px-3 py-2.5 rounded-md shadow-sm">
                   {selectedOpp.recommendedAction || 'VIP Early Access Activation'}
                 </div>
                 <button className="btn-primary w-full text-[14px] py-2.5 font-semibold mt-1" onClick={() => router.push('/engagement')}>
                   Draft Strategy <ArrowRight height={16} width={16} />
                 </button>
               </div>

               {/* Executive Insight */}
               <div className="flex flex-col gap-3 pt-4 border-t border-hairline">
                 <span className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1">
                    <Spark height={14} width={14} className="text-primary" /> Executive Insight
                 </span>
                 <div className="text-[13px] text-ink leading-relaxed font-medium">
                   <ul className="flex flex-col gap-1.5 list-disc pl-4 text-ink-muted">
                      <li><span className="text-ink">VIP engagement declined 14% over the last 30 days.</span></li>
                      <li><span className="text-ink">Historical reactivation rate drops after 60 days of inactivity.</span></li>
                   </ul>
                 </div>
                 
                 {selectedOpp.revenueAtRisk && (
                   <div className="bg-semantic-danger/5 border border-semantic-danger/20 p-2.5 rounded flex justify-between items-center mt-1">
                     <span className="text-[12px] text-semantic-danger font-semibold">Revenue at Risk</span>
                     <span className="text-[14px] font-bold text-semantic-danger font-mono-numbers tracking-tight">₹{selectedOpp.revenueAtRisk.toLocaleString()}</span>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
