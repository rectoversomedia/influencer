'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'none' | 'indigo' | 'violet' | 'pink' | 'emerald' | 'amber' | 'cyan' | 'rose' | 'slate';
}

export function Card({ children, className = '', hover = false, gradient = 'none' }: CardProps) {
  const gradients = {
    none: '',
    indigo: 'from-indigo-50/50 to-violet-50/50',
    violet: 'from-violet-50/50 to-purple-50/50',
    pink: 'from-pink-50/50 to-rose-50/50',
    emerald: 'from-emerald-50/50 to-teal-50/50',
    amber: 'from-amber-50/50 to-orange-50/50',
    cyan: 'from-cyan-50/50 to-blue-50/50',
    rose: 'from-rose-50/50 to-red-50/50',
    slate: 'from-slate-50/50 to-gray-50/50',
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200/60 overflow-hidden
        ${hover ? 'hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300/80 transition-all duration-300 hover:-translate-y-1 cursor-pointer group' : ''}
        ${gradient !== 'none' ? `bg-gradient-to-br ${gradients[gradient]}` : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-5 border-b border-slate-200/60 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-bold text-slate-900 ${className}`}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-slate-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-slate-200/60 bg-slate-50/50 ${className}`}>
      {children}
    </div>
  );
}
