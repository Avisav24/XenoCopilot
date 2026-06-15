'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const IosSpinner = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ color: '#8e8e93' }}
  >
    <style>{`
      .ios-spinner line {
        stroke: currentColor;
        stroke-width: 2.5;
        stroke-linecap: round;
        animation: ios-fade 1.2s linear infinite;
      }
      @keyframes ios-fade {
        0% { opacity: 1; }
        100% { opacity: 0.15; }
      }
    `}</style>
    <g className="ios-spinner">
      <line x1="12" y1="2" x2="12" y2="6" style={{ animationDelay: '-1.1s' }} />
      <line x1="17" y1="3.34" x2="15" y2="6.8" style={{ animationDelay: '-1.0s' }} />
      <line x1="20.66" y1="7" x2="17.2" y2="9" style={{ animationDelay: '-0.9s' }} />
      <line x1="22" y1="12" x2="18" y2="12" style={{ animationDelay: '-0.8s' }} />
      <line x1="20.66" y1="17" x2="17.2" y2="15" style={{ animationDelay: '-0.7s' }} />
      <line x1="17" y1="20.66" x2="15" y2="17.2" style={{ animationDelay: '-0.6s' }} />
      <line x1="12" y1="22" x2="12" y2="18" style={{ animationDelay: '-0.5s' }} />
      <line x1="7" y1="20.66" x2="9" y2="17.2" style={{ animationDelay: '-0.4s' }} />
      <line x1="3.34" y1="17" x2="6.8" y2="15" style={{ animationDelay: '-0.3s' }} />
      <line x1="2" y1="12" x2="6" y2="12" style={{ animationDelay: '-0.2s' }} />
      <line x1="3.34" y1="7" x2="6.8" y2="9" style={{ animationDelay: '-0.1s' }} />
      <line x1="7" y1="3.34" x2="9" y2="6.8" style={{ animationDelay: '0s' }} />
    </g>
  </svg>
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
      
      {/* iOS style spinner */}
      <div className="mb-10">
        <IosSpinner />
      </div>

      <div className="text-center flex flex-col items-center gap-4">
        <h1 className="font-display text-[40px] md:text-[56px] font-semibold tracking-tight text-white leading-none">
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
