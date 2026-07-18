'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartLineUp,
  Megaphone,
  Users,
  UserGear,
  ChartBar,
  Gear,
  FileText,
  SignOut,
  List,
  X,
  CaretRight,
  House,
} from '../../app/icons';
import { SidebarProfile } from './sidebar-profile';

interface SidebarProps {
  role: 'superadmin' | 'client' | 'influencer';
  userName: string;
  userEmail: string;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const superadminLinks = [
    {
      title: 'Dashboard',
      href: '/superadmin',
      icon: House,
    },
    {
      title: 'Campaigns',
      href: '/superadmin/campaigns',
      icon: Megaphone,
    },
    {
      title: 'Clients',
      href: '/superadmin/clients',
      icon: Users,
    },
    {
      title: 'Influencers',
      href: '/superadmin/influencers',
      icon: UserGear,
    },
    {
      title: 'Analytics',
      href: '/superadmin/analytics',
      icon: ChartBar,
    },
    {
      title: 'Settings',
      href: '/superadmin/settings',
      icon: Gear,
    },
  ];

  const clientLinks = [
    {
      title: 'Dashboard',
      href: '/client',
      icon: House,
    },
    {
      title: 'Campaigns',
      href: '/client/campaigns',
      icon: Megaphone,
    },
    {
      title: 'Reports',
      href: '/client/reports',
      icon: FileText,
    },
    {
      title: 'Analytics',
      href: '/client/analytics',
      icon: ChartBar,
    },
    {
      title: 'Export',
      href: '/client/export',
      icon: Gear,
    },
  ];

  const influencerLinks = [
    {
      title: 'Dashboard',
      href: '/influencer',
      icon: House,
    },
    {
      title: 'My Campaigns',
      href: '/influencer/campaigns',
      icon: Megaphone,
    },
    {
      title: 'My Reports',
      href: '/influencer/reports',
      icon: FileText,
    },
  ];

  const links = role === 'superadmin' ? superadminLinks : role === 'client' ? clientLinks : influencerLinks;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200"
      >
        <List className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[50] animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-[60]
          flex flex-col bg-white border-r border-slate-200/60
          transition-all duration-300 ease-out
          ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200/60">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ChartLineUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Rectoverso
                </h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider capitalize">
                  {role} Portal
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CaretRight className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${!isCollapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link, index) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}
                />
                {!isCollapsed && (
                  <span className="font-medium">{link.title}</span>
                )}
                {!isCollapsed && isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <SidebarProfile
          userName={userName}
          userEmail={userEmail}
          isCollapsed={isCollapsed}
        />
      </aside>
    </>
  );
}
