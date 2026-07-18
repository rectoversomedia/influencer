import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      campaign_id,
      status,
      total_impressions,
      total_reach,
      total_views,
      total_clicks,
      total_likes,
      total_comments,
      total_shares,
      total_saves,
    } = body;

    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          campaign_id,
          influencer_id: user.id,
          status: status || 'draft',
          total_impressions: total_impressions || 0,
          total_reach: total_reach || 0,
          total_views: total_views || 0,
          total_clicks: total_clicks || 0,
          total_likes: total_likes || 0,
          total_comments: total_comments || 0,
          total_shares: total_shares || 0,
          total_saves: total_saves || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('reports')
      .select(`
        *,
        campaign:campaigns(name, brand_name),
        influencer:profiles!reports_influencer_id_fkey(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    // Filter based on role
    if (profile?.role === 'influencer') {
      query = query.eq('influencer_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
