'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/database'
import Avatar from '@/components/ui/Avatar'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth')
                return
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            setProfile(data)
            setLoading(false)
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#fafafa]">
                <div className="skeleton w-64 h-32 rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="h-screen bg-[#fafafa] p-6 flex flex-col items-center safe-top">
            <div className="w-full max-w-md">
                <button
                    onClick={() => router.back()}
                    className="mb-6 flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <div className="bg-white rounded-3xl border border-[#e5e5e5] p-8 shadow-sm flex flex-col items-center text-center">
                    <Avatar
                        name={profile?.full_name || profile?.email}
                        size="lg"
                        className="w-24 h-24 text-3xl mb-6 shadow-inner"
                    />

                    <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">
                        {profile?.full_name || 'Anonymous User'}
                    </h1>

                    <p className="text-[#6b7280] text-sm mb-6">
                        {profile?.email}
                    </p>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f0f0f0] rounded-full text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">
                        <span className={`w-2 h-2 rounded-full ${profile?.role === 'business' ? 'bg-[#7c3aed]' : 'bg-[#2383e2]'}`} />
                        {profile?.role || 'No Role'}
                    </div>

                    <div className="w-full border-t border-[#f0f0f0] mt-8 pt-8 text-left space-y-4">
                        <div>
                            <p className="text-[10px] text-[#9ca3af] uppercase font-bold tracking-widest mb-1">Account ID</p>
                            <p className="text-xs font-mono text-[#6b7280] truncate bg-[#fafafa] p-2 rounded border border-[#f0f0f0]">
                                {profile?.id}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#9ca3af] uppercase font-bold tracking-widest mb-1">Joined</p>
                            <p className="text-sm text-[#1a1a1a]">
                                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                    month: 'long', day: 'numeric', year: 'numeric'
                                }) : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
