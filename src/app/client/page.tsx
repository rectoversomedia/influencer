import Link from 'next/link';
import { Megaphone, FileText, TrendUp, CheckCircle, Clock } from '@/app/icons';
import { createClient } from '@/lib/supabase/server';

async function getClientDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  const campaignIds = campaigns?.map(c => c.id) || [];
  let reports: any[] = [];

  if (campaignIds.length > 0) {
    const { data } = await supabase
      .from('reports')
      .select('*, campaign:campaigns(name), influencer:profiles(full_name)')
      .in('campaign_id', campaignIds)
      .order('created_at', { ascending: false });
    reports = data || [];
  }

  return { campaigns: campaigns || [], reports };
}

export default async function ClientDashboard() {
  const data = await getClientDashboardData();

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Please login to view dashboard</p>
      </div>
    );
  }

  const { campaigns, reports } = data;
  const pendingReports = reports.filter((r: any) => r.status === 'submitted' || r.status === 'under_review');
  const totalImpressions = reports.reduce((sum: number, r: any) => sum + (r.total_impressions || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Client Dashboard</h1>
            <p className="text-slate-500">Welcome back!</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-slate-900">{campaigns.length}</p>
            <p className="text-sm text-slate-500">Campaigns</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-amber-600">{pendingReports.length}</p>
            <p className="text-sm text-slate-500">Pending Reports</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-indigo-600">
              {totalImpressions >= 1000000 ? `${(totalImpressions / 1000000).toFixed(1)}M` : `${(totalImpressions / 1000).toFixed(1)}K`}
            </p>
            <p className="text-sm text-slate-500">Total Impressions</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
            <p className="text-sm text-slate-500">Total Reports</p>
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
                <Link
                  key={report.id}
                  href={`/client/reports/${report.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                      {report.influencer?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{report.influencer?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{report.campaign?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {report.total_impressions?.toLocaleString() || 0} impressions
                      </p>
                      <p className="text-xs text-slate-500 capitalize">{report.status}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
