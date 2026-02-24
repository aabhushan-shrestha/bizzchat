'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState<'business' | 'customer' | null>(null)
    const supabase = createClient()
    const router = useRouter()

    async function handleRoleSelect(role: 'business' | 'customer') {
        setSelected(role)
        setLoading(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/auth')
            return
        }

        await supabase
            .from('profiles')
            .update({ role })
            .eq('id', user.id)

        if (role === 'business') {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', user.id)
                .maybeSingle()

            const businessName = profile?.full_name
                ? `${profile.full_name}'s Business`
                : 'My Business'

            await supabase.from('businesses').insert({
                owner_id: user.id,
                business_name: businessName,
            })

            router.push('/business/inbox')
        } else {
            router.push('/customer')
        }

        router.refresh()
    }

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-6 relative">
            <div
                className="fixed inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">B</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-2">
                        Who are you?
                    </h1>
                    <p className="text-sm text-[#6b7280]">
                        Tell us how you use BizChat so we can set up the right experience
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => handleRoleSelect('business')}
                        disabled={loading}
                        className={`w-full p-6 bg-white border-2 rounded-2xl text-left transition-all duration-200 hover:shadow-sm hover:border-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed ${selected === 'business' ? 'border-[#1a1a1a] shadow-sm' : 'border-[#e5e5e5]'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#f0f0f0] flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-semibold text-[#1a1a1a] text-base mb-1">Business</h2>
                                <p className="text-sm text-[#6b7280] leading-relaxed">
                                    Manage customer conversations, automate orders, and track your inbox.
                                </p>
                            </div>
                        </div>
                        {selected === 'business' && loading && (
                            <div className="mt-4 flex items-center gap-2 text-xs text-[#2383e2]">
                                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Setting up your business...
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => handleRoleSelect('customer')}
                        disabled={loading}
                        className={`w-full p-6 bg-white border-2 rounded-2xl text-left transition-all duration-200 hover:shadow-sm hover:border-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed ${selected === 'customer' ? 'border-[#1a1a1a] shadow-sm' : 'border-[#e5e5e5]'
                            }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#f0f0f0] flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-[#1a1a1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-semibold text-[#1a1a1a] text-base mb-1">Customer</h2>
                                <p className="text-sm text-[#6b7280] leading-relaxed">
                                    Message businesses directly and track your orders in real-time.
                                </p>
                            </div>
                        </div>
                        {selected === 'customer' && loading && (
                            <div className="mt-4 flex items-center gap-2 text-xs text-[#2383e2]">
                                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Setting up your profile...
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
