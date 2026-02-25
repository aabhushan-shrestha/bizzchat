'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
    businessName: string
    collapsed?: boolean
    onToggle?: () => void
}

const navItems = [
    {
        href: '/business/inbox',
        label: 'Inbox',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
    },
    {
        href: '/business/orders',
        label: 'Orders',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    {
        href: '/business/order-popup',
        label: 'Order pop-up',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
        ),
    },
]

export default function BusinessSidebar({ businessName, collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const supabase = createClient()
    const router = useRouter()

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/auth')
        router.refresh()
    }

    return (
        <aside className={`h-full bg-white border-r border-[#e5e5e5] flex flex-col transition-all duration-200 ${collapsed ? 'w-14' : 'w-60'}`}>
            {/* Business name */}
            <div className={`flex items-center gap-3 px-4 py-4 border-b border-[#e5e5e5] ${collapsed ? 'justify-center px-2' : ''}`}>
                <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{businessName[0]?.toUpperCase() || 'B'}</span>
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{businessName}</p>
                        <p className="text-[10px] text-[#9ca3af]">Business</p>
                    </div>
                )}
                {!collapsed && (
                    <button
                        onClick={onToggle}
                        className="ml-auto p-1 rounded hover:bg-[#f0f0f0] text-[#9ca3af] hover:text-[#1a1a1a] transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7M18 5l-7 7 7 7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${isActive
                                ? 'bg-[#f0f0f0] text-[#1a1a1a] font-medium'
                                : 'text-[#6b7280] hover:bg-[#f8f8f8] hover:text-[#1a1a1a]'
                                } ${collapsed ? 'justify-center px-2' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Settings/Sign out */}
            <div className={`border-t border-[#e5e5e5] p-2 ${collapsed ? 'flex justify-center' : ''}`}>
                <button
                    onClick={handleSignOut}
                    className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-[#6b7280] hover:bg-[#f0f0f0] hover:text-[#1a1a1a] transition-colors ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? 'Sign out' : undefined}
                >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {!collapsed && <span>Sign out</span>}
                </button>
            </div>
        </aside>
    )
}
