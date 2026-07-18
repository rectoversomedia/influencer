import Link from 'next/link';
import { Megaphone, Users, FileText, TrendUp, ArrowRight, Plus } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

async function getDashboardData() {
  const supabase = await createClient();

  // Get counts
  const [campaignsResult, reportsResult, usersResult] = await Promise.all([
    supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('reports')
      .select('*, campaign:campaigns(name), influencer:profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select('role')
  ]);

  const campaigns = campaignsResult.data || [];
  const reports = reportsResult.data || [];
  const profiles = usersResult.data || [];

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'submitted' || r.status === 'under_review').length,
    totalUsers: profiles.length,
    totalInfluencers: profiles.filter(p => p.role === 'influencer').length,
    totalClients: profiles.filter(p => p.role === 'client').length,
  };

  // Calculate total metrics from reports
  const totalImpressions = reports.reduce((sum, r) => sum + (r.total_impressions || 0), 0);
  const totalReach = reports.reduce((sum, r) => sum + (r.total_reach || 0), 0);
  const totalEngagement = reports.reduce(
    (sum, r) => sum + (r.total_likes || 0) + (r.total_comments || 0) + (r.total_shares || 0),
    0
  );

  return {
    campaigns,
    reports,
    stats,
    metrics: {
      impressions: totalImpressions,
      reach: totalReach,
      engagement: totalEngagement,
    }
  };
}

export default async function SuperadminDashboard() {
  const { campaigns, reports, stats, metrics } = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
        <Link
          href="/superadmin/campaigns/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" weight="bold" />
          New Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Campaigns"
          value={stats.totalCampaigns}
          icon={<Megaphone className="h-7 w-7" weight="duotone" />}
          gradient="indigo"
        />
        <StatCard
          title="Active Campaigns"
          value={stats.activeCampaigns}
          icon={<TrendUp className="h-7 w-7" weight="duotone" />}
          gradient="emerald"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={<FileText className="h-7 w-7" weight="duotone" />}
          gradient="amber"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-7 w-7" weight="duotone" />}
          gradient="violet"
        />
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Impressions"
          value={metrics.impressions}
          icon={<TrendUp className="h-7 w-7" weight="duotone" />}
          gradient="pink"
        />
        <StatCard
          title="Total Reach"
          value={metrics.reach}
          icon={<Users className="h-7 w-7" weight="duotone" />}
          gradient="cyan"
        />
        <StatCard
          title="Total Engagement"
          value={metrics.engagement}
          icon={<FileText className="h-7 w-7" weight="duotone" />}
          gradient="rose"
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Campaigns</CardTitle>
            <Link
              href="/superadmin/campaigns"
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
                <p className="text-slate-500">No campaigns yet</p>
                <Link
                  href="/superadmin/campaigns/new"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                >
                  Create your first campaign
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {campaigns.map((campaign: any) =>(
                  <Link
                    key={campaign.id}
                    href={`/superadmin/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                        <Megaphone className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{campaign.name}</p>
                        <p className="text-sm text-slate-500">
                          {campaign.brand_name || 'No brand'}
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
              href="/superadmin/reports"
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
                <p className="text-slate-500">No reports yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((report: any) =>(
                  <Link
                    key={report.id}
                    href={`/superadmin/reports/${report.id}`}
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
