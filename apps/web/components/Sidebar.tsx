'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useState } from 'react';
import { Sparkle, Megaphone, Users, CaretDoubleLeft, CaretDoubleRight, Plus, ChartBar } from '@phosphor-icons/react';

const navItems = [
  {
    href: '/',
    label: 'Opportunities',
    icon: <Sparkle size={24} />,
  },
  {
    href: '/intelligence',
    label: 'Customer Intelligence',
    icon: <Users size={24} />,
  },
  {
    href: '/revenue',
    label: 'Revenue',
    icon: <Megaphone size={24} />,
  },
  {
    href: '/engagement',
    label: 'Engagement',
    icon: <ChartBar size={24} />,
  },
  {
    href: '/chat',
    label: 'Campaign Copilot',
    icon: <Sparkle size={24} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);

  const isExpanded = isPinned || isHovered;

  return (
    <>
      {/* Invisible spacer to reserve width when pinned */}
      <div 
        className={clsx(
          "flex-shrink-0 transition-all duration-300 ease-in-out hidden md:block",
          isPinned ? "w-[240px]" : "w-[72px]"
        )} 
      />

      {/* The actual sidebar */}
      <aside 
        className={clsx(
          "sidebar fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out flex flex-col justify-between",
          isExpanded ? "w-[240px]" : "w-[72px]"
        )}
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
      >
        <nav className="flex flex-col gap-2 p-4 pt-6 relative flex-1">
          {/* Top Header Row */}
          <div className={clsx("flex items-center h-[60px] mb-4 mt-2", isExpanded ? "px-4 justify-between" : "px-0 justify-center")}>
            {isExpanded ? (
              <Link href="/" className="flex items-center gap-2 group w-full px-2 py-1.5 rounded-lg hover:bg-surface-soft transition-colors flex-1 mr-2">
                <span 
                  className="text-[24px] font-normal tracking-tight whitespace-nowrap overflow-hidden text-ellipsis font-display text-ink"
                  style={{
                    background: 'linear-gradient(90deg, #533afd 0%, #f96bee 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                  }}
                >
                  XenoCopilot
                </span>
              </Link>
            ) : (
              <Link href="/" className="flex justify-center items-center h-full w-full">
                <div 
                  className="w-8 h-8 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #533afd 0%, #f96bee 100%)',
                  }}
                />
              </Link>
            )}

            <button 
              onClick={() => {
                setIsPinned(!isPinned);
                setIsHovered(false); // Reset hover state when toggling
              }}
              className={clsx(
                "text-muted hover:text-ink w-6 h-6 flex items-center justify-center rounded-md hover:bg-surface-soft transition-colors flex-shrink-0",
                !isExpanded && "absolute opacity-0 pointer-events-none" // Hide toggle button if completely collapsed
              )}
              title={isPinned ? "Close sidebar" : "Keep sidebar open"}
            >
              {isPinned ? <CaretDoubleLeft size={24} /> : <CaretDoubleRight size={24} />}
            </button>
          </div>

          <div className={clsx("mb-6 mt-2", isExpanded ? "px-2" : "flex justify-center")}>
            <Link 
              href="/chat"
              className={clsx(
                "btn-primary flex items-center justify-center transition-all shadow-sm hover:shadow-card",
                isExpanded ? "w-full gap-2 px-4 py-2" : "w-10 h-10 rounded-full px-0"
              )}
              title="New Campaign Copilot"
            >
              <Plus size={24} className="flex-shrink-0" />
              {isExpanded && <span className="whitespace-nowrap overflow-hidden">New Campaign</span>}
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 py-[10px] rounded-lg text-[14px] font-medium transition-colors duration-200 cursor-pointer mb-1',
                    isActive ? 'text-primary bg-primary/10 font-bold' : 'text-muted hover:text-ink hover:bg-surface-soft',
                    isExpanded ? 'px-3' : 'justify-center w-10 h-10 mx-auto px-0'
                  )}
                  title={!isExpanded ? item.label : undefined}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  {isExpanded && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className={clsx("mb-4 border-t border-hairline pt-4 w-full", isExpanded ? "px-4" : "px-0 flex justify-center")}>
          <div className={clsx("flex items-center gap-3", isExpanded ? "px-2 hover:bg-surface-soft py-2 rounded-lg cursor-pointer transition-colors w-full" : "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[12px] font-bold border border-primary/20 flex-shrink-0">
              A
            </div>
            {isExpanded && (
              <div className="overflow-hidden whitespace-nowrap flex-1">
                <p className="text-ink text-[14px] font-semibold leading-tight">Abhinav</p>
                <p className="text-muted text-[13px]">Drape & Co.</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
