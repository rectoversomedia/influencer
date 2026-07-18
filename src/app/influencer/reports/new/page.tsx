import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import NewReportForm from '@/components/reports/report-form';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react';

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ campaignId?: string }>;
}) {
  const { campaignId } = await searchParams;

  if (!campaignId) {
    redirect('/influencer/campaigns');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get campaign details
  const { data: invite } = await supabase
    .from('campaign_invites')
    .select(`
      *,
      campaign:campaigns(*)
    `)
    .eq('campaign_id', campaignId)
    .eq('influencer_id', user.id)
    .eq('status', 'accepted')
    .single();

  if (!invite) {
    redirect('/influencer/campaigns');
  }

  return (
    <div>
      <NewReportForm campaignId={campaignId} campaign={invite.campaign} />
    </div>
  );
}
