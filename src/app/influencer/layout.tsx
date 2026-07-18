import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function InfluencerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'influencer') {
    redirect('/auth/login');
  }

  return (
    <DashboardLayout
      role="influencer"
      userName={profile?.full_name || 'Influencer'}
      userEmail={profile?.email || user.email || ''}
    >
      {children}
    </DashboardLayout>
  );
}
