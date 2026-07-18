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
      report_id,
      post_number,
      platform,
      post_url,
      caption,
      screenshot_url,
      screenshot_public_url,
      impressions,
      reach,
      views,
      clicks,
      likes,
      comments,
      shares,
      saves,
      ocr_data,
    } = body;

    const { data, error } = await supabase
      .from('report_posts')
      .insert([
        {
          report_id,
          post_number,
          platform,
          post_url,
          caption,
          screenshot_url,
          screenshot_public_url,
          impressions: impressions || 0,
          reach: reach || 0,
          views: views || 0,
          clicks: clicks || 0,
          likes: likes || 0,
          comments: comments || 0,
          shares: shares || 0,
          saves: saves || 0,
          ocr_data,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create report post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
