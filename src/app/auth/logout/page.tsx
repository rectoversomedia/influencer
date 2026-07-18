'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.push('/auth/login');
      router.refresh();
    } else {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  // Trigger logout on mount
  if (!loggingOut) {
    handleLogout();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-600">Signing out...</p>
      </div>
    </div>
  );
}
