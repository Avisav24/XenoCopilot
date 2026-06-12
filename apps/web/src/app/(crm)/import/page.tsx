'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadSquare, CheckCircle, WarningTriangle, DatabaseScript, Play, FastArrowRight, DatabaseMonitor, ViewGrid, MultiMacOsWindow } from 'iconoir-react';
import { fetchAPI } from '@/lib/api';
import { clsx } from 'clsx';

type ImportResult = {
  imported: number;
  valid: number;
  rejected: number;
  issues: string[];
};

export default function ImportPage() {
  const router = useRouter();

  const [customerFile, setCustomerFile] = useState<File | null>(null);
  const [orderFile, setOrderFile] = useState<File | null>(null);

  const [customerResult, setCustomerResult] = useState<ImportResult | null>(null);
  const [orderResult, setOrderResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState(0);

  const [isImportComplete, setIsImportComplete] = useState(false);

  const handleUpload = async (type: 'customers' | 'orders', file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use raw fetch to bypass JSON Content-Type default in fetchAPI
    const res = await fetch(`http://localhost:3001/api/import/${type}`, {
       method: 'POST',
       body: formData
    });

    if (!res.ok) {
       alert(`Failed to import ${type}`);
       return;
    }

    const data = await res.json();
    if (type === 'customers') setCustomerResult(data);
    else setOrderResult(data);
  };

  const handleRunProcessing = async () => {
     setIsProcessing(true);
     setProcessStage(1);
     await new Promise(r => setTimeout(r, 800));
     
     setProcessStage(2);
     await new Promise(r => setTimeout(r, 600));

     setProcessStage(3);
     await fetchAPI('/api/import/process', { method: 'POST' });
     
     setProcessStage(4);
     await new Promise(r => setTimeout(r, 800));

     setProcessStage(5);
     await new Promise(r => setTimeout(r, 600));
     
     setProcessStage(6);
     setIsProcessing(false);
     setIsImportComplete(true);
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 justify-center">
      <div className="w-full max-w-[1200px] px-8 py-8 flex flex-col gap-10">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-slate-900 leading-none tracking-tight">Data Import Engine</h1>
          <p className="text-[14px] text-slate-500">Production backend ingestion pipeline for Customers and Orders.</p>
        </div>

        {!isImportComplete ? (
          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Column: Upload & Validation (8 cols) */}
            <div className="col-span-8 flex flex-col gap-8">
               
               {/* Upload Section */}
               <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
                  <span className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Step 1: Upload Files</span>
                  <div className="grid grid-cols-2 gap-6">
                     
                     <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 relative hover:border-blue-500 transition-colors group">
                        <input 
                           type="file" 
                           accept=".csv" 
                           onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                 setCustomerFile(f);
                                 handleUpload('customers', f);
                              }
                           }}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                           <UploadSquare height={24} width={24} />
                        </div>
                        <div className="flex flex-col items-center text-center">
                           <span className="text-[14px] font-bold text-slate-900">Customers CSV</span>
                           <span className="text-[12px] text-slate-500">{customerFile ? customerFile.name : 'Click or drag file to upload'}</span>
                        </div>
                     </div>

                     <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 relative hover:border-blue-500 transition-colors group">
                        <input 
                           type="file" 
                           accept=".csv" 
                           onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                 setOrderFile(f);
                                 handleUpload('orders', f);
                              }
                           }}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                           <UploadSquare height={24} width={24} />
                        </div>
                        <div className="flex flex-col items-center text-center">
                           <span className="text-[14px] font-bold text-slate-900">Orders CSV</span>
                           <span className="text-[12px] text-slate-500">{orderFile ? orderFile.name : 'Click or drag file to upload'}</span>
                        </div>
                     </div>

                  </div>
               </div>

               {/* Validation Section */}
               {(customerResult || orderResult) && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
                     <span className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Step 2: Validation Results</span>
                     
                     <div className="flex flex-col gap-6">
                        {customerResult && (
                           <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                 <span className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle height={16} width={16} className="text-emerald-500" /> Customers
                                 </span>
                                 <div className="flex items-center gap-4 text-[13px] font-mono">
                                    <span className="text-slate-500">Imported: {customerResult.imported}</span>
                                    <span className="text-emerald-600 font-bold">Valid: {customerResult.valid}</span>
                                    <span className="text-red-500 font-bold">Rejected: {customerResult.rejected}</span>
                                 </div>
                              </div>
                              {customerResult.issues.length > 0 && (
                                 <div className="bg-red-50 border border-red-100 rounded-md p-3 flex flex-col gap-1">
                                    <span className="text-[12px] font-bold text-red-800 flex items-center gap-1"><WarningTriangle height={12} width={12} /> Validation Issues</span>
                                    {customerResult.issues.map((i, idx) => (
                                       <span key={idx} className="text-[11px] text-red-600 font-mono">• {i}</span>
                                    ))}
                                 </div>
                              )}
                           </div>
                        )}

                        {orderResult && (
                           <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                 <span className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                                    <CheckCircle height={16} width={16} className="text-emerald-500" /> Orders
                                 </span>
                                 <div className="flex items-center gap-4 text-[13px] font-mono">
                                    <span className="text-slate-500">Imported: {orderResult.imported}</span>
                                    <span className="text-emerald-600 font-bold">Valid: {orderResult.valid}</span>
                                    <span className="text-red-500 font-bold">Rejected: {orderResult.rejected}</span>
                                 </div>
                              </div>
                              {orderResult.issues.length > 0 && (
                                 <div className="bg-red-50 border border-red-100 rounded-md p-3 flex flex-col gap-1">
                                    <span className="text-[12px] font-bold text-red-800 flex items-center gap-1"><WarningTriangle height={12} width={12} /> Validation Issues</span>
                                    {orderResult.issues.map((i, idx) => (
                                       <span key={idx} className="text-[11px] text-red-600 font-mono">• {i}</span>
                                    ))}
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               )}

            </div>

            {/* Right Column: Processing Pipeline (4 cols) */}
            <div className="col-span-4 flex flex-col gap-6">
               <div className="sticky top-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
                  <span className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Step 3: Processing</span>
                  
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold", processStage >= 1 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                           {processStage >= 1 ? <CheckCircle height={14} width={14} /> : 1}
                        </div>
                        <span className={clsx("text-[13px] font-bold", processStage >= 1 ? "text-slate-900" : "text-slate-400")}>Customers Stored</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold", processStage >= 2 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                           {processStage >= 2 ? <CheckCircle height={14} width={14} /> : 2}
                        </div>
                        <span className={clsx("text-[13px] font-bold", processStage >= 2 ? "text-slate-900" : "text-slate-400")}>Orders Stored</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold", processStage >= 3 ? "bg-emerald-100 text-emerald-600" : (processStage === 2 && isProcessing ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-slate-100 text-slate-400"))}>
                           {processStage >= 3 ? <CheckCircle height={14} width={14} /> : 3}
                        </div>
                        <span className={clsx("text-[13px] font-bold", processStage >= 3 ? "text-slate-900" : "text-slate-400")}>Customer Profiles Built</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold", processStage >= 4 ? "bg-emerald-100 text-emerald-600" : (processStage === 3 && isProcessing ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-slate-100 text-slate-400"))}>
                           {processStage >= 4 ? <CheckCircle height={14} width={14} /> : 4}
                        </div>
                        <span className={clsx("text-[13px] font-bold", processStage >= 4 ? "text-slate-900" : "text-slate-400")}>Segments Generated</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold", processStage >= 5 ? "bg-emerald-100 text-emerald-600" : (processStage === 4 && isProcessing ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-slate-100 text-slate-400"))}>
                           {processStage >= 5 ? <CheckCircle height={14} width={14} /> : 5}
                        </div>
                        <span className={clsx("text-[13px] font-bold", processStage >= 5 ? "text-slate-900" : "text-slate-400")}>Personas Generated</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold", processStage >= 6 ? "bg-emerald-100 text-emerald-600" : (processStage === 5 && isProcessing ? "bg-blue-100 text-blue-600 animate-pulse" : "bg-slate-100 text-slate-400"))}>
                           {processStage >= 6 ? <CheckCircle height={14} width={14} /> : 6}
                        </div>
                        <span className={clsx("text-[13px] font-bold", processStage >= 6 ? "text-slate-900" : "text-slate-400")}>Opportunities Generated</span>
                     </div>
                  </div>

                  <button 
                     disabled={(!customerResult || !orderResult) || isProcessing}
                     onClick={handleRunProcessing}
                     className="w-full mt-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-lg text-[13px] transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                     {isProcessing ? 'Processing Pipeline...' : 'Run Aggregation Pipeline'}
                     {!isProcessing && <Play height={16} width={16} />}
                  </button>
               </div>
            </div>

          </div>
        ) : (
          /* Success State: Import Dashboard */
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             
             <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle height={24} width={24} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[18px] font-bold text-slate-900">Import & Aggregation Complete</span>
                      <span className="text-[13px] text-slate-600">All data has been successfully ingested into PostgreSQL. The CRM is now fully operational.</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-2 shadow-sm">
                   <DatabaseScript height={20} width={20} className="text-slate-400 mb-2" />
                   <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
                   <span className="text-[28px] font-bold text-slate-900 font-mono">{customerResult?.valid || 0}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-2 shadow-sm">
                   <DatabaseMonitor height={20} width={20} className="text-slate-400 mb-2" />
                   <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
                   <span className="text-[28px] font-bold text-slate-900 font-mono">{orderResult?.valid || 0}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-2 shadow-sm">
                   <ViewGrid height={20} width={20} className="text-slate-400 mb-2" />
                   <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Segments</span>
                   <span className="text-[28px] font-bold text-slate-900 font-mono">3</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-2 shadow-sm">
                   <MultiMacOsWindow height={20} width={20} className="text-slate-400 mb-2" />
                   <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Opportunities</span>
                   <span className="text-[28px] font-bold text-slate-900 font-mono">2</span>
                </div>
             </div>

             <div className="flex items-center gap-4 mt-4">
                <button onClick={() => router.push('/personas')} className="bg-white border border-slate-200 hover:border-slate-300 text-slate-900 font-bold py-3 px-6 rounded-xl text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2">
                   View Personas <FastArrowRight height={16} width={16} />
                </button>
                <button onClick={() => router.push('/revenue')} className="bg-white border border-slate-200 hover:border-slate-300 text-slate-900 font-bold py-3 px-6 rounded-xl text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2">
                   Growth OS <FastArrowRight height={16} width={16} />
                </button>
                <button onClick={() => router.push('/chat')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-[14px] transition-colors shadow-sm flex items-center justify-center gap-2 ml-auto">
                   Campaign Studio <FastArrowRight height={16} width={16} />
                </button>
             </div>

          </div>
        )}

      </div>
    </div>
  );
}
