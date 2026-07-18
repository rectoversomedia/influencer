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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const {
      name,
      description,
      brand_name,
      start_date,
      end_date,
      status,
      required_metrics,
      min_posts_required,
      budget,
      client_id,
    } = body;

    const { data, error } = await supabase
      .from('campaigns')
      .insert([
        {
          name,
          description,
          brand_name,
          start_date,
          end_date,
          status: status || 'draft',
          required_metrics: required_metrics || ['impressions', 'reach', 'likes', 'comments'],
          min_posts_required: min_posts_required || 1,
          budget,
          client_id,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('campaigns')
      .select(`
        *,
        client:profiles!campaigns_client_id_fkey(id, full_name, email, avatar_url),
        creator:profiles!campaigns_created_by_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
