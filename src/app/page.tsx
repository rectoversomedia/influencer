'use client';

import { useRouter } from 'next/navigation';
import { User, Briefcase, Shield, ArrowRight, ChartLineUp } from './icons';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-6 shadow-lg shadow-indigo-500/30">
            <ChartLineUp className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Rectoverso</h1>
          <p className="text-slate-400">Influencer Report Platform</p>
        </div>

        {/* Portal Links */}
        <div className="space-y-4">
          {/* Influencer Portal */}
          <button
            onClick={() => router.push('/influencer')}
            className="w-full p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Influencer Portal</h3>
                  <p className="text-sm text-slate-400">Submit your reports</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Client Portal */}
          <button
            onClick={() => router.push('/client')}
            className="w-full p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Client Portal</h3>
                  <p className="text-sm text-slate-400">View & approve reports</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Superadmin */}
          <button
            onClick={() => router.push('/superadmin')}
            className="w-full p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 hover:border-violet-500/50 transition-all duration-300 group text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Superadmin</h3>
                  <p className="text-sm text-slate-400">Manage campaigns & users</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm">
          Select your portal to continue
        </p>
      </div>
    </div>
  );
}
