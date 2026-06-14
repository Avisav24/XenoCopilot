'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Spark, Group, Megaphone, Settings, DatabaseScript, UserStar } from 'iconoir-react';

const navGroups = [
  {
    label: 'Audience',
    items: [
      { href: '/opportunities', label: 'Growth Opportunities', icon: <Group height={18} width={18} /> },
      { href: '/customers', label: 'Customer 360', icon: <UserStar height={18} width={18} /> },
    ]
  },
  {
    label: 'Campaigns',
    items: [
      { href: '/chat', label: 'Campaign Studio', icon: <Spark height={18} width={18} /> },
      { href: '/campaigns', label: 'All Campaigns', icon: <Megaphone height={18} width={18} /> },
    ]
  },
  {
    label: 'Settings',
    items: [
      { href: '/import', label: 'Data Import', icon: <DatabaseScript height={18} width={18} /> },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // For the mobile bottom nav, we'll flatten the main items
  const mobileNavItems = [
    { href: '/opportunities', label: 'Growth', icon: <Group height={20} width={20} /> },
    { href: '/customers', label: 'Customers', icon: <UserStar height={20} width={20} /> },
    { href: '/chat', label: 'Studio', icon: <Spark height={20} width={20} /> },
    { href: '/campaigns', label: 'Campaigns', icon: <Megaphone height={20} width={20} /> },
  ];

  return (
    <>
      <div className="flex-shrink-0 w-[240px] hidden md:block" />
      
      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar fixed top-0 left-0 h-full z-40 hidden md:flex flex-col justify-between bg-canvas border-r border-hairline w-[240px]">
        <nav className="flex flex-col gap-1 p-4 pt-6 flex-1">
          <div className="flex items-center px-3 mb-8 mt-2">
            <Link href="/" className="flex items-center gap-2 w-full">
              <span className="text-[20px] font-bold text-ink tracking-tight font-sans">
                XenoCopilot
              </span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-6">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-3 mb-1 mt-2">{group.label}</span>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className={clsx(
                        'flex items-center gap-2 px-3 py-1.5 border-l-2 text-[13px] font-medium transition-colors duration-150',
                        isActive 
                          ? 'border-ink text-ink bg-canvas-soft' 
                          : 'border-transparent text-ink-muted hover:bg-canvas-soft hover:text-ink'
                      )}
                    >
                      <div className={clsx("flex-shrink-0", isActive ? "text-ink" : "text-ink-muted")}>
                        {React.cloneElement(item.icon as React.ReactElement, { width: 16, height: 16 })}
                      </div>
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <div className="p-4 w-full flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-canvas-soft rounded-md cursor-pointer transition-colors w-full">
            <div className="w-8 h-8 rounded-md bg-canvas-soft flex items-center justify-center text-ink text-[12px] font-bold border border-hairline flex-shrink-0">
              S
            </div>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <p className="text-ink text-[14px] font-bold leading-tight">Workspace</p>
              <p className="text-ink-muted text-[12px] font-medium">StyleCo.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-canvas border-b border-hairline z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-sans font-bold text-[18px] text-ink tracking-tight">XenoCopilot</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-canvas-soft flex items-center justify-center text-ink text-[12px] font-bold border border-hairline">
          S
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-canvas border-t border-hairline z-50 flex items-center justify-around pb-safe">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full gap-1",
                isActive ? "text-ink" : "text-ink-muted hover:text-ink"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
