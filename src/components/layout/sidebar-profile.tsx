'use client';

import { SignOut } from '@phosphor-icons/react';

interface SidebarProfileProps {
  userName: string;
  userEmail: string;
  isCollapsed: boolean;
}

export function SidebarProfile({ userName, userEmail, isCollapsed }: SidebarProfileProps) {
  return (
    <div className="border-t border-slate-200/60 p-4">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
          {userName.charAt(0).toUpperCase()}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>
        )}
      </div>

      <form action="/auth/logout" method="POST" className="mt-2">
        <button
          type="submit"
          className={`
            w-full flex items-center justify-center gap-2 px-4 py-2.5
            text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200
            ${isCollapsed ? 'px-2' : ''}
          `}
        >
          <SignOut className="h-4 w-4" weight="bold" />
          {!isCollapsed && 'Sign Out'}
        </button>
      </form>
    </div>
  );
}
