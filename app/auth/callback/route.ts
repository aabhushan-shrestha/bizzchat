import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const cookieStore = cookies()
        // Use untyped client for auth callback to avoid generic type inference issues
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supabase = createServerClient<any>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set({ name, value, ...options })
                            })
                        } catch { /* server component */ }
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                email: data.user.email ?? null,
                full_name: (data.user.user_metadata?.full_name as string) ?? null,
            }, { onConflict: 'id', ignoreDuplicates: true })

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (!profile?.role) {
                return NextResponse.redirect(`${origin}/onboarding`)
            }

            const redirect = profile.role === 'business' ? '/business/inbox' : '/customer'
            return NextResponse.redirect(`${origin}${redirect}`)
        }
    }

    return NextResponse.redirect(`${origin}/auth?error=oauth`)
}
