'use client';

import { useRouter } from 'next/navigation';
import { User, Briefcase, Shield } from './icons';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Rectoverso</h1>
          <p className="text-slate-500">Influencer Report Platform</p>
        </div>

        {/* Portal Cards */}
        <div className="space-y-4">
          {/* Influencer Portal */}
          <button
            onClick={() => router.push('/influencer')}
            className="w-full p-6 bg-white rounded-2xl border border-slate-200 hover:border-pink-300 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-pink-500 flex items-center justify-center">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Influencer Portal</h3>
                <p className="text-sm text-slate-500">Submit your reports</p>
              </div>
            </div>
          </button>

          {/* Client Portal */}
          <button
            onClick={() => router.push('/auth/login?role=client')}
            className="w-full p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Client Portal</h3>
                <p className="text-sm text-slate-500">View & approve reports</p>
              </div>
            </div>
          </button>

          {/* Superadmin */}
          <button
            onClick={() => router.push('/auth/login?role=superadmin')}
            className="w-full p-6 bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-violet-500 flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Superadmin</h3>
                <p className="text-sm text-slate-500">Manage campaigns & users</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
