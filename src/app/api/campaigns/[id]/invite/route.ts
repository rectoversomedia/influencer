import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const { email } = await request.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate invite token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Check if influencer exists
    const { data: influencer } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .eq('role', 'influencer')
      .single();

    // Create invite
    const { data, error } = await supabase
      .from('campaign_invites')
      .insert([
        {
          campaign_id: campaignId,
          influencer_id: influencer?.id,
          invite_token: token,
          expires_at: expiresAt.toISOString(),
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // If influencer exists, we could send email here
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      invite: data,
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/influencer/accept/${token}`,
    });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('campaign_invites')
      .select(`
        *,
        influencer:profiles!campaign_invites_influencer_id_fkey(id, full_name, email, avatar_url)
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get invites error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
