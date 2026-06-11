'use client';

import Link from 'next/link';
import ShapeGrid from '@/components/ShapeGrid';

export default function LandingPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A]">
      <div className="absolute inset-0 z-0 opacity-60">
        <ShapeGrid 
          speed={0.5} 
          squareSize={50}
          direction='diagonal'
          borderColor='rgba(255, 255, 255, 0.05)'
          hoverFillColor='rgba(249, 107, 238, 0.2)'
          shape='hexagon'
          hoverTrailAmount={8}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center">
          <div 
            className="w-20 h-20 mb-8 rounded-full shadow-2xl animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #533afd 0%, #f96bee 100%)',
              boxShadow: '0 0 40px rgba(249, 107, 238, 0.4)'
            }}
          />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Welcome to{' '}
            <span 
              style={{
                background: 'linear-gradient(90deg, #533afd 0%, #f96bee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              XenoCopilot
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl font-light leading-relaxed">
            Your AI-Native Customer Intelligence Command Center. Generate deep insights, draft personalized campaigns, and maximize your revenue automatically.
          </p>
          
          <Link 
            href="/opportunities"
            className="btn-primary text-lg px-10 py-4 rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 font-medium flex items-center gap-3"
          >
            Access Portal
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
