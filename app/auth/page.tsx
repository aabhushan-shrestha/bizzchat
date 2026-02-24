'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const supabase = createClient()
    const router = useRouter()

    async function handleEmailAuth(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        if (mode === 'signup') {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } },
            })

            if (signUpError) {
                setError(signUpError.message)
                setLoading(false)
                return
            }

            if (data.user) {
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    email: data.user.email ?? null,
                    full_name: fullName || null,
                }, { onConflict: 'id', ignoreDuplicates: true })
                router.push('/onboarding')
                router.refresh()
            } else {
                setMessage('Check your email for the confirmation link.')
                setLoading(false)
            }
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                setError(signInError.message)
                setLoading(false)
                return
            }

            router.push('/')
            router.refresh()
        }

        setLoading(false)
    }

    async function handleGoogleAuth() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col">
            <div
                className="fixed inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #1a1a1a 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
                <div className="mb-10 text-center">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl tracking-tight">B</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-[#1a1a1a] tracking-tight">BizChat</h1>
                    <p className="text-sm text-[#6b7280] mt-1">Business messaging, simplified</p>
                </div>

                <div className="w-full max-w-sm bg-white border border-[#e5e5e5] rounded-2xl p-8 shadow-sm">
                    <div className="flex bg-[#f4f4f4] rounded-xl p-1 mb-6">
                        {(['signin', 'signup'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(null); setMessage(null) }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${mode === m
                                    ? 'bg-white text-[#1a1a1a] shadow-sm'
                                    : 'text-[#6b7280] hover:text-[#1a1a1a]'
                                    }`}
                            >
                                {m === 'signin' ? 'Sign in' : 'Sign up'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-xs font-medium text-[#6b7280] mb-1.5 uppercase tracking-wide">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    required
                                    className="w-full px-3.5 py-2.5 text-sm bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-[#1a1a1a] placeholder-[#9ca3af] transition-all focus:border-[#2383e2] focus:bg-white"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-[#6b7280] mb-1.5 uppercase tracking-wide">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-3.5 py-2.5 text-sm bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-[#1a1a1a] placeholder-[#9ca3af] transition-all focus:border-[#2383e2] focus:bg-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#6b7280] mb-1.5 uppercase tracking-wide">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={8}
                                className="w-full px-3.5 py-2.5 text-sm bg-[#fafafa] border border-[#e5e5e5] rounded-xl text-[#1a1a1a] placeholder-[#9ca3af] transition-all focus:border-[#2383e2] focus:bg-white"
                            />
                        </div>

                        {error && (
                            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-[#1a1a1a] text-white text-sm font-medium rounded-xl hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                                </span>
                            ) : (
                                mode === 'signin' ? 'Sign in' : 'Create account'
                            )}
                        </button>
                    </form>

                    <div className="my-5 flex items-center gap-3">
                        <div className="flex-1 h-px bg-[#e5e5e5]" />
                        <span className="text-xs text-[#9ca3af]">or</span>
                        <div className="flex-1 h-px bg-[#e5e5e5]" />
                    </div>

                    <button
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-2.5 bg-white border border-[#e5e5e5] rounded-xl text-sm font-medium text-[#1a1a1a] hover:bg-[#f9f9f9] transition-colors disabled:opacity-50"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <p className="text-xs text-[#9ca3af] text-center mt-6">
                    By continuing, you agree to our Terms of Service
                </p>
            </div>
        </div>
    )
}
