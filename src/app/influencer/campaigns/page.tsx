import Link from 'next/link';
import { Megaphone, Calendar, ArrowRight, Users } from '@/app/icons';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CampaignStatusBadge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

async function getInfluencerCampaigns() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get accepted invites
  const { data: invites } = await supabase
    .from('campaign_invites')
    .select(`
      *,
      campaign:campaigns(*)
    `)
    .eq('influencer_id', user.id)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  return invites || [];
}

export default async function InfluencerCampaignsPage() {
  const invites = await getInfluencerCampaigns();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Campaigns</h1>
        <p className="text-slate-500 mt-1">Campaigns you&apos;re participating in</p>
      </div>

      {/* Campaigns */}
      {invites.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <Megaphone className="h-10 w-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Campaigns Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            You haven&apos;t been invited to any campaigns yet. Invitations will appear here when you receive one.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invites.map((invite, index) => (
            <Link
              key={invite.id}
              href={`/influencer/campaigns/${invite.campaign?.id}`}
              className="group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card hover gradient="indigo">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Megaphone className="h-7 w-7 text-white" />
                    </div>
                    <CampaignStatusBadge status={invite.campaign?.status || 'draft'} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {invite.campaign?.name}
                  </h3>

                  <p className="text-sm text-slate-500 mb-4">
                    {invite.campaign?.brand_name || 'Campaign'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(invite.campaign?.start_date || ''), 'dd MMM')}
                      </span>
                    </div>
                    <span>-</span>
                    <span>
                      {format(new Date(invite.campaign?.end_date || ''), 'dd MMM yyyy')}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Click to view details</span>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
