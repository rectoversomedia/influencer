import Link from 'next/link';
import { Megaphone, Plus, MagnifyingGlass, Funnel, DotsThree } from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

async function getCampaigns() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      client:profiles!campaigns_client_id_fkey(id, full_name, email, avatar_url),
      reports(count),
      campaign_invites(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }

  return data || [];
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500 mt-1">Manage all your influencer campaigns</p>
        </div>
        <Link href="/superadmin/campaigns/new">
          <Button>
            <Plus className="h-5 w-5" weight="bold" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline">
          <Funnel className="h-5 w-5" />
          Filters
        </Button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <Megaphone className="h-10 w-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No campaigns yet</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Create your first campaign to start managing influencer partnerships
          </p>
          <Link href="/superadmin/campaigns/new">
            <Button size="lg">
              <Plus className="h-5 w-5" weight="bold" />
              Create Campaign
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign, index) => (
            <Link
              key={campaign.id}
              href={`/superadmin/campaigns/${campaign.id}`}
              className="group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card hover gradient="indigo">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Megaphone className="h-7 w-7 text-white" weight="bold" />
                    </div>
                    <StatusBadge status={campaign.status} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {campaign.name}
                  </h3>

                  <p className="text-sm text-slate-500 mb-4">
                    {campaign.brand_name || 'No brand specified'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div>
                      <span className="font-semibold text-slate-700">
                        {(campaign.reports?.[0]?.count || 0)}
                      </span>{' '}
                      reports
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">
                        {(campaign.campaign_invites?.[0]?.count || 0)}
                      </span>{' '}
                      invites
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {format(new Date(campaign.start_date), 'dd MMM')} -{' '}
                        {format(new Date(campaign.end_date), 'dd MMM yyyy')}
                      </span>
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
