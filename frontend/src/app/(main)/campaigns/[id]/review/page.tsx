'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api';
import { Spark, CheckCircle, XmarkCircle, InfoCircle, ArrowLeft } from 'iconoir-react';
import { clsx } from 'clsx';

export default function CampaignReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [review, setReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch the campaign details and actual metrics first.
    // For this prototype, we simulate sending the expected vs actuals to the AI Review endpoint.
    const getReview = async () => {
      try {
        const result = await fetchAPI<any>('/api/ai/campaign-review', {
           method: 'POST',
           body: JSON.stringify({
             campaignId: id,
             expectedRevenue: 420000,
             expectedConversion: 6.0
           })
        });
        setReview(result);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getReview();
  }, [id]);

  if (loading) {
     return (
       <div className="flex w-full min-h-screen bg-slate-50 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-blue-600">
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
            <span className="text-slate-500 font-medium">Analyzing Campaign Performance...</span>
          </div>
       </div>
     );
  }

  if (!review) {
      return (
          <div className="flex w-full min-h-screen bg-slate-50 items-center justify-center">
             <span className="text-slate-500">Failed to load campaign review.</span>
          </div>
      );
  }

  return (
    <div className="flex w-full min-h-screen bg-slate-50 justify-center pb-20">
      <div className="w-full max-w-[900px] px-8 py-10 flex flex-col gap-8">
        
        <button onClick={() => router.push('/chat')} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors self-start text-[14px] font-semibold">
           <ArrowLeft height={16} width={16}/> Back to Studio
        </button>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
             <Spark height={14} width={14} /> AI Review Mode
          </span>
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight leading-tight">
            Campaign Performance Autopsy
          </h1>
          <p className="text-[16px] text-slate-500">
            Analyzing AI predictions against actual real-world results.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col gap-10">
           
           {/* Prediction vs Actuals */}
           <div className="flex flex-col gap-4">
              <span className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Prediction Accuracy</span>
              
              <div className="grid grid-cols-2 gap-6">
                 {/* Revenue Box */}
                 <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                       <span className="text-[14px] font-semibold text-slate-600">Revenue</span>
                       <span className={clsx(
                           "text-[12px] font-bold px-2 py-1 rounded-md", 
                           Number(review.actual_revenue) >= Number(review.predicted_revenue) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                       )}>
                         {Number(review.prediction_accuracy).toFixed(1)}% Accuracy
                       </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Predicted</span>
                          <span className="text-[24px] font-mono font-bold text-slate-400">₹{Number(review.predicted_revenue).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actual</span>
                          <span className="text-[24px] font-mono font-bold text-slate-900">₹{Number(review.actual_revenue).toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                       </div>
                    </div>
                 </div>

                 {/* Conversion Box */}
                 <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                       <span className="text-[14px] font-semibold text-slate-600">Conversion</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                       <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Predicted</span>
                          <span className="text-[24px] font-mono font-bold text-slate-400">{Number(review.predicted_conversion).toFixed(1)}%</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actual</span>
                          <span className="text-[24px] font-mono font-bold text-slate-900">{Number(review.actual_conversion).toFixed(1)}%</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="h-px bg-slate-100 w-full" />

           {/* What Worked & What Failed */}
           <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                 <span className="text-[14px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="text-emerald-500" height={18} width={18}/> What Worked
                 </span>
                 <p className="text-[15px] text-slate-700 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                    {review.what_worked}
                 </p>
              </div>
              <div className="flex flex-col gap-4">
                 <span className="text-[14px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <XmarkCircle className="text-red-500" height={18} width={18}/> What Failed
                 </span>
                 <p className="text-[15px] text-slate-700 leading-relaxed bg-red-50/50 p-4 rounded-xl border border-red-100/50">
                    {review.what_failed}
                 </p>
              </div>
           </div>

           <div className="h-px bg-slate-100 w-full" />

           {/* Learning */}
           <div className="flex flex-col gap-4 bg-blue-50 border border-blue-100 rounded-2xl p-6">
               <span className="text-[14px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                  <InfoCircle className="text-blue-600" height={18} width={18}/> Reusable Learning
               </span>
               <p className="text-[16px] font-medium text-slate-900 leading-relaxed">
                  {review.learning}
               </p>
           </div>
           
           <div className="text-[13px] text-slate-400 text-center font-medium mt-2">
              This learning has been permanently saved to the Revenue Memory database and will automatically improve future recommendations.
           </div>

        </div>
      </div>
    </div>
  );
}
