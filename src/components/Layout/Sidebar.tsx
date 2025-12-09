import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Image as ImageIcon, Layers, FileText, Menu, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const navItems = [
    { icon: ImageIcon, label: 'Generator', href: '/editor' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: Layers, label: 'Templates', href: '#' },
    { icon: FileText, label: 'Drafts', href: '#' },
  ];

  return (
    <div className="group w-16 hover:w-64 h-full bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out z-50 fixed left-0 top-0 bottom-0 pointer-events-auto shadow-2xl overflow-hidden">
       {/* Logo / Menu Icon */}
       <div className="h-16 flex items-center px-5 shrink-0 border-b border-neutral-800">
            <Menu className="text-neutral-400 group-hover:text-white transition-colors" size={20} />
            <span className="ml-4 font-bold text-lg text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap duration-200">
                Kolektt.AI
            </span>
       </div>

      <div className="p-3 flex-1">
        <nav className="space-y-2">
          {navItems.map((item, i) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href) && item.href !== '#';
            return (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap overflow-hidden block",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                  : "text-neutral-500 hover:text-white hover:bg-neutral-800"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.label}
              </span>
            </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 mt-auto border-t border-neutral-800">
         <div className="flex items-center px-3 gap-3 text-xs text-neutral-500 whitespace-nowrap overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                System Online
            </span>
         </div>
      </div>
    </div>
  );
}
