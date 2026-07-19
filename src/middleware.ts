import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get user profile to check role
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes based on role
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isPublicRoute = request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/influencer');
  const isSuperadminRoute = request.nextUrl.pathname.startsWith('/superadmin');
  const isClientRoute = request.nextUrl.pathname.startsWith('/client');

  // If not authenticated and trying to access protected route (not public)
  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // If authenticated and trying to access auth route, redirect to dashboard
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'influencer';
    const url = request.nextUrl.clone();

    if (role === 'superadmin') {
      url.pathname = '/superadmin';
    } else if (role === 'client') {
      url.pathname = '/client';
    } else {
      url.pathname = '/influencer';
    }

    return NextResponse.redirect(url);
  }

  // Role-based route protection
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'influencer';
    const url = request.nextUrl.clone();

    // Superadmin can access everything
    if (role === 'superadmin') {
      return supabaseResponse;
    }

    // Client routes
    if (isClientRoute && role !== 'client') {
      url.pathname = role === 'superadmin' ? '/superadmin' : '/influencer';
      return NextResponse.redirect(url);
    }

    // Superadmin routes (only superadmin can access)
    if (isSuperadminRoute && role !== 'superadmin') {
      url.pathname = role === 'client' ? '/client' : '/influencer';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
