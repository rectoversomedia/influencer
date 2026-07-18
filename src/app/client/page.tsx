import Link from 'next/link';
import { Megaphone, FileText, TrendUp, CheckCircle, Clock, ArrowRight } from '@/app/icons';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

async function getClientDashboardData() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get campaigns for this client
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get reports for client's campaigns
  const campaignIds = campaigns?.map(c => c.id) || [];
  let reports: any[] = [];

  if (campaignIds.length > 0) {
    const { data } = await supabase
      .from('reports')
      .select(`
        *,
        campaign:campaigns(name),
        influencer:profiles(full_name, avatar_url)
      `)
      .in('campaign_id', campaignIds)
      .order('created_at', { ascending: false })
      .limit(5);
    reports = data || [];
  }

  return { campaigns: campaigns || [], reports };
}

export default async function ClientDashboard() {
  const data = await getClientDashboardData();

  if (!data) {
    return <div>Loading...</div>;
  }

  const { campaigns, reports } = data;

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');
  const pendingReports = reports.filter(r => r.status === 'submitted' || r.status === 'under_review');
  const approvedReports = reports.filter(r => r.status === 'approved');

  // Calculate total metrics
  const totalImpressions = reports.reduce((sum, r) => sum + (r.total_impressions || 0), 0);
  const totalReach = reports.reduce((sum, r) => sum + (r.total_reach || 0), 0);
  const totalEngagement = reports.reduce(
    (sum, r) => sum + (r.total_likes || 0) + (r.total_comments || 0) + (r.total_shares || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Client Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here&apos;s your campaign overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Campaigns"
          value={activeCampaigns.length}
          icon={<Megaphone className="h-7 w-7" />}
          gradient="indigo"
        />
        <StatCard
          title="Pending Reports"
          value={pendingReports.length}
          icon={<Clock className="h-7 w-7" />}
          gradient="amber"
        />
        <StatCard
          title="Approved Reports"
          value={approvedReports.length}
          icon={<CheckCircle className="h-7 w-7" />}
          gradient="emerald"
        />
        <StatCard
          title="Total Impressions"
          value={totalImpressions}
          icon={<TrendUp className="h-7 w-7" />}
          gradient="violet"
        />
      </div>

      {/* Metrics Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Total Reach"
          value={totalReach}
          icon={<TrendUp className="h-7 w-7" />}
          gradient="cyan"
        />
        <StatCard
          title="Total Engagement"
          value={totalEngagement}
          icon={<FileText className="h-7 w-7" />}
          gradient="rose"
        />
        <StatCard
          title="Completed Campaigns"
          value={completedCampaigns.length}
          icon={<CheckCircle className="h-7 w-7" />}
          gradient="emerald"
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Campaigns</CardTitle>
            <Link
              href="/client/campaigns"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {campaigns.length === 0 ? (
              <div className="p-6 text-center">
                <Megaphone className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No campaigns assigned yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {campaigns.map((campaign: any) =>(
                  <Link
                    key={campaign.id}
                    href={`/client/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                        <Megaphone className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{campaign.name}</p>
                        <p className="text-sm text-slate-500">
                          {campaign.brand_name || 'Campaign'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={campaign.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Reports</CardTitle>
            <Link
              href="/client/reports"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No reports submitted yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((report: any) =>(
                  <Link
                    key={report.id}
                    href={`/client/reports/${report.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {(report.influencer as { full_name?: string })?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {(report.influencer as { full_name?: string })?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {(report.campaign as { name?: string })?.name || 'Unknown Campaign'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={report.status} />
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
