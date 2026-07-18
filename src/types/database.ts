// Database types for the Influencer Report System

export type UserRole = 'superadmin' | 'client' | 'influencer';

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'archived';

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin' | 'threads';

export type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'revision_requested';

export type InviteStatus = 'pending' | 'accepted' | 'declined';

export type MetricType = 'impressions' | 'reach' | 'views' | 'clicks' | 'likes' | 'comments' | 'shares' | 'saves';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface PlatformInfo {
  platform: Platform;
  username: string;
  followers?: number;
  url?: string;
}

export interface InfluencerProfile {
  id: string;
  user_id: string;
  platforms: PlatformInfo[];
  niche?: string;
  average_engagement_rate?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  brand_name?: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  required_metrics: MetricType[];
  min_posts_required: number;
  budget?: number;
  created_by: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  client?: Profile;
  invites?: CampaignInvite[];
  _count?: {
    reports: number;
    invites: number;
  };
}

export interface CampaignInvite {
  id: string;
  campaign_id: string;
  influencer_id?: string;
  invite_token: string;
  status: InviteStatus;
  expires_at: string;
  created_at: string;
  campaign?: Campaign;
  influencer?: Profile;
}

export interface ReportPost {
  id: string;
  report_id: string;
  post_number: number;
  platform: Platform;
  post_url: string;
  caption?: string;
  impressions: number;
  reach: number;
  views: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  screenshot_url?: string;
  screenshot_public_url?: string;
  ocr_data?: Record<string, unknown>;
  ocr_confidence?: number;
  created_at: string;
}

export interface Report {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: ReportStatus;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  feedback?: string;
  total_impressions: number;
  total_reach: number;
  total_views: number;
  total_clicks: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_saves: number;
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
  influencer?: Profile;
  reviewer?: Profile;
  posts?: ReportPost[];
}

export interface AnalyticsOverview {
  total_campaigns: number;
  active_campaigns: number;
  total_reports: number;
  pending_reports: number;
  total_influencers: number;
  total_impressions: number;
  total_reach: number;
  total_views: number;
  total_engagement: number;
}

export interface CampaignAnalytics {
  campaign_id: string;
  campaign_name: string;
  total_reports: number;
  approved_reports: number;
  pending_reports: number;
  metrics: {
    impressions: number;
    reach: number;
    views: number;
    clicks: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  influencer_performance: {
    influencer_id: string;
    influencer_name: string;
    metrics: {
      impressions: number;
      reach: number;
      views: number;
      clicks: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
    };
    report_count: number;
  }[];
  platform_distribution: {
    platform: Platform;
    count: number;
    percentage: number;
  }[];
  timeline: {
    date: string;
    impressions: number;
    reach: number;
    engagement: number;
  }[];
}

export interface OCRResult {
  success: boolean;
  metrics?: {
    impressions?: number;
    reach?: number;
    views?: number;
    clicks?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
  };
  confidence: number;
  raw_text?: string;
  error?: string;
}

// Form types
export interface CampaignFormData {
  name: string;
  description?: string;
  brand_name?: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  required_metrics: MetricType[];
  min_posts_required: number;
  budget?: number;
  client_id?: string;
}

export interface ReportFormData {
  campaign_id: string;
  posts: {
    platform: Platform;
    post_url: string;
    caption?: string;
    screenshots: File[];
    metrics: {
      impressions?: number;
      reach?: number;
      views?: number;
      clicks?: number;
      likes?: number;
      comments?: number;
      shares?: number;
      saves?: number;
    };
  }[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard stats
export interface DashboardStats {
  campaigns: {
    total: number;
    active: number;
    completed: number;
  };
  reports: {
    total: number;
    pending: number;
    approved: number;
    revision: number;
  };
  metrics: {
    impressions: number;
    reach: number;
    views: number;
    engagement: number;
  };
  recentReports: Report[];
  topInfluencers: {
    id: string;
    name: string;
    avatar?: string;
    total_impressions: number;
    report_count: number;
  }[];
}
