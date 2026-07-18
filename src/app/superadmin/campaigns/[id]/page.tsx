import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Megaphone, Calendar, CurrencyDollar, Users, FileText, Plus, ArrowLeft, Envelope, Share, TrendUp } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge, CampaignStatusBadge, PlatformBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricBadge } from '@/components/ui/badge';
import { format } from 'date-fns';

async function getCampaign(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      client:profiles!campaigns_client_id_fkey(id, full_name, email, avatar_url),
      creator:profiles!campaigns_created_by_fkey(id, full_name, email),
      campaign_invites(
        *,
        influencer:profiles!campaign_invites_influencer_id_fkey(id, full_name, email, avatar_url)
      ),
      reports(
        *,
        influencer:profiles!reports_influencer_id_fkey(id, full_name, email, avatar_url),
        posts:report_posts(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaign(id);

  if (!campaign) {
    notFound();
  }

  const activeInvites = (campaign.campaign_invites || []).filter((i: any) => i.status === 'pending');
  const acceptedInvites = (campaign.campaign_invites || []).filter((i: any) => i.status === 'accepted');
  const submittedReports = (campaign.reports || []).filter((r: any) => r.status === 'submitted' || r.status === 'under_review' || r.status === 'approved');

  // Calculate totals
  const totalImpressions = submittedReports.reduce((sum: number, r: any) => sum + (r.total_impressions || 0), 0);
  const totalReach = submittedReports.reduce((sum: number, r: any) => sum + (r.total_reach || 0), 0);
  const totalEngagement = submittedReports.reduce(
    (sum: number, r: any) => sum + (r.total_likes || 0) + (r.total_comments || 0) + (r.total_shares || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/superadmin/campaigns"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{campaign.name}</h1>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <p className="text-slate-500 mt-1">
              {campaign.brand_name ? `${campaign.brand_name} • ` : ''}
              Created {format(new Date(campaign.created_at), 'dd MMMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/superadmin/campaigns/${id}/invite`}>
            <Button>
              <Envelope className="h-5 w-5" weight="bold" />
              Invite Influencers
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Timeline</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(campaign.start_date), 'dd MMM')} -{' '}
                {format(new Date(campaign.end_date), 'dd MMM yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Invited</p>
              <p className="text-sm font-semibold text-slate-900">
                {acceptedInvites.length} / {campaign.campaign_invites?.length || 0} accepted
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Reports</p>
              <p className="text-sm font-semibold text-slate-900">
                {submittedReports.length} submitted
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <CurrencyDollar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Budget</p>
              <p className="text-sm font-semibold text-slate-900">
                {campaign.budget ? `$${campaign.budget.toLocaleString()}` : 'Not set'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp className="h-5 w-5 text-indigo-600" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl">
              <p className="text-4xl font-bold text-indigo-600">
                {totalImpressions >= 1000000
                  ? `${(totalImpressions / 1000000).toFixed(1)}M`
                  : totalImpressions >= 1000
                  ? `${(totalImpressions / 1000).toFixed(1)}K`
                  : totalImpressions}
              </p>
              <p className="text-sm text-slate-600 mt-1">Total Impressions</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
              <p className="text-4xl font-bold text-emerald-600">
                {totalReach >= 1000000
                  ? `${(totalReach / 1000000).toFixed(1)}M`
                  : totalReach >= 1000
                  ? `${(totalReach / 1000).toFixed(1)}K`
                  : totalReach}
              </p>
              <p className="text-sm text-slate-600 mt-1">Total Reach</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
              <p className="text-4xl font-bold text-pink-600">
                {totalEngagement >= 1000000
                  ? `${(totalEngagement / 1000000).toFixed(1)}M`
                  : totalEngagement >= 1000
                  ? `${(totalEngagement / 1000).toFixed(1)}K`
                  : totalEngagement}
              </p>
              <p className="text-sm text-slate-600 mt-1">Total Engagement</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-slate-500 mb-3">Required Metrics</p>
            <div className="flex flex-wrap gap-2">
              {campaign.required_metrics.map((metric: string) => (
                <MetricBadge key={metric} metric={metric as any} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Reports ({submittedReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {submittedReports.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No reports submitted yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submittedReports.map((report: any) =>(
                <Link
                  key={report.id}
                  href={`/superadmin/reports/${report.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {(report.influencer as { full_name?: string })?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {(report.influencer as { full_name?: string })?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {report.posts?.length || 0} posts • {report.total_impressions?.toLocaleString() || 0} impressions
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

      {/* Pending Invites */}
      {activeInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Envelope className="h-5 w-5 text-indigo-600" />
              Pending Invites ({activeInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {activeInvites.map((invite: any) =>(
                <div key={invite.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-semibold">
                      {(invite.influencer as { full_name?: string })?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {(invite.influencer as { full_name?: string })?.full_name || invite.influencer?.email || 'Pending'}
                      </p>
                      <p className="text-sm text-slate-500">{invite.influencer?.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                    Resend
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
