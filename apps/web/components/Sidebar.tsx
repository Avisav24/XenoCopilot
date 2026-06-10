'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useState } from 'react';
import { Sparks, Megaphone, Group, SidebarCollapse, SidebarExpand, Plus } from 'iconoir-react';

const navItems = [
  {
    href: '/chat',
    label: 'Campaign Copilot',
    icon: <Sparks className="w-[20px] h-[20px]" />,
  },
  {
    href: '/campaigns',
    label: 'Campaigns',
    icon: <Megaphone className="w-[20px] h-[20px]" />,
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: <Group className="w-[20px] h-[20px]" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  return (
    <>
      {/* 
        Spacer:
        If pinned, the aside itself takes up space because it's relative.
        If unpinned, the aside is absolute (overlays). So we need a 68px spacer so content isn't hidden under the collapsed icons.
      */}
      {!isPinned && <div className="w-[68px] flex-shrink-0" />}

      <aside 
        className={clsx(
          "bg-surface-dark text-on-dark h-screen flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out border-r border-white/5",
          isPinned ? "relative w-[260px]" : "absolute z-50 left-0 top-0",
          !isPinned && isExpanded ? "w-[260px] shadow-2xl" : "",
          !isPinned && !isExpanded ? "w-[68px]" : ""
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Header Row */}
        <div className={clsx("flex items-center h-[60px] mb-4 mt-2", isExpanded ? "px-4 justify-between" : "px-0 justify-center")}>
          {isExpanded ? (
            <Link href="/" className="flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors flex-1 mr-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-[15px] leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                XenoCopilot
              </span>
            </Link>
          ) : (
            <Link href="/" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </Link>
          )}

          <button 
            onClick={() => {
              setIsPinned(!isPinned);
              setIsHovered(false); // Reset hover state when toggling
            }}
            className={clsx(
              "text-on-darkSoft hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all flex-shrink-0",
              !isExpanded && "absolute opacity-0 pointer-events-none" // Hide toggle button if completely collapsed (no text)
            )}
            title={isPinned ? "Close sidebar" : "Keep sidebar open"}
          >
            {isPinned ? <SidebarCollapse className="w-5 h-5" /> : <SidebarExpand className="w-5 h-5" />}
          </button>
        </div>

        {/* New Chat Button / Primary Action */}
        <div className={clsx("mb-6", isExpanded ? "px-4" : "px-2 flex justify-center")}>
          <Link 
            href="/chat"
            className={clsx(
              "flex items-center gap-2 bg-primary text-white hover:bg-primary-active transition-colors",
              isExpanded ? "w-full px-3 py-2.5 rounded-lg text-[14px] font-semibold" : "w-10 h-10 rounded-xl justify-center"
            )}
            title="New Campaign Copilot"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="whitespace-nowrap overflow-hidden">New Campaign</span>}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1 w-full px-3 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 py-[10px] rounded-lg text-[14px] font-medium transition-colors duration-200 cursor-pointer',
                  isActive ? 'text-on-dark bg-white/10' : 'text-on-darkSoft hover:text-on-dark hover:bg-white/5',
                  isExpanded ? 'px-3' : 'justify-center w-10 h-10 mx-auto px-0'
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <div className={clsx("flex-shrink-0", isActive ? "text-on-dark" : "text-on-darkSoft")}>
                  {item.icon}
                </div>
                {isExpanded && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={clsx("mb-4 border-t border-white/10 pt-4 w-full", isExpanded ? "px-4" : "px-0 flex justify-center")}>
          <div className={clsx("flex items-center gap-3", isExpanded ? "px-2 hover:bg-white/5 py-2 rounded-lg cursor-pointer transition-colors w-full" : "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-surface-darkElevated flex items-center justify-center text-on-darkSoft text-[12px] font-bold border border-white/10 flex-shrink-0">
              A
            </div>
            {isExpanded && (
              <div className="overflow-hidden whitespace-nowrap flex-1">
                <p className="text-on-dark text-[14px] font-medium leading-tight">Abhinav</p>
                <p className="text-on-darkSoft text-[13px]">Drape & Co.</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
