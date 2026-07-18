'use client';

import { MagnifyingGlass, Bell, X } from '../../app/icons';
import Link from 'next/link';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Spacer for mobile menu button */}
        <div className="w-12 lg:hidden" />

        {title && (
          <div>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer group">
          <MagnifyingGlass className="h-4 w-4 text-slate-400 group-hover:text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-56"
          />
          <kbd className="hidden lg:inline-flex items-center px-2 py-0.5 text-xs font-medium text-slate-400 bg-white rounded-md shadow-sm">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors group">
          <Bell className="h-5 w-5 text-slate-500 group-hover:text-slate-700" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        </button>
      </div>
    </header>
  );
}
