import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/', '/login', '/signup', '/reset-password', '/legal', '/api/auth/callback']
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route))

  // Routes qui nécessitent une authentification
  const protectedRoutes = ['/dashboard', '/workflows', '/analytics', '/integrations', '/settings', '/help']
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route))

  // Si l'utilisateur est connecté et essaie d'accéder aux pages auth, rediriger vers dashboard
  if (user && (url.pathname === '/login' || url.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si l'utilisateur est connecté et accède à une route protégée, vérifier la subscription
  if (user && isProtectedRoute) {
    try {
      // Récupérer le user profile depuis la DB
      const { data: userProfile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      // Récupérer la subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Si l'onboarding n'est pas complété, rediriger (sauf si déjà sur dashboard)
      if (userProfile && !userProfile.onboarding_completed && url.pathname !== '/dashboard') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      // Si la subscription est expirée ou annulée (sauf trialing et active)
      if (subscription && !['trialing', 'active'].includes(subscription.status)) {
        // Permettre l'accès aux settings pour gérer l'abonnement
        if (!url.pathname.startsWith('/settings')) {
          return NextResponse.redirect(new URL('/settings?tab=subscription', request.url))
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      // En cas d'erreur, on laisse passer pour ne pas bloquer l'utilisateur
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (sauf /api/auth/callback)
     */
    '/((?!_next/static|_next/image|favicon.ico|api(?!/auth/callback)|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
