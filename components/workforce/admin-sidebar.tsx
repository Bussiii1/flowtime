'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckSquare, 
  FileSpreadsheet, 
  Info, 
  Settings,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/logo';

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

/**
 * Array of menu items for the admin sidebar.
 */
const menuItems: MenuItem[] = [
  { label: 'Tableau de bord', icon: LayoutDashboard, href: '/admin' },
  { label: 'Employés', icon: Users, href: '/admin/employees' },
  { label: 'Plannings', icon: Calendar, href: '/admin/planning' },
  { label: 'Validation heures', icon: CheckSquare, href: '/admin/validation', badge: 3 },
  { label: 'Export paie', icon: FileSpreadsheet, href: '/admin/payroll' },
  { label: 'Informations', icon: Info, href: '/admin/infos' },
  { label: 'Paramètres', icon: Settings, href: '/admin/settings' },
];

/**
 * Sidebar component for the administrator interface.
 */
export const AdminSidebar = React.memo(() => {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
      <div className="flex h-20 items-center border-b px-6">
        <Logo className="h-10 w-10" textClassName="text-xl" />
      </div>
      
      <nav className="flex flex-col gap-1 p-4 mt-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"
                )} />
                {item.label}
              </div>
              
              {item.badge && item.badge > 0 && (
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                  isActive ? "bg-white text-primary" : "bg-primary text-white"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-6 border-t bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-black">
            FT
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">The Flow Bar</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Saison 2025</span>
          </div>
        </div>
      </div>
    </aside>
  );
});

AdminSidebar.displayName = 'AdminSidebar';
