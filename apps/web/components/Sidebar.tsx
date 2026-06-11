'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Spark, Group, Megaphone, StatsReport, User, Settings, Database } from 'iconoir-react';

const navItems = [
  {
    href: '/opportunities',
    label: 'Revenue Opportunities',
    icon: <Spark height={18} width={18} />,
  },
  {
    href: '/chat',
    label: 'Campaign Copilot',
    icon: <Spark height={18} width={18} />,
  },
  {
    href: '/intelligence',
    label: 'Customer Intelligence',
    icon: <Group height={18} width={18} />,
  },
  {
    href: '/personas',
    label: 'Personas',
    icon: <User height={18} width={18} />,
  },
  {
    href: '/engagement',
    label: 'Campaigns',
    icon: <Megaphone height={18} width={18} />,
  },
  {
    href: '/revenue',
    label: 'Revenue Intelligence',
    icon: <StatsReport height={18} width={18} />,
  },
  {
    href: '/channels',
    label: 'Channels',
    icon: <Database height={18} width={18} />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings height={18} width={18} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <div className="flex-shrink-0 w-[260px] hidden md:block" />
      <aside className="sidebar fixed top-0 left-0 h-full z-40 flex flex-col justify-between bg-canvas border-r border-hairline w-[260px]">
        
        <nav className="flex flex-col gap-1 p-4 pt-6 flex-1">
          <div className="flex items-center px-3 mb-8 mt-2">
            <Link href="/" className="flex items-center gap-0 w-full">
              <span className="text-[28px] font-semibold text-primary tracking-tight">
                XenoCopilot
              </span>
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
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors duration-150 mb-1',
                    isActive ? 'text-primary bg-[#EFF6FF]' : 'text-muted hover:bg-surface-strong hover:text-ink'
                  )}
                >
                  <div className={clsx("flex-shrink-0", isActive ? "text-primary" : "opacity-70")}>
                    {item.icon}
                  </div>
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Workspace Switcher / User Profile */}
        <div className="p-4 border-t border-hairline w-full">
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-surface-strong rounded-lg cursor-pointer transition-colors w-full">
            <div className="w-6 h-6 rounded-md bg-surface-strong flex items-center justify-center text-ink text-[10px] font-bold border border-hairline flex-shrink-0">
              D
            </div>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <p className="text-ink text-[13px] font-semibold leading-tight">Drape & Co.</p>
              <p className="text-muted text-[11px] font-medium">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
