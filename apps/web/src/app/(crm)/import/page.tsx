'use client';

import { useState } from 'react';
import { UploadSquare, CheckCircle, WarningCircle, Settings, DataTransferBoth, FastArrowRight, Db } from 'iconoir-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

type ImportStep = 'upload' | 'validate' | 'generate' | 'complete';

export default function DataImportPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  
  const [customersUploaded, setCustomersUploaded] = useState(false);
  const [ordersUploaded, setOrdersUploaded] = useState(false);

  const [validationProgress, setValidationProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);

  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    segments: 0,
    personas: 0,
    opportunities: 0
  });

  const handleCustomersUpload = () => {
    // Simulate file selection
    setTimeout(() => setCustomersUploaded(true), 500);
  };

  const handleOrdersUpload = () => {
    // Simulate file selection
    setTimeout(() => setOrdersUploaded(true), 500);
  };

  const startValidation = () => {
    setCurrentStep('validate');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setValidationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setStats(prev => ({ ...prev, customers: 10428, orders: 48921 }));
        setTimeout(() => startGeneration(), 1000);
      }
    }, 400);
  };

  const startGeneration = () => {
    setCurrentStep('generate');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setGenerationProgress(progress);
      if (progress === 30) setStats(prev => ({ ...prev, segments: 14 }));
      if (progress === 60) setStats(prev => ({ ...prev, personas: 5 }));
      if (progress === 90) setStats(prev => ({ ...prev, opportunities: 12 }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setCurrentStep('complete'), 500);
      }
    }, 400);
  };

  return (
    <div className="flex flex-col gap-8 w-full pb-24 max-w-[900px] mx-auto">
      
      <div className="flex flex-col gap-2 text-center items-center mt-8">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
          <Db height={32} width={32} />
        </div>
        <h1 className="text-[32px] font-bold text-slate-900 leading-none">Data Import Engine</h1>
        <p className="max-w-xl text-[16px] text-slate-500">
          Upload raw customer and transaction data. The Xeno engine will automatically clean, validate, and generate revenue opportunities.
        </p>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-4">
          <div className={clsx("flex flex-col items-center gap-2", currentStep === 'upload' ? "opacity-100" : "opacity-40")}>
            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px]", currentStep === 'upload' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500")}>1</div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-600">Upload</span>
          </div>
          <div className="w-16 h-px bg-slate-200"></div>
          <div className={clsx("flex flex-col items-center gap-2", currentStep === 'validate' ? "opacity-100" : "opacity-40")}>
            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px]", currentStep === 'validate' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500")}>2</div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-600">Validate</span>
          </div>
          <div className="w-16 h-px bg-slate-200"></div>
          <div className={clsx("flex flex-col items-center gap-2", currentStep === 'generate' ? "opacity-100" : "opacity-40")}>
            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px]", currentStep === 'generate' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500")}>3</div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-600">Generate</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-8">
        
        {currentStep === 'upload' && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Customers Upload */}
              <div 
                onClick={handleCustomersUpload}
                className={clsx(
                  "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors text-center",
                  customersUploaded ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                )}
              >
                {customersUploaded ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle height={24} width={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">customers.csv</span>
                      <span className="text-[13px] text-slate-500">4.2 MB uploaded</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <UploadSquare height={24} width={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">Upload Customers</span>
                      <span className="text-[13px] text-slate-500">CSV format required</span>
                    </div>
                  </>
                )}
              </div>

              {/* Orders Upload */}
              <div 
                onClick={handleOrdersUpload}
                className={clsx(
                  "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors text-center",
                  ordersUploaded ? "border-emerald-500 bg-emerald-50" : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                )}
              >
                {ordersUploaded ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle height={24} width={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">orders.csv</span>
                      <span className="text-[13px] text-slate-500">18.6 MB uploaded</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <UploadSquare height={24} width={24} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">Upload Orders</span>
                      <span className="text-[13px] text-slate-500">CSV format required</span>
                    </div>
                  </>
                )}
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                disabled={!customersUploaded || !ordersUploaded}
                onClick={startValidation}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                Process Data <FastArrowRight height={18} width={18} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 'validate' && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <DataTransferBoth height={48} width={48} className="text-blue-600 animate-pulse" />
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-[20px] font-bold text-slate-900">Validating Data Integrity</h3>
              <p className="text-[15px] text-slate-500 text-center max-w-md">Scanning CSV files for missing fields, matching order IDs to customer records, and normalizing data types.</p>
            </div>
            <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${validationProgress}%` }}
              />
            </div>
            <span className="text-[13px] font-bold text-slate-500 font-mono-numbers">{validationProgress}% Complete</span>
          </div>
        )}

        {currentStep === 'generate' && (
          <div className="flex flex-col items-center justify-center gap-6 py-12">
            <Settings height={48} width={48} className="text-purple-600 animate-spin-slow" />
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-[20px] font-bold text-slate-900">Generating Growth Engine</h3>
              <p className="text-[15px] text-slate-500 text-center max-w-md">Running clustering algorithms to generate Personas, mapping behavioral Segments, and identifying Revenue Opportunities.</p>
            </div>
            <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-purple-600 transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            
            {/* Live generation feed */}
            <div className="w-full max-w-md border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col gap-3 font-mono text-[13px] text-slate-600 mt-4">
               {stats.customers > 0 && <div className="flex justify-between items-center text-emerald-700"><span>✓ Parsed Customers</span><span className="font-bold">{stats.customers.toLocaleString()}</span></div>}
               {stats.orders > 0 && <div className="flex justify-between items-center text-emerald-700"><span>✓ Parsed Orders</span><span className="font-bold">{stats.orders.toLocaleString()}</span></div>}
               {stats.segments > 0 && <div className="flex justify-between items-center text-purple-700"><span>⚡ Generated Segments</span><span className="font-bold">{stats.segments}</span></div>}
               {stats.personas > 0 && <div className="flex justify-between items-center text-purple-700"><span>⚡ Generated Personas</span><span className="font-bold">{stats.personas}</span></div>}
               {stats.opportunities > 0 && <div className="flex justify-between items-center text-blue-700"><span>🎯 Identified Opportunities</span><span className="font-bold">{stats.opportunities}</span></div>}
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="flex flex-col items-center justify-center gap-6 py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle height={40} width={40} />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-[24px] font-bold text-slate-900">Import Complete</h3>
              <p className="text-[15px] text-slate-500 max-w-md">Your Growth Engine is fully populated and ready for execution.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-4">
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1">
                <span className="text-[24px] font-bold text-slate-900 font-mono-numbers">{stats.customers.toLocaleString()}</span>
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Customers</span>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1">
                <span className="text-[24px] font-bold text-slate-900 font-mono-numbers">{stats.segments}</span>
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Segments</span>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1">
                <span className="text-[24px] font-bold text-slate-900 font-mono-numbers">{stats.personas}</span>
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Personas</span>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-1">
                <span className="text-[24px] font-bold text-blue-600 font-mono-numbers">{stats.opportunities}</span>
                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Opportunities</span>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button onClick={() => router.push('/intelligence')} className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-6 py-3 rounded-lg transition-colors">
                View Intelligence
              </button>
              <button onClick={() => router.push('/revenue')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
                Open Growth OS <FastArrowRight height={18} width={18} />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
