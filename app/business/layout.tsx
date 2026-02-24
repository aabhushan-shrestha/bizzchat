import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function BusinessLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (!profile?.role) redirect('/onboarding')
    if (profile.role !== 'business') redirect('/customer')

    return <>{children}</>
}
