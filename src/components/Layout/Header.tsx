import React from 'react';
import { User, Bell, Search, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 shrink-0 z-10 pl-20">
      {/* Search / Context */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-neutral-400 transition-colors" size={16} />
            <input 
                type="text" 
                placeholder="Search projects..." 
                className="w-full bg-neutral-800 text-sm text-white pl-10 pr-4 py-2 rounded-lg border border-neutral-700/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-neutral-600 transition-all"
            />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors relative">
            <Bell size={18} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-neutral-900" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-neutral-800 cursor-pointer">
            HK
        </div>
      </div>
    </header>
  );
}
