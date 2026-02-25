'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Avatar from './Avatar'
import Link from 'next/link'

interface UserDropdownProps {
    name?: string | null
    size?: 'sm' | 'md' | 'lg'
    position?: 'top' | 'bottom'
    showName?: boolean
}

export default function UserDropdown({ name, size = 'sm', position = 'bottom', showName = false }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/auth')
        router.refresh()
    }

    const menuPositionClass = position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2.5 transition-transform active:scale-95 focus:outline-none ${showName ? 'w-full px-2 py-1.5 rounded-xl hover:bg-[#f0f0f0]' : ''}`}
            >
                <Avatar name={name} size={size} className="cursor-pointer hover:opacity-80 transition-opacity" />
                {showName && (
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-semibold text-[#1a1a1a] truncate">{name || 'User'}</p>
                        <p className="text-[10px] text-[#9ca3af]">Acount</p>
                    </div>
                )}
            </button>

            {isOpen && (
                <div className={`absolute left-0 ${menuPositionClass} w-48 bg-white rounded-2xl shadow-xl border border-[#e5e5e5] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200`}>
                    <div className="px-4 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
                        <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-0.5">Signed in as</p>
                        <p className="text-xs font-semibold text-[#1a1a1a] truncate">{name || 'User'}</p>
                    </div>

                    <div className="p-1.5">
                        <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#1a1a1a] hover:bg-[#f0f0f0] rounded-xl transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg className="w-4 h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
