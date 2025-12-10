'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Image as ImageIcon, FileText, Calendar, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: ImageIcon, label: 'Generator', href: '/editor' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: FileText, label: 'Drafts', href: '/drafts' },
    { icon: CreditCard, label: 'Pricing', href: '/pricing' },
  ];

  return (
    <div className="group/sidebar w-16 hover:w-64 h-full bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50 fixed left-0 top-0 bottom-0 pointer-events-auto shadow-2xl overflow-hidden">
      {/* Spacer for header alignment */}
      <div className="h-16 shrink-0 border-b border-neutral-800" />

      <div className="flex-1 flex flex-col items-center group-hover/sidebar:items-stretch px-3 py-3">
        <nav className="space-y-2 w-full flex flex-col items-center group-hover/sidebar:items-stretch">
          {navItems.map((item, i) => {
            const isActive = item.href !== '#' && pathname.startsWith(item.href);
            return (
              <Link
                key={i}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium transition-all whitespace-nowrap overflow-hidden",
                  "group-hover/sidebar:justify-start group-hover/sidebar:w-full group-hover/sidebar:px-4 group-hover/sidebar:py-3",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                    : "text-neutral-500 hover:text-white hover:bg-neutral-800"
                )}
              >
                <item.icon size={20} className="shrink-0" />
                <span className="w-0 overflow-hidden group-hover/sidebar:w-auto group-hover/sidebar:ml-4 transition-all duration-300">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-3 mt-auto border-t border-neutral-800 flex justify-center group-hover/sidebar:justify-start">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl group-hover/sidebar:w-full group-hover/sidebar:px-4 group-hover/sidebar:py-3 text-xs text-neutral-500 whitespace-nowrap overflow-hidden transition-all">
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="w-0 overflow-hidden group-hover/sidebar:w-auto group-hover/sidebar:ml-4 transition-all duration-300">
            System Online
          </span>
        </div>
      </div>
    </div>
  );
}
