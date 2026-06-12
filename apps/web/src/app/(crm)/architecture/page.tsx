'use client';

import { Server, Database, CloudSync, Cpu, DataTransferBoth, FastArrowRight, Settings, CodeBrackets } from 'iconoir-react';
import { clsx } from 'clsx';

export default function ArchitecturePage() {
  return (
    <div className="flex flex-col gap-8 w-full pb-24 max-w-[1000px] mx-auto mt-8">
      
      <div className="flex flex-col gap-2 text-center items-center mb-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
          <Server height={32} width={32} />
        </div>
        <h1 className="text-[32px] font-bold text-slate-900 leading-none">System Architecture</h1>
        <p className="max-w-2xl text-[16px] text-slate-500">
          A technical breakdown of the XenoCopilot infrastructure, explaining the current assignment scope and the proposed production-scale event streaming model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
         {/* Current Scale (Assignment) */}
         <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col gap-2">
               <div className="flex items-center gap-2">
                  <CodeBrackets height={20} width={20} className="text-blue-600" />
                  <h2 className="text-[18px] font-bold text-slate-900">Current Scale (Assignment)</h2>
               </div>
               <p className="text-[14px] text-slate-600">Built to demonstrate the end-to-end product vision and UI/UX capability without requiring extensive cloud infrastructure.</p>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
               <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customers</span>
                     <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">10,428</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Orders</span>
                     <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">48,921</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Campaigns</span>
                     <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">~15 Active</span>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-bold text-slate-900 uppercase">Core Stack</span>
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-white font-bold text-[10px]">NEXT</div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-slate-900">Next.js App Router</span>
                           <span className="text-[12px] text-slate-500">React Server Components & Client Forms</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white"><Database height={16} width={16} /></div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-slate-900">Supabase (PostgreSQL)</span>
                           <span className="text-[12px] text-slate-500">Relational data and JSONB storage</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white"><Settings height={16} width={16} /></div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-slate-900">Simulated Webhooks</span>
                           <span className="text-[12px] text-slate-500">In-memory delays emulating WhatsApp/Email</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-auto bg-blue-50 border border-blue-100 p-4 rounded-lg">
                  <p className="text-[13px] text-blue-800 font-medium leading-relaxed">
                     <span className="font-bold">Execution Note:</span> For the scope of this assignment, the channel service uses a local Node.js simulator to generate probabilistic webhook events (Sent → Delivered → Opened → Clicked → Purchased) and posts them back to the CRM.
                  </p>
               </div>
            </div>
         </div>

         {/* Future Scale (Production) */}
         <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col gap-2 pt-7">
               <div className="flex items-center gap-2">
                  <CloudSync height={20} width={20} className="text-purple-600" />
                  <h2 className="text-[18px] font-bold text-slate-900">Future Scale (Production)</h2>
               </div>
               <p className="text-[14px] text-slate-600">The architecture required to support millions of profiles and high-throughput real-time campaign execution.</p>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
               <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customers</span>
                     <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">10M+</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Events/Sec</span>
                     <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">50,000+</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Campaigns</span>
                     <span className="text-[18px] font-bold text-slate-900 font-mono-numbers">10,000+</span>
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-bold text-slate-900 uppercase">Distributed Stack</span>
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white"><DataTransferBoth height={16} width={16} /></div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-slate-900">Apache Kafka</span>
                           <span className="text-[12px] text-slate-500">High-throughput event streaming & ingestion</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-8 h-8 rounded bg-red-500 flex items-center justify-center text-white"><Cpu height={16} width={16} /></div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-slate-900">Redis</span>
                           <span className="text-[12px] text-slate-500">In-memory caching and rate limiting</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white font-bold text-[10px]">CH</div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-slate-900">ClickHouse</span>
                           <span className="text-[12px] text-slate-500">OLAP database for real-time campaign analytics</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-auto bg-purple-50 border border-purple-100 p-4 rounded-lg">
                  <p className="text-[13px] text-purple-900 font-medium leading-relaxed">
                     <span className="font-bold">Production Pipeline:</span> Marketing payload is pushed to a Kafka topic. Worker nodes consume the queue, map variables, and dispatch to Twilio/SendGrid. Webhook callbacks are ingested via an API Gateway, queued back into Kafka, and processed into ClickHouse for sub-second dashboard queries.
                  </p>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}
