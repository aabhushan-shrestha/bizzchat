import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    const publicRoutes = ['/auth', '/']

    if (!user && !publicRoutes.some(r => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

        if (!profile?.role && pathname !== '/onboarding' && !publicRoutes.some(r => pathname.startsWith(r))) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        if (pathname === '/auth' && profile?.role) {
            const redirect = profile.role === 'business' ? '/business/inbox' : '/customer'
            return NextResponse.redirect(new URL(redirect, request.url))
        }

        if (pathname === '/onboarding' && profile?.role) {
            const redirect = profile.role === 'business' ? '/business/inbox' : '/customer'
            return NextResponse.redirect(new URL(redirect, request.url))
        }

        if (profile?.role === 'customer' && pathname.startsWith('/business')) {
            return NextResponse.redirect(new URL('/customer', request.url))
        }
        if (profile?.role === 'business' && pathname.startsWith('/customer')) {
            return NextResponse.redirect(new URL('/business/inbox', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
