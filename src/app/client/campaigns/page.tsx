import Link from 'next/link';
import { Megaphone, ArrowRight, Users, TrendUp } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { CampaignStatusBadge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

async function getClientCampaigns() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('campaigns')
    .select(`
      *,
      reports(count)
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function ClientCampaignsPage() {
  const campaigns = await getClientCampaigns();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Campaigns</h1>
        <p className="text-slate-500 mt-1">View and manage your assigned campaigns</p>
      </div>

      {/* Campaigns */}
      {campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <Megaphone className="h-10 w-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Campaigns Assigned</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            You haven&apos;t been assigned to any campaigns yet. Contact your account manager.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <Link
              key={campaign.id}
              href={`/client/campaigns/${campaign.id}`}
              className="group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card hover gradient="indigo">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Megaphone className="h-7 w-7 text-white" weight="bold" />
                    </div>
                    <CampaignStatusBadge status={campaign.status} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {campaign.name}
                  </h3>

                  <p className="text-sm text-slate-500 mb-4">
                    {campaign.brand_name || 'Campaign'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{(campaign.reports?.[0]?.count || 0)} reports</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {format(new Date(campaign.start_date), 'dd MMM')}
                      </span>
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
