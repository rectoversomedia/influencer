import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

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
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">Report Review</h1>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                report.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                report.status === 'submitted' ? 'bg-indigo-100 text-indigo-700' :
                report.status === 'revision_requested' ? 'bg-rose-100 text-rose-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {report.status}
              </span>
            </div>
            <p className="text-slate-500 mt-1">
              {report.campaign?.name || 'Campaign'} - {report.influencer?.full_name || 'Influencer'}
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Impressions', value: report.total_impressions, color: 'indigo' },
          { label: 'Reach', value: report.total_reach, color: 'emerald' },
          { label: 'Likes', value: report.total_likes, color: 'pink' },
          { label: 'Comments', value: report.total_comments, color: 'violet' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <p className="text-3xl font-bold text-slate-900">
              {stat.value >= 1000000 ? `${(stat.value / 1000000).toFixed(1)}M` :
               stat.value >= 1000 ? `${(stat.value / 1000).toFixed(1)}K` : stat.value}
            </p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Submitted Posts ({report.posts?.length || 0})</h2>
        </div>
        <div className="p-6 space-y-6">
          {report.posts?.map((post: any, index: number) => (
            <div key={post.id} className="p-5 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-700 capitalize">
                  {post.platform}
                </span>
                <a
                  href={post.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  View Post
                </a>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
