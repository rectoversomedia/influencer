import { createClient } from './client';
import type { Profile, Campaign, Report, UserRole } from '@/types/database';

export const supabase = createClient();

// Auth helpers
export async function signUp(email: string, password: string, fullName: string, role: UserRole = 'influencer') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return profile;
}

// Profile helpers
export async function createProfile(userId: string, email: string, fullName: string, role: UserRole) {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: userId,
        email,
        full_name: fullName,
        role,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// Campaign helpers
export async function getCampaigns(role: UserRole, userId?: string) {
  let query = supabase
    .from('campaigns')
    .select(`
      *,
      creator:profiles!campaigns_created_by_fkey(id, full_name, email),
      client:profiles!campaigns_client_id_fkey(id, full_name, email),
      _count:invoices(count)
    `)
    .order('created_at', { ascending: false });

  if (role === 'client') {
    query = query.eq('client_id', userId);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getCampaign(campaignId: string) {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      creator:profiles!campaigns_created_by_fkey(id, full_name, email, avatar_url),
      client:profiles!campaigns_client_id_fkey(id, full_name, email, avatar_url),
      invites!invites_campaign_id_fkey(
        *,
        influencer:profiles!invites_influencer_id_fkey(id, full_name, email, avatar_url)
      ),
      reports(
        *,
        influencer:profiles!reports_influencer_id_fkey(id, full_name, email, avatar_url)
      )
    `)
    .eq('id', campaignId)
    .single();

  return { data, error };
}

export async function createCampaign(campaign: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .insert([campaign])
    .select()
    .single();

  return { data, error };
}

export async function updateCampaign(campaignId: string, updates: Partial<Campaign>) {
  const { data, error } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId)
    .select()
    .single();

  return { data, error };
}

export async function deleteCampaign(campaignId: string) {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId);

  return { error };
}

// Report helpers
export async function getReports(filters?: { campaignId?: string; influencerId?: string; status?: string }) {
  let query = supabase
    .from('reports')
    .select(`
      *,
      campaign:campaigns(id, name, brand_name, status),
      influencer:profiles!reports_influencer_id_fkey(id, full_name, email, avatar_url),
      reviewer:profiles!reports_reviewed_by_fkey(id, full_name),
      posts(report_posts(*))
    `)
    .order('created_at', { ascending: false });

  if (filters?.campaignId) {
    query = query.eq('campaign_id', filters.campaignId);
  }
  if (filters?.influencerId) {
    query = query.eq('influencer_id', filters.influencerId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getReport(reportId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      campaign:campaigns(*),
      influencer:profiles!reports_influencer_id_fkey(*),
      reviewer:profiles!reports_reviewed_by_fkey(*),
      posts:report_posts(*)
    `)
    .eq('id', reportId)
    .single();

  return { data, error };
}

export async function createReport(report: Partial<Report>) {
  const { data, error } = await supabase
    .from('reports')
    .insert([report])
    .select()
    .single();

  return { data, error };
}

export async function updateReport(reportId: string, updates: Partial<Report>) {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();

  return { data, error };
}

// Invite helpers
export async function createInvite(campaignId: string, influencerEmail: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: influencer } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', influencerEmail)
    .eq('role', 'influencer')
    .single();

  const { data, error } = await supabase
    .from('campaign_invites')
    .insert([
      {
        campaign_id: campaignId,
        influencer_id: influencer?.id,
        invite_token: token,
        expires_at: expiresAt.toISOString(),
      },
    ])
    .select()
    .single();

  return { data, error, token };
}

export async function getInviteByToken(token: string) {
  const { data, error } = await supabase
    .from('campaign_invites')
    .select(`
      *,
      campaign:campaigns(*),
      influencer:profiles(*)
    `)
    .eq('invite_token', token)
    .single();

  return { data, error };
}

export async function acceptInvite(token: string) {
  const { data, error } = await supabase
    .from('campaign_invites')
    .update({ status: 'accepted' })
    .eq('invite_token', token)
    .select()
    .single();

  return { data, error };
}

// File upload
export async function uploadScreenshot(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('screenshots')
    .upload(fileName, file);

  if (error) {
    return { data, error };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('screenshots')
    .getPublicUrl(fileName);

  return { data: { path: data.path, publicUrl }, error };
}

// Analytics
export async function getDashboardStats(role: UserRole, userId?: string) {
  let campaignsQuery = supabase.from('campaigns').select('*');
  let reportsQuery = supabase.from('reports').select('*');

  if (role === 'client' && userId) {
    const { data: clientCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('client_id', userId);

    const campaignIds = clientCampaigns?.map(c => c.id) || [];

    if (campaignIds.length > 0) {
      reportsQuery = reportsQuery.in('campaign_id', campaignIds);
    } else {
      reportsQuery = reportsQuery.eq('campaign_id', 'none');
    }
  }

  const [campaignsResult, reportsResult] = await Promise.all([
    campaignsQuery,
    reportsQuery,
  ]);

  const campaigns = campaignsResult.data || [];
  const reports = reportsResult.data || [];

  const totalImpressions = reports.reduce((sum, r) => sum + (r.total_impressions || 0), 0);
  const totalReach = reports.reduce((sum, r) => sum + (r.total_reach || 0), 0);
  const totalViews = reports.reduce((sum, r) => sum + (r.total_views || 0), 0);
  const totalEngagement = reports.reduce(
    (sum, r) => sum + (r.total_likes || 0) + (r.total_comments || 0) + (r.total_shares || 0),
    0
  );

  return {
    data: {
      campaigns: {
        total: campaigns.length,
        active: campaigns.filter((c) => c.status === 'active').length,
        completed: campaigns.filter((c) => c.status === 'completed').length,
      },
      reports: {
        total: reports.length,
        pending: reports.filter((r) => r.status === 'submitted' || r.status === 'under_review').length,
        approved: reports.filter((r) => r.status === 'approved').length,
        revision: reports.filter((r) => r.status === 'revision_requested').length,
      },
      metrics: {
        impressions: totalImpressions,
        reach: totalReach,
        views: totalViews,
        engagement: totalEngagement,
      },
      recentReports: reports.slice(0, 5),
    },
  };
}
