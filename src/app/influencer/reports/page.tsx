import Link from 'next/link';
import { FileText, Clock, CheckCircle, ArrowRight, PencilSimple } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

async function getReports(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reports')
    .select(`
      *,
      campaign:campaigns(name, brand_name)
    `)
    .eq('influencer_id', userId)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function InfluencerReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const reports = await getReports(user.id);

  const draftReports = reports.filter(r => r.status === 'draft');
  const pendingReports = reports.filter(r => r.status === 'submitted' || r.status === 'under_review');
  const approvedReports = reports.filter(r => r.status === 'approved');
  const revisionReports = reports.filter(r => r.status === 'revision_requested');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Reports</h1>
        <p className="text-slate-500 mt-1">Track and manage your submitted reports</p>
      </div>

      {/* Reports */}
      {reports.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <FileText className="h-10 w-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Reports Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            You haven&apos;t submitted any reports yet. Submit your first report from your campaign page.
          </p>
          <Link
            href="/influencer/campaigns"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            View Campaigns
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Card>
      ) : (
        <>
          {/* Status Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{draftReports.length}</p>
                  <p className="text-xs text-slate-500">Drafts</p>
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
                <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                  <PencilSimple className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{revisionReports.length}</p>
                  <p className="text-xs text-slate-500">Needs Revision</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card>
            <CardContent className="p-0">
              {reports.map((report, index) => (
                <Link
                  key={report.id}
                  href={`/influencer/reports/${report.id}`}
                  className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {(report.campaign as { name?: string })?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {(report.campaign as { name?: string })?.name || 'Campaign'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(report.created_at), 'dd MMMM yyyy, HH:mm')}
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
        </>
      )}
    </div>
  );
}
