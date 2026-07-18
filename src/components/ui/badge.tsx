import type { ReportStatus, CampaignStatus, UserRole, Platform, MetricType } from '@/types/database';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'indigo' | 'violet' | 'pink';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-rose-100 text-rose-700',
    info: 'bg-cyan-100 text-cyan-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    violet: 'bg-violet-100 text-violet-700',
    pink: 'bg-pink-100 text-pink-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center justify-center font-semibold rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const config: Record<ReportStatus, { label: string; variant: BadgeProps['variant'] }> = {
    draft: { label: 'Draft', variant: 'default' },
    submitted: { label: 'Submitted', variant: 'indigo' },
    under_review: { label: 'Under Review', variant: 'warning' },
    approved: { label: 'Approved', variant: 'success' },
    revision_requested: { label: 'Needs Revision', variant: 'error' },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const config: Record<CampaignStatus, { label: string; variant: BadgeProps['variant'] }> = {
    draft: { label: 'Draft', variant: 'default' },
    active: { label: 'Active', variant: 'success' },
    completed: { label: 'Completed', variant: 'indigo' },
    archived: { label: 'Archived', variant: 'default' },
  };

  const { label, variant } = config[status];

  return <Badge variant={variant}>{label}</Badge>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  const config: Record<UserRole, { label: string; variant: BadgeProps['variant'] }> = {
    superadmin: { label: 'Superadmin', variant: 'indigo' },
    client: { label: 'Client', variant: 'success' },
    influencer: { label: 'Influencer', variant: 'warning' },
  };

  const { label, variant } = config[role];

  return <Badge variant={variant}>{label}</Badge>;
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  const config: Record<Platform, { label: string; gradient: string }> = {
    instagram: { label: 'Instagram', gradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500' },
    tiktok: { label: 'TikTok', gradient: 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900' },
    youtube: { label: 'YouTube', gradient: 'bg-gradient-to-r from-red-600 to-red-500' },
    twitter: { label: 'X / Twitter', gradient: 'bg-gradient-to-r from-gray-900 to-gray-800' },
    facebook: { label: 'Facebook', gradient: 'bg-gradient-to-r from-blue-600 to-blue-500' },
    linkedin: { label: 'LinkedIn', gradient: 'bg-gradient-to-r from-blue-700 to-blue-600' },
    threads: { label: 'Threads', gradient: 'bg-gradient-to-r from-slate-700 to-slate-600' },
  };

  const { label, gradient } = config[platform];

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full text-white ${gradient}`}>
      {label}
    </span>
  );
}

export function MetricBadge({ metric }: { metric: MetricType }) {
  const config: Record<MetricType, { label: string; icon: string }> = {
    impressions: { label: 'Impressions', icon: '👁' },
    reach: { label: 'Reach', icon: '📍' },
    views: { label: 'Views', icon: '▶' },
    clicks: { label: 'Clicks', icon: '👆' },
    likes: { label: 'Likes', icon: '❤️' },
    comments: { label: 'Comments', icon: '💬' },
    shares: { label: 'Shares', icon: '↗' },
    saves: { label: 'Saves', icon: '🔖' },
  };

  const { label, icon } = config[metric];

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
      <span>{icon}</span>
      {label}
    </span>
  );
}
