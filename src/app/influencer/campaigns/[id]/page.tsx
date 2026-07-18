import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Target, Image, Plus, ArrowSquareOut } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CampaignStatusBadge, MetricBadge } from '@/components/ui/badge';
import { format } from 'date-fns';
import NewReportForm from '@/components/reports/report-form';

async function getCampaign(id: string, userId: string) {
  const supabase = await createClient();

  // Get invite
  const { data: invite } = await supabase
    .from('campaign_invites')
    .select(`
      *,
      campaign:campaigns(*)
    `)
    .eq('campaign_id', id)
    .eq('influencer_id', userId)
    .eq('status', 'accepted')
    .single();

  if (!invite) return null;

  // Get existing reports
  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .eq('campaign_id', id)
    .eq('influencer_id', userId)
    .order('created_at', { ascending: false });

  return {
    invite,
    reports: reports || [],
  };
}

export default async function InfluencerCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const data = await getCampaign(id, user.id);

  if (!data) {
    notFound();
  }

  const { invite, reports } = data;
  const campaign = invite.campaign;

  // Check if user already has a submitted report
  const hasSubmittedReport = reports.some(r => r.status !== 'draft');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/influencer/campaigns"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{campaign?.name}</h1>
              <CampaignStatusBadge status={campaign?.status || 'draft'} />
            </div>
            <p className="text-slate-500 mt-1">
              {campaign?.brand_name || 'Campaign'}
            </p>
          </div>
        </div>

        {!hasSubmittedReport && (
          <Link href={`/influencer/reports/new?campaignId=${id}`}>
            <Button>
              <Plus className="h-5 w-5" weight="bold" />
              Submit Report
            </Button>
          </Link>
        )}
      </div>

      {/* Campaign Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Timeline</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(campaign?.start_date || ''), 'dd MMM')} -{' '}
                {format(new Date(campaign?.end_date || ''), 'dd MMM yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Target className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Required Metrics</p>
              <p className="text-sm font-semibold text-slate-900">
                {campaign?.required_metrics?.length || 0} metrics
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Image className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Min. Posts Required</p>
              <p className="text-sm font-semibold text-slate-900">
                {campaign?.min_posts_required || 1} post(s)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Metrics Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {campaign?.required_metrics?.map((metric: string) => (
              <MetricBadge key={metric} metric={metric as any} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {campaign?.description && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">{campaign.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Reports */}
      <Card>
        <CardHeader>
          <CardTitle>My Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <Image className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 mb-4">No reports submitted yet</p>
              {!hasSubmittedReport && (
                <Link href={`/influencer/reports/new?campaignId=${id}`}>
                  <Button>
                    <Plus className="h-5 w-5" weight="bold" />
                    Submit Your First Report
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      Report #{reports.indexOf(report) + 1}
                    </p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(report.created_at), 'dd MMMM yyyy, HH:mm')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {report.total_impressions?.toLocaleString() || 0} impressions
                      </p>
                      <p className="text-xs text-slate-500">
                        {report.total_likes?.toLocaleString() || 0} likes
                      </p>
                    </div>
                    <Link href={`/influencer/reports/${report.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowSquareOut className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
