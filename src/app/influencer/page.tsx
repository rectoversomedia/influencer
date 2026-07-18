import Link from 'next/link';
import { Megaphone, FileText, TrendUp, Clock, CheckCircle, ArrowRight } from '@/app/icons';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge, CampaignStatusBadge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

async function getInfluencerDashboardData() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get accepted invites for this influencer
  const { data: invites } = await supabase
    .from('campaign_invites')
    .select(`
      *,
      campaign:campaigns(*)
    `)
    .eq('influencer_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  // Get reports for this influencer
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      campaign:campaigns(name)
    `)
    .eq('influencer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    invites: invites || [],
    reports: reports || [],
  };
}

export default async function InfluencerDashboard() {
  const data = await getInfluencerDashboardData();

  if (!data) {
    return <div>Loading...</div>;
  }

  const { invites, reports } = data;

  const activeCampaigns = invites.filter(i => i.campaign?.status === 'active');
  const pendingReports = reports.filter(r => r.status === 'submitted' || r.status === 'under_review');
  const approvedReports = reports.filter(r => r.status === 'approved');
  const draftReports = reports.filter(r => r.status === 'draft');

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
        <h1 className="text-3xl font-bold text-slate-900">Influencer Dashboard</h1>
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
          title="Draft Reports"
          value={draftReports.length}
          icon={<FileText className="h-7 w-7" />}
          gradient="violet"
        />
      </div>

      {/* Metrics Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Your Impressions"
          value={totalImpressions}
          icon={<TrendUp className="h-7 w-7" />}
          gradient="pink"
        />
        <StatCard
          title="Your Reach"
          value={totalReach}
          icon={<TrendUp className="h-7 w-7" />}
          gradient="cyan"
        />
        <StatCard
          title="Your Engagement"
          value={totalEngagement}
          icon={<FileText className="h-7 w-7" />}
          gradient="rose"
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assigned Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Campaigns</CardTitle>
            <Link
              href="/influencer/campaigns"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {activeCampaigns.length === 0 ? (
              <div className="p-6 text-center">
                <Megaphone className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No active campaigns</p>
                <p className="text-sm text-slate-400 mt-1">Invites will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeCampaigns.slice(0, 5).map((invite: any) =>(
                  <Link
                    key={invite.id}
                    href={`/influencer/campaigns/${invite.campaign?.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                        <Megaphone className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{invite.campaign?.name}</p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(invite.campaign?.start_date || ''), 'dd MMM')} -{' '}
                          {format(new Date(invite.campaign?.end_date || ''), 'dd MMM')}
                        </p>
                      </div>
                    </div>
                    <CampaignStatusBadge status={invite.campaign?.status || 'draft'} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Reports</CardTitle>
            <Link
              href="/influencer/reports"
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
                <Link
                  href="/influencer/campaigns"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-2 inline-block"
                >
                  Submit your first report
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reports.map((report: any) =>(
                  <Link
                    key={report.id}
                    href={`/influencer/reports/${report.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {(report.campaign as { name?: string })?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {(report.campaign as { name?: string })?.name || 'Campaign'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: id })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={report.status} />
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
