'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AiSpinner = () => (
  <div className="relative flex items-center justify-center w-12 h-12">
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin relative z-10"
      style={{ animationDuration: '1.5s' }}
    >
      <defs>
        <linearGradient id="ai-spin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8b8e0" />
          <stop offset="50%" stopColor="#e8b8c4" />
          <stop offset="100%" stopColor="#a8c8e8" />
        </linearGradient>
      </defs>
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="url(#ai-spin-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="90 150"
        fill="none"
      />
    </svg>
  </div>
);

export default function MarketingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/opportunities');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-sans antialiased">
      
      {/* AI style spinner */}
      <div className="mb-10">
        <AiSpinner />
      </div>

      <div className="text-center flex flex-col items-center gap-4">
        <h1 className="font-sans text-[40px] md:text-[56px] font-bold tracking-tight text-white leading-none">
          XenoCopilot
        </h1>
        <p className="text-[17px] md:text-[19px] text-[#8e8e93] font-medium tracking-wide">
          AI-Native CRM for Shopper Engagement
        </p>
      </div>

      <div className="absolute bottom-16">
        <p className="text-[13px] text-[#8e8e93] tracking-widest uppercase font-semibold">
          Loading Workspace...
        </p>
      </div>
      
    </div>
  );
}
