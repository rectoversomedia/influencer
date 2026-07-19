import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client for public submissions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      campaign_code,
      influencer_name,
      influencer_email,
      influencer_phone,
      posts
    } = body;

    // Validate required fields
    if (!influencer_name || !influencer_email || !campaign_code) {
      return NextResponse.json(
        { error: 'Nama, email, dan campaign harus diisi' },
        { status: 400 }
      );
    }

    // Find campaign by code
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('name', campaign_code)
      .single();

    if (campaignError || !campaign) {
      // If campaign not found, create a placeholder or use default
      console.log('Campaign not found, will store without campaign_id');
    }

    // Get or create influencer profile
    let influencerId = null;
    
    // Check if email exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', influencer_email)
      .single();

    if (existingProfile) {
      influencerId = existingProfile.id;
    } else {
      // Create new influencer profile (no auth user needed for public form)
      const newId = crypto.randomUUID();
      
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: newId,
          email: influencer_email,
          full_name: influencer_name,
          phone: influencer_phone,
          role: 'influencer'
        });
      
      influencerId = newId;
    }

    // Calculate totals from posts
    const totals = posts?.reduce((acc: any, post: any) => ({
      impressions: acc.impressions + (parseInt(post.metrics?.impressions) || 0),
      reach: acc.reach + (parseInt(post.metrics?.reach) || 0),
      views: acc.views + (parseInt(post.metrics?.views) || 0),
      likes: acc.likes + (parseInt(post.metrics?.likes) || 0),
      comments: acc.comments + (parseInt(post.metrics?.comments) || 0),
      shares: acc.shares + (parseInt(post.metrics?.shares) || 0),
      saves: acc.saves + (parseInt(post.metrics?.saves) || 0),
    }), { impressions: 0, reach: 0, views: 0, likes: 0, comments: 0, shares: 0, saves: 0 }) || {};

    // Create report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .insert({
        campaign_id: campaign?.id || null,
        influencer_id: influencerId,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        total_impressions: totals.impressions || 0,
        total_reach: totals.reach || 0,
        total_views: totals.views || 0,
        total_likes: totals.likes || 0,
        total_comments: totals.comments || 0,
        total_shares: totals.shares || 0,
        total_saves: totals.saves || 0,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Report error:', reportError);
    }

    // Store posts data (without file upload for now - we'll add that later)
    if (posts && posts.length > 0 && report) {
      const postsData = posts.map((post: any, index: number) => ({
        report_id: report.id,
        post_number: index + 1,
        platform: post.platform || 'instagram',
        post_url: post.url || '',
        caption: post.caption || '',
        impressions: parseInt(post.metrics?.impressions) || 0,
        reach: parseInt(post.metrics?.reach) || 0,
        views: parseInt(post.metrics?.views) || 0,
        likes: parseInt(post.metrics?.likes) || 0,
        comments: parseInt(post.metrics?.comments) || 0,
        shares: parseInt(post.metrics?.shares) || 0,
        saves: parseInt(post.metrics?.saves) || 0,
      }));

      await supabaseAdmin.from('report_posts').insert(postsData);
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully',
      report_id: report?.id
    });

  } catch (error) {
    console.error('Public report error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
