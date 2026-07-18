'use client';

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: 'indigo' | 'violet' | 'pink' | 'emerald' | 'amber' | 'cyan' | 'rose';
}

export function StatCard({ title, value, icon, trend, gradient = 'indigo' }: StatCardProps) {
  const gradients = {
    indigo: 'from-indigo-500 to-indigo-600',
    violet: 'from-violet-500 to-violet-600',
    pink: 'from-pink-500 to-pink-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    cyan: 'from-cyan-500 to-cyan-600',
    rose: 'from-rose-500 to-rose-600',
  };

  const iconsBg = {
    indigo: 'bg-indigo-100 text-indigo-600',
    violet: 'bg-violet-100 text-violet-600',
    pink: 'bg-pink-100 text-pink-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    rose: 'bg-rose-100 text-rose-600',
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:-translate-y-1">
      {/* Gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[gradient]}`} />

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
            {trend && (
              <div className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                <span className={trend.isPositive ? 'animate-bounce' : ''}>
                  {trend.isPositive ? '↑' : '↓'}
                </span>
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-slate-400 font-normal">vs last month</span>
              </div>
            )}
          </div>

          <div className={`p-3.5 rounded-xl ${iconsBg[gradient]} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradients[gradient]} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}
