import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function SuperadminLayout({
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

  if (profile?.role !== 'superadmin') {
    redirect('/auth/login');
  }

  return (
    <DashboardLayout
      role="superadmin"
      userName={profile?.full_name || 'Superadmin'}
      userEmail={profile?.email || user.email || ''}
    >
      {children}
    </DashboardLayout>
  );
}
