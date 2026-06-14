'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Spark, Group, Megaphone, Settings, DatabaseScript, UserStar } from 'iconoir-react';

const navGroups = [
  {
    label: 'Audience',
    items: [
      { href: '/opportunities', label: 'Revenue Opportunities', icon: <Group height={18} width={18} /> },
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

  return (
    <>
      <div className="flex-shrink-0 w-[240px] hidden md:block" />
      <aside className="sidebar fixed top-0 left-0 h-full z-40 flex flex-col justify-between bg-canvas border-r border-hairline w-[240px]">
        
        <nav className="flex flex-col gap-1 p-4 pt-6 flex-1">
          <div className="flex items-center px-3 mb-8 mt-2">
            <Link href="/" className="flex items-center gap-2 w-full">
              <span className="text-[20px] font-bold text-ink tracking-tight">
                XenoCopilot
              </span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-6">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-3 mb-2">{group.label}</span>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-colors duration-150',
                        isActive 
                          ? 'text-primary bg-primary-soft' 
                          : 'text-ink-muted hover:bg-canvas-soft hover:text-ink'
                      )}
                    >
                      <div className={clsx("flex-shrink-0", isActive ? "text-primary" : "text-ink-muted")}>
                        {item.icon}
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
              D
            </div>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <p className="text-ink text-[14px] font-bold leading-tight">Workspace</p>
              <p className="text-ink-muted text-[12px] font-medium">Drape & Co.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
