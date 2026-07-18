import Link from 'next/link';
import { FileText } from '@/app/icons';
import { createClient } from '@/lib/supabase/server';

async function getDashboardData() {
  const supabase = await createClient();

  const [campaignsResult, reportsResult, profilesResult] = await Promise.all([
    supabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('reports').select('*, campaign:campaigns(name), influencer:profiles(full_name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('role'),
  ]);

  const campaigns = campaignsResult.data || [];
  const reports = reportsResult.data || [];
  const profiles = profilesResult.data || [];

  return {
    campaigns,
    reports,
    stats: {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c: any) => c.status === 'active').length,
      totalReports: reports.length,
      pendingReports: reports.filter((r: any) => r.status === 'submitted' || r.status === 'under_review').length,
      totalUsers: profiles.length,
      totalInfluencers: profiles.filter((p: any) => p.role === 'influencer').length,
    },
    totalImpressions: reports.reduce((sum: number, r: any) => sum + (r.total_impressions || 0), 0),
    totalReach: reports.reduce((sum: number, r: any) => sum + (r.total_reach || 0), 0),
  };
}

export default async function SuperadminDashboard() {
  const { campaigns, reports, stats, totalImpressions, totalReach } = await getDashboardData();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Superadmin Dashboard</h1>
            <p className="text-slate-500">Overview</p>
          </div>
          <Link href="/superadmin/campaigns/new" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
            + New Campaign
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-indigo-600">{stats.totalCampaigns}</p>
            <p className="text-sm text-slate-500">Total Campaigns</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-emerald-600">{stats.activeCampaigns}</p>
            <p className="text-sm text-slate-500">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-amber-600">{stats.pendingReports}</p>
            <p className="text-sm text-slate-500">Pending Reports</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-violet-600">{stats.totalUsers}</p>
            <p className="text-sm text-slate-500">Users</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
            <p className="text-2xl font-bold text-indigo-700">
              {totalImpressions >= 1000000 ? `${(totalImpressions / 1000000).toFixed(1)}M` : `${(totalImpressions / 1000).toFixed(1)}K`}
            </p>
            <p className="text-sm text-indigo-600">Impressions</p>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
            <p className="text-2xl font-bold text-emerald-700">
              {totalReach >= 1000000 ? `${(totalReach / 1000000).toFixed(1)}M` : `${(totalReach / 1000).toFixed(1)}K`}
            </p>
            <p className="text-sm text-emerald-600">Reach</p>
          </div>
          <div className="bg-violet-50 rounded-xl border border-violet-200 p-5">
            <p className="text-2xl font-bold text-violet-700">{stats.totalInfluencers}</p>
            <p className="text-sm text-violet-600">Influencers</p>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Reports</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {reports.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No reports yet</p>
              </div>
            ) : (
              reports.slice(0, 10).map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold">
                      {report.influencer?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{report.influencer?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{report.campaign?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {report.total_impressions?.toLocaleString() || 0} impressions
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{report.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
