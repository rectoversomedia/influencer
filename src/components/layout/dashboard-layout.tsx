'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopBar } from './topbar';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'superadmin' | 'client' | 'influencer';
  userName: string;
  userEmail: string;
  title?: string;
}

export function DashboardLayout({ children, role, userName, userEmail, title }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={role} userName={userName} userEmail={userEmail} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={title} />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
