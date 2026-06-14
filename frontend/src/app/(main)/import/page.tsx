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
    const res = await fetch(`/api/import/${type}`, {
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
     await fetchAPI('/api/import/process', { method: 'POST', body: '{}' });
     
     setProcessStage(4);
     await new Promise(r => setTimeout(r, 800));

     setProcessStage(5);
     await new Promise(r => setTimeout(r, 600));
     
     setProcessStage(6);
     setIsProcessing(false);
     setIsImportComplete(true);
  };

  return (
    <div className="flex w-full min-h-screen bg-canvas justify-center">
      <div className="w-full max-w-[1200px] px-8 py-8 flex flex-col gap-10">
        
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-[700] text-ink leading-none tracking-tight">Data Import Engine</h1>
          <p className="text-[14px] text-ink-muted">Production backend ingestion pipeline for Customers and Orders.</p>
        </div>

        {!isImportComplete ? (
          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Column: Upload & Validation (8 cols) */}
            <div className="col-span-8 flex flex-col gap-8">
               
               {/* Upload Section */}
               <div className="card !p-6 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] font-[600] text-ink uppercase tracking-wider">Step 1: Upload Files</span>
                    <div className="flex gap-4">
                       <a href="/sample_customers.csv" download className="text-[12px] font-[600] text-ink-muted hover:text-ink underline underline-offset-2 decoration-hairline hover:decoration-ink transition-colors">Download Sample Customers</a>
                       <a href="/sample_orders.csv" download className="text-[12px] font-[600] text-ink-muted hover:text-ink underline underline-offset-2 decoration-hairline hover:decoration-ink transition-colors">Download Sample Orders</a>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     
                     <div className="border border-dashed border-hairline rounded-[8px] p-8 flex flex-col items-center justify-center gap-3 relative hover:border-ink transition-colors group bg-canvas">
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
                        <div className="w-12 h-12 bg-white group-hover:bg-canvas-soft border border-hairline rounded-full flex items-center justify-center text-ink-muted group-hover:text-ink transition-colors">
                           <UploadSquare height={24} width={24} />
                        </div>
                        <div className="flex flex-col items-center text-center">
                           <span className="text-[14px] font-[600] text-ink">Customers CSV</span>
                           <span className="text-[12px] text-ink-muted">{customerFile ? customerFile.name : 'Click or drag file to upload'}</span>
                        </div>
                     </div>

                     <div className="border border-dashed border-hairline rounded-[8px] p-8 flex flex-col items-center justify-center gap-3 relative hover:border-ink transition-colors group bg-canvas">
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
                        <div className="w-12 h-12 bg-white group-hover:bg-canvas-soft border border-hairline rounded-full flex items-center justify-center text-ink-muted group-hover:text-ink transition-colors">
                           <UploadSquare height={24} width={24} />
                        </div>
                        <div className="flex flex-col items-center text-center">
                           <span className="text-[14px] font-[600] text-ink">Orders CSV</span>
                           <span className="text-[12px] text-ink-muted">{orderFile ? orderFile.name : 'Click or drag file to upload'}</span>
                        </div>
                     </div>

                  </div>
               </div>

               {/* Validation Section */}
               {(customerResult || orderResult) && (
                  <div className="card !p-6 flex flex-col gap-6">
                     <span className="text-[14px] font-[600] text-ink uppercase tracking-wider">Step 2: Validation Results</span>
                     
                     <div className="flex flex-col gap-6">
                        {customerResult && (
                           <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between border-b border-hairline pb-2">
                                 <span className="text-[14px] font-[600] text-ink flex items-center gap-2">
                                    <CheckCircle height={16} width={16} className="text-green-600" /> Customers
                                 </span>
                                 <div className="flex items-center gap-4 text-[13px] font-mono-numbers">
                                    <span className="text-ink-muted">Imported: {customerResult.imported}</span>
                                    <span className="text-green-600 font-[600]">Valid: {customerResult.valid}</span>
                                    <span className="text-red-500 font-[600]">Rejected: {customerResult.rejected}</span>
                                 </div>
                              </div>
                              {customerResult.issues.length > 0 && (
                                 <div className="bg-red-50 border border-red-200 rounded-[8px] p-3 flex flex-col gap-1">
                                    <span className="text-[12px] font-[600] text-red-800 flex items-center gap-1"><WarningTriangle height={12} width={12} /> Validation Issues</span>
                                    {customerResult.issues.map((i, idx) => (
                                       <span key={idx} className="text-[11px] text-red-600 font-mono-numbers">• {i}</span>
                                    ))}
                                 </div>
                              )}
                           </div>
                        )}

                        {orderResult && (
                           <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between border-b border-hairline pb-2">
                                 <span className="text-[14px] font-[600] text-ink flex items-center gap-2">
                                    <CheckCircle height={16} width={16} className="text-green-600" /> Orders
                                 </span>
                                 <div className="flex items-center gap-4 text-[13px] font-mono-numbers">
                                    <span className="text-ink-muted">Imported: {orderResult.imported}</span>
                                    <span className="text-green-600 font-[600]">Valid: {orderResult.valid}</span>
                                    <span className="text-red-500 font-[600]">Rejected: {orderResult.rejected}</span>
                                 </div>
                              </div>
                              {orderResult.issues.length > 0 && (
                                 <div className="bg-red-50 border border-red-200 rounded-[8px] p-3 flex flex-col gap-1">
                                    <span className="text-[12px] font-[600] text-red-800 flex items-center gap-1"><WarningTriangle height={12} width={12} /> Validation Issues</span>
                                    {orderResult.issues.map((i, idx) => (
                                       <span key={idx} className="text-[11px] text-red-600 font-mono-numbers">• {i}</span>
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
               <div className="sticky top-8 card !p-6 flex flex-col gap-6">
                  <span className="text-[14px] font-[600] text-ink uppercase tracking-wider">Step 3: Processing</span>
                  
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-[600] border", processStage >= 1 ? "bg-canvas text-ink border-hairline" : "bg-white text-ink-muted/50 border-hairline")}>
                           {processStage >= 1 ? <CheckCircle height={14} width={14} /> : 1}
                        </div>
                        <span className={clsx("text-[13px] font-[600]", processStage >= 1 ? "text-ink" : "text-ink-muted/50")}>Customers Stored</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-[600] border", processStage >= 2 ? "bg-canvas text-ink border-hairline" : "bg-white text-ink-muted/50 border-hairline")}>
                           {processStage >= 2 ? <CheckCircle height={14} width={14} /> : 2}
                        </div>
                        <span className={clsx("text-[13px] font-[600]", processStage >= 2 ? "text-ink" : "text-ink-muted/50")}>Orders Stored</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-[600] border", processStage >= 3 ? "bg-canvas text-ink border-hairline" : (processStage === 2 && isProcessing ? "bg-canvas text-ink border-hairline animate-pulse" : "bg-white text-ink-muted/50 border-hairline"))}>
                           {processStage >= 3 ? <CheckCircle height={14} width={14} /> : 3}
                        </div>
                        <span className={clsx("text-[13px] font-[600]", processStage >= 3 ? "text-ink" : "text-ink-muted/50")}>Customer Profiles Built</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-[600] border", processStage >= 4 ? "bg-canvas text-ink border-hairline" : (processStage === 3 && isProcessing ? "bg-canvas text-ink border-hairline animate-pulse" : "bg-white text-ink-muted/50 border-hairline"))}>
                           {processStage >= 4 ? <CheckCircle height={14} width={14} /> : 4}
                        </div>
                        <span className={clsx("text-[13px] font-[600]", processStage >= 4 ? "text-ink" : "text-ink-muted/50")}>Segments Generated</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-[600] border", processStage >= 5 ? "bg-canvas text-ink border-hairline" : (processStage === 4 && isProcessing ? "bg-canvas text-ink border-hairline animate-pulse" : "bg-white text-ink-muted/50 border-hairline"))}>
                           {processStage >= 5 ? <CheckCircle height={14} width={14} /> : 5}
                        </div>
                        <span className={clsx("text-[13px] font-[600]", processStage >= 5 ? "text-ink" : "text-ink-muted/50")}>Personas Generated</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-[600] border", processStage >= 6 ? "bg-canvas text-ink border-hairline" : (processStage === 5 && isProcessing ? "bg-canvas text-ink border-hairline animate-pulse" : "bg-white text-ink-muted/50 border-hairline"))}>
                           {processStage >= 6 ? <CheckCircle height={14} width={14} /> : 6}
                        </div>
                        <span className={clsx("text-[13px] font-[600]", processStage >= 6 ? "text-ink" : "text-ink-muted/50")}>Opportunities Generated</span>
                     </div>
                  </div>

                  <button 
                     disabled={isProcessing}
                     onClick={handleRunProcessing}
                     className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-[8px]"
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
             
             <div className="bg-white border border-hairline rounded-[8px] p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-canvas flex items-center justify-center text-ink border border-hairline">
                      <CheckCircle height={24} width={24} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[18px] font-[700] text-ink">Import & Aggregation Complete</span>
                      <span className="text-[13px] text-ink-muted">All data has been successfully ingested into PostgreSQL. The CRM is now fully operational.</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-4 gap-6">
                <div className="card !p-6 flex flex-col gap-2">
                   <DatabaseScript height={20} width={20} className="text-ink-muted mb-2" />
                   <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Total Customers</span>
                   <span className="text-[28px] font-[600] text-ink font-mono-numbers">{customerResult?.valid || 0}</span>
                </div>
                <div className="card !p-6 flex flex-col gap-2">
                   <DatabaseMonitor height={20} width={20} className="text-ink-muted mb-2" />
                   <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Total Orders</span>
                   <span className="text-[28px] font-[600] text-ink font-mono-numbers">{orderResult?.valid || 0}</span>
                </div>
                <div className="card !p-6 flex flex-col gap-2">
                   <ViewGrid height={20} width={20} className="text-ink-muted mb-2" />
                   <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Segments</span>
                   <span className="text-[28px] font-[600] text-ink font-mono-numbers">3</span>
                </div>
                <div className="card !p-6 flex flex-col gap-2">
                   <MultiMacOsWindow height={20} width={20} className="text-ink-muted mb-2" />
                   <span className="text-[12px] font-[600] text-ink-muted uppercase tracking-wider">Opportunities</span>
                   <span className="text-[28px] font-[600] text-ink font-mono-numbers">2</span>
                </div>
             </div>

             <div className="flex items-center gap-4 mt-4">
                <button onClick={() => router.push('/customers')} className="btn-secondary py-3 px-6 rounded-[8px] flex items-center justify-center gap-2">
                   Customer 360 <FastArrowRight height={16} width={16} />
                </button>
                <button onClick={() => router.push('/revenue')} className="btn-secondary py-3 px-6 rounded-[8px] flex items-center justify-center gap-2">
                   Growth OS <FastArrowRight height={16} width={16} />
                </button>
                <button onClick={() => router.push('/chat')} className="btn-primary py-3 px-6 rounded-[8px] flex items-center justify-center gap-2 ml-auto">
                   Campaign Studio <FastArrowRight height={16} width={16} />
                </button>
             </div>

          </div>
        )}

      </div>
    </div>
  );
}
