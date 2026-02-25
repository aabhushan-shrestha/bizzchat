'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, InvoiceJson, Profile } from '@/lib/types/database'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

export default function CustomerOrdersPage() {
    const [user, setUser] = useState<Profile | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
            setUser(profile)

            const { data: ordersData } = await supabase
                .from('orders')
                .select(`
                    *,
                    businesses ( business_name )
                `)
                .eq('customer_id', authUser.id)
                .order('created_at', { ascending: false })

            if (ordersData) {
                setOrders(ordersData as any)
            }
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="h-screen flex flex-col bg-[#fafafa] safe-top pb-16">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-[#e5e5e5] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Avatar name={user?.full_name || user?.email} size="sm" />
                    <h1 className="text-base font-semibold text-[#1a1a1a]">My Orders</h1>
                </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-[#e5e5e5] p-5">
                                <div className="skeleton h-4 w-32 mb-3"></div>
                                <div className="skeleton h-6 w-48 mb-4"></div>
                                <div className="skeleton h-4 w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-16">
                        <div className="w-16 h-16 rounded-2xl bg-[#f0f0f0] flex items-center justify-center mb-4">
                            <span className="text-2xl">🛍️</span>
                        </div>
                        <h2 className="text-base font-medium text-[#1a1a1a] mb-2">No orders yet</h2>
                        <p className="text-sm text-[#6b7280] text-center mb-6">
                            Start chatting with a business to place an order.
                        </p>
                        <Link
                            href="/customer"
                            className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#333] transition-colors"
                        >
                            View Messages
                        </Link>
                    </div>
                ) : (
                    orders.map(order => {
                        const invoice = order.invoice_json as unknown as InvoiceJson
                        const formData = order.form_response_json as Record<string, string> | null
                        const businessName = (order as any).businesses?.business_name || 'Business'

                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-[#e5e5e5] p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-3 border-b border-[#f0f0f0] pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-bold">
                                            {businessName[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#1a1a1a]">{businessName}</p>
                                            <p className="text-[10px] text-[#9ca3af]">{new Date(order.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <Badge status={order.status} />
                                </div>

                                <div className="space-y-3 mt-3">
                                    <div>
                                        <p className="text-xs text-[#9ca3af] uppercase tracking-wide mb-1">Items</p>
                                        <p className="text-sm text-[#1a1a1a] font-medium">{order.product_name || 'Custom Order'}</p>
                                    </div>

                                    {formData && Object.keys(formData).length > 0 && (
                                        <div className="pt-3 border-t border-[#f0f0f0]">
                                            <p className="text-xs text-[#9ca3af] uppercase tracking-wide mb-2">Details</p>
                                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                                {Object.entries(formData).map(([key, value]) => (
                                                    <div key={key}>
                                                        <p className="text-[10px] text-[#9ca3af] capitalize">{key.replace(/_/g, ' ')}</p>
                                                        <p className="text-xs text-[#1a1a1a] font-medium truncate" title={String(value)}>
                                                            {String(value) || '—'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {invoice && (
                                        <div className="pt-3 border-t border-[#f0f0f0]">
                                            <p className="text-xs text-[#9ca3af] uppercase tracking-wide mb-1">Invoice</p>
                                            <p className="text-xs text-[#6b7280]">ID: {invoice.invoice_id?.slice(0, 16)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Mobile bottom nav */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e5e5] safe-bottom flex items-center pb-2 pt-2 md:pb-0 md:pt-0">
                {[
                    {
                        href: '/customer', label: 'Messages', active: false, icon: (
                            <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        )
                    },
                    {
                        href: '/customer/orders', label: 'Orders', active: true, icon: (
                            <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        )
                    },
                ].map((item: any) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex-1 flex flex-col items-center py-2 ${item.active ? 'text-[#1a1a1a]' : 'text-[#6b7280]'}`}
                    >
                        {item.icon}
                        <span className="text-[10px]">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
