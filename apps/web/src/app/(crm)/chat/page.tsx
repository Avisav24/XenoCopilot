'use client';

import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDynamicSuggestions, getDynamicPersonas, simulateCampaign } from '@/lib/api';
import { Spark, Check, Send, Xmark, ChatBubble, Phone, Mail, SmartphoneDevice, MessageText, Calendar, Play, EditPencil, Clock, CheckCircle } from 'iconoir-react';
import { clsx } from 'clsx';

export default function CampaignCopilotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: personas } = useQuery({
    queryKey: ['dynamic-personas'],
    queryFn: getDynamicPersonas,
  });

  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(searchParams?.get('persona') || '');
  const [goal, setGoal] = useState(searchParams?.get('goal') || '');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [simData, setSimData] = useState<any[] | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('whatsapp');
  
  // App State
  const [activeVariantTab, setActiveVariantTab] = useState<string>('variant_a');
  const [variantStatuses, setVariantStatuses] = useState<Record<string, string>>({});

  const handleStartWorkflow = async () => {
    if (!selectedPersonaId) {
      alert('Please select a target audience.');
      return;
    }

    setIsProcessing(true);
    setSimData(null);
    setVariantStatuses({});
    
    try {
      const selectedP = personas?.find((p: any) => p.id === selectedPersonaId);
      const audienceCount = selectedP ? selectedP.customerCount : 300;

      // Simulate channel analysis
      setTimeout(() => {
         setSimData([
            { channel: 'whatsapp', revenue: audienceCount * 450, cost: audienceCount * 2, roi: '412%', conversion: '6.4%' },
            { channel: 'email', revenue: audienceCount * 280, cost: audienceCount * 0.5, roi: '285%', conversion: '2.1%' },
            { channel: 'sms', revenue: audienceCount * 120, cost: audienceCount * 1.5, roi: '140%', conversion: '1.8%' }
         ]);
         setIsProcessing(false);
      }, 1500);

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  const variants = {
     variant_a: {
        id: 'variant_a',
        name: 'Variant A',
        strategy: 'Direct Revenue Recovery',
        subject: '[Favorite Category] restock just for you',
        preview: 'Grab your favorites before they sell out again.',
        body: 'Hi [Customer Name], we noticed you haven\'t shopped with us in [Days Since Last Order] days. Your favorite products from [Favorite Category] are back in stock. Use code VIP20 at checkout.',
        revenue: '₹1.72L',
        conversion: '4.8%',
        confidence: '92%'
     },
     variant_b: {
        id: 'variant_b',
        name: 'Variant B',
        strategy: 'Personalized Recommendation',
        subject: 'Hand-picked for [Customer Name]',
        preview: 'New arrivals based on your purchase history.',
        body: 'Hey [Customer Name], based on your last purchase of [Last Purchase], we thought you\'d love our new collection. Shop now and get free shipping as a top tier customer.',
        revenue: '₹1.45L',
        conversion: '3.9%',
        confidence: '84%'
     },
     variant_c: {
        id: 'variant_c',
        name: 'Variant C',
        strategy: 'Relationship Building',
        subject: 'Thank you for your loyalty',
        preview: 'A special gift inside.',
        body: 'Hi [Customer Name], you are one of our most valued customers. To say thank you, here is a special gift added to your account. Claim it on your next purchase of [Favorite Category].',
        revenue: '₹1.10L',
        conversion: '2.5%',
        confidence: '78%'
     }
  };

  const handleApproveVariant = (vid: string) => {
    setVariantStatuses({ ...variantStatuses, [vid]: 'approved' });
  };

  const hasApprovedVariant = Object.values(variantStatuses).includes('approved');

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto pb-32">
      
      {/* 1. Opportunity & Audience Definition */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-[18px] font-bold text-slate-900">1. Define Campaign Audience</h2>
        <div className="flex gap-4">
           <select 
              value={selectedPersonaId} 
              onChange={e => setSelectedPersonaId(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-[14px] text-slate-900 font-medium focus:outline-none focus:border-blue-500"
           >
              <option value="">Select Target Audience...</option>
              <option value="all-customers">All Customers</option>
              {personas?.map((p: any) => (
                 <option key={p.id} value={p.id}>{p.name} ({p.customerCount.toLocaleString()} customers)</option>
              ))}
           </select>
           <button 
              onClick={() => handleStartWorkflow()}
              disabled={isProcessing || !selectedPersonaId}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-sm whitespace-nowrap"
           >
              {isProcessing ? 'Analyzing Audience...' : 'Generate Strategy'}
           </button>
        </div>
      </div>

      {simData && (
         <>
            {/* 2. Executive Summary */}
            <div className="bg-white border-2 border-emerald-500 rounded-xl p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
               <div className="flex justify-between items-start">
                  <h2 className="text-[18px] font-bold text-slate-900">Campaign Brief</h2>
                  <span className="text-[12px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md uppercase tracking-wider">Ready for Execution</span>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col gap-1 border-r border-slate-100 pr-4">
                     <span className="text-[12px] font-semibold text-slate-500 uppercase">Recommended Channel</span>
                     <span className="text-[16px] font-bold text-slate-900">WhatsApp</span>
                  </div>
                  <div className="flex flex-col gap-1 border-r border-slate-100 pr-4">
                     <span className="text-[12px] font-semibold text-slate-500 uppercase">Projected Revenue</span>
                     <span className="text-[16px] font-bold text-emerald-600 font-mono-numbers">₹1.72L</span>
                  </div>
                  <div className="flex flex-col gap-1 border-r border-slate-100 pr-4">
                     <span className="text-[12px] font-semibold text-slate-500 uppercase">Estimated Conversion</span>
                     <span className="text-[16px] font-bold text-slate-900 font-mono-numbers">4.8%</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[12px] font-semibold text-slate-500 uppercase">Launch Risk</span>
                     <span className="text-[16px] font-bold text-slate-900">Low Fatigue Risk</span>
                  </div>
               </div>

               <div className="flex flex-col gap-1 border-t border-slate-100 pt-4 mt-2">
                  <span className="text-[12px] font-bold text-slate-900 uppercase">Reason</span>
                  <p className="text-[14px] text-slate-600 leading-relaxed">This audience exhibits a 4.8% conversion rate when engaged via WhatsApp during this specific lifecycle window. Direct revenue recovery strategies have historically outperformed generic outreach by 2.1x for this segment.</p>
               </div>
            </div>

            {/* 3. Campaign Variants */}
            <div className="flex flex-col gap-4">
               <h2 className="text-[18px] font-bold text-slate-900">Campaign Variants</h2>
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {Object.values(variants).map((variant: any) => {
                     const isApproved = variantStatuses[variant.id] === 'approved';
                     const isWinner = variant.id === 'variant_a'; // Mock Variant A as winner
                     
                     return (
                        <div key={variant.id} className={clsx(
                           "border-2 rounded-xl bg-white shadow-sm flex flex-col overflow-hidden transition-all relative",
                           isApproved ? "border-blue-600 ring-2 ring-blue-600/20" : isWinner ? "border-emerald-500" : "border-slate-200"
                        )}>
                           <div className={clsx("py-3 px-5 border-b flex flex-col gap-1", isWinner ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-200")}>
                              <div className="flex justify-between items-center">
                                 <span className={clsx("text-[14px] font-bold", isWinner ? "text-emerald-800" : "text-slate-800")}>{variant.name}</span>
                                 {isWinner && <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1"><CheckCircle height={12} width={12} /> Winning Variant</span>}
                              </div>
                              <span className="text-[12px] font-semibold text-slate-500">{variant.strategy}</span>
                           </div>

                           <div className="p-5 flex flex-col gap-5 flex-1">
                              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Expected Rev</span>
                                    <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">{variant.revenue}</span>
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Confidence</span>
                                    <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">{variant.confidence}</span>
                                 </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Subject</span>
                                    <span className="text-[13px] font-medium text-slate-800">{variant.subject}</span>
                                 </div>
                                 <div className="flex flex-col gap-1">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Preview</span>
                                    <span className="text-[13px] font-medium text-slate-600">{variant.preview}</span>
                                 </div>
                                 <div className="flex flex-col gap-1 mt-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Message Body</span>
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[13px] text-slate-800 leading-relaxed font-medium">
                                       {variant.body}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 mt-auto">
                              <button className="px-3 py-1.5 text-[12px] font-bold text-slate-600 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5">
                                 <EditPencil height={14} width={14} /> Edit
                              </button>
                              <button 
                                 onClick={() => handleApproveVariant(variant.id)}
                                 disabled={isApproved}
                                 className={clsx(
                                    "px-4 py-1.5 text-[12px] font-bold rounded transition-colors flex items-center gap-1.5",
                                    isApproved ? "bg-blue-100 text-blue-700" : "bg-slate-900 hover:bg-slate-800 text-white"
                                 )}
                              >
                                 {isApproved ? <><Check height={14} width={14} /> Approved</> : "Approve"}
                              </button>
                           </div>
                        </div>
                     )
                  })}

               </div>
            </div>

            {/* Launch Action Bar (Sticky) */}
            {hasApprovedVariant && (
               <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/90 backdrop-blur-md p-4 z-40 transform transition-transform shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                  <div className="max-w-[1400px] mx-auto flex items-center justify-between pl-[240px]">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                           <Play height={20} width={20} className="ml-0.5" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[15px] font-bold text-slate-900">Campaign Ready</span>
                           <span className="text-[13px] text-slate-500">1 variant approved for execution</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <button className="px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-[14px] font-bold text-slate-700 transition-colors flex items-center gap-2">
                           <Clock height={18} width={18} /> Schedule
                        </button>
                        <button 
                           onClick={() => {
                              router.push('/engagement/mock-campaign-id');
                           }}
                           className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[14px] font-bold transition-colors flex items-center gap-2 shadow-sm"
                        >
                           Launch Campaign <Send height={18} width={18} />
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </>
      )}

    </div>
  );
}
