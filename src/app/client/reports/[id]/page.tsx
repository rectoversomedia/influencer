import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, X, TrendUp, Eye } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, PlatformBadge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

async function getReport(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reports')
    .select(`
      *,
      campaign:campaigns(name, brand_name, required_metrics),
      influencer:profiles!reports_influencer_id_fkey(full_name, email, avatar_url),
      posts:report_posts(*)
    `)
    .eq('id', id)
    .single();

  return data;
}

export default async function ClientReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/client/reports"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                Report Review
              </h1>
              <StatusBadge status={report.status} />
            </div>
            <p className="text-slate-500 mt-1">
              {(report.campaign as { name?: string })?.name || 'Campaign'} •{' '}
              {(report.influencer as { full_name?: string })?.full_name || 'Influencer'}
            </p>
          </div>
        </div>

        {report.status === 'submitted' && (
          <div className="flex items-center gap-3">
            <form action={`/api/reports/${id}/approve`} method="POST">
              <Button variant="outline" className="text-emerald-600 hover:text-emerald-700">
                <X className="h-5 w-5" />
                Request Revision
              </Button>
            </form>
            <form action={`/api/reports/${id}/approve`} method="POST">
              <Button>
                <Check className="h-5 w-5" weight="bold" />
                Approve
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-indigo-600">
              {report.total_impressions >= 1000000
                ? `${(report.total_impressions / 1000000).toFixed(1)}M`
                : report.total_impressions >= 1000
                ? `${(report.total_impressions / 1000).toFixed(1)}K`
                : report.total_impressions}
            </p>
            <p className="text-sm text-slate-500 mt-1">Impressions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {report.total_reach >= 1000000
                ? `${(report.total_reach / 1000000).toFixed(1)}M`
                : report.total_reach >= 1000
                ? `${(report.total_reach / 1000).toFixed(1)}K`
                : report.total_reach}
            </p>
            <p className="text-sm text-slate-500 mt-1">Reach</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-pink-600">
              {report.total_likes >= 1000000
                ? `${(report.total_likes / 1000000).toFixed(1)}M`
                : report.total_likes >= 1000
                ? `${(report.total_likes / 1000).toFixed(1)}K`
                : report.total_likes}
            </p>
            <p className="text-sm text-slate-500 mt-1">Likes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-violet-600">
              {report.total_comments >= 1000000
                ? `${(report.total_comments / 1000000).toFixed(1)}M`
                : report.total_comments >= 1000
                ? `${(report.total_comments / 1000).toFixed(1)}K`
                : report.total_comments}
            </p>
            <p className="text-sm text-slate-500 mt-1">Comments</p>
          </CardContent>
        </Card>
      </div>

      {/* Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Submitted Posts ({report.posts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {report.posts?.map((post: any, index: number) => (
            <div key={post.id} className="p-5 bg-slate-50 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <PlatformBadge platform={post.platform} />
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    View Post
                  </a>
                </div>
              </div>

              {post.screenshot_public_url && (
                <div className="mb-4">
                  <img
                    src={post.screenshot_public_url}
                    alt={`Screenshot for post ${index + 1}`}
                    className="max-h-64 rounded-lg border border-slate-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {post.impressions > 0 && (
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xl font-bold text-slate-900">{post.impressions.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Impressions</p>
                  </div>
                )}
                {post.reach > 0 && (
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xl font-bold text-slate-900">{post.reach.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Reach</p>
                  </div>
                )}
                {post.likes > 0 && (
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xl font-bold text-slate-900">{post.likes.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Likes</p>
                  </div>
                )}
                {post.comments > 0 && (
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xl font-bold text-slate-900">{post.comments.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Comments</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
