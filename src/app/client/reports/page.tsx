import Link from 'next/link';
import { FileText, Clock, CheckCircle, ArrowRight, TrendUp, Users } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

async function getClientReports() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  // Get campaigns for this client
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('client_id', user.id);

  const campaignIds = campaigns?.map(c => c.id) || [];

  if (campaignIds.length === 0) return [];

  const { data } = await supabase
    .from('reports')
    .select(`
      *,
      campaign:campaigns(name),
      influencer:profiles!reports_influencer_id_fkey(full_name, avatar_url)
    `)
    .in('campaign_id', campaignIds)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function ClientReportsPage() {
  const reports = await getClientReports();

  const pendingReports = reports.filter(r => r.status === 'submitted' || r.status === 'under_review');
  const approvedReports = reports.filter(r => r.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">Review and approve influencer reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingReports.length}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{approvedReports.length}</p>
              <p className="text-xs text-slate-500">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <TrendUp className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {reports.reduce((sum, r) => sum + (r.total_impressions || 0), 0) >= 1000000
                  ? `${(reports.reduce((sum, r) => sum + (r.total_impressions || 0), 0) / 1000000).toFixed(1)}M`
                  : `${(reports.reduce((sum, r) => sum + (r.total_impressions || 0), 0) / 1000).toFixed(1)}K`}
              </p>
              <p className="text-xs text-slate-500">Impressions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      {reports.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <FileText className="h-10 w-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Reports Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            No reports have been submitted for your campaigns yet.
          </p>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {reports.map((report, index) => (
              <Link
                key={report.id}
                href={`/client/reports/${report.id}`}
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
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
                      {(report.campaign as { name?: string })?.name || 'Campaign'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-slate-900">
                      {report.total_impressions?.toLocaleString() || 0} impressions
                    </p>
                    <p className="text-xs text-slate-500">
                      {report.total_likes?.toLocaleString() || 0} likes •{' '}
                      {report.total_comments?.toLocaleString() || 0} comments
                    </p>
                  </div>
                  <StatusBadge status={report.status} />
                  <ArrowRight className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
