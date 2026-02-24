'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useOrders } from '@/lib/hooks/useOrders'
import BusinessSidebar from '@/components/business/BusinessSidebar'
import { OrderRow } from '@/components/business/OrderRow'
import { Business, Order } from '@/lib/types/database'

export default function OrdersPage() {
    const [business, setBusiness] = useState<Business | null>(null)
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: biz } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single()
            setBusiness(biz)
        }
        load()
    }, [])

    const { orders, loading, markDelivered } = useOrders(business?.id || null)

    function handleExpand(order: Order) {
        setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
    }

    return (
        <div className="h-screen flex bg-[#fafafa] overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:flex">
                <BusinessSidebar
                    businessName={business?.business_name || 'My Business'}
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-[#e5e5e5] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-[#1a1a1a]">Orders</h1>
                            <p className="text-sm text-[#6b7280] mt-0.5">
                                {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
                                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                                Pending
                                <span className="w-2 h-2 rounded-full bg-green-400 inline-block ml-2" />
                                Delivered
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="skeleton h-12 rounded-lg" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center h-full">
                            <div className="w-16 h-16 rounded-2xl bg-[#f0f0f0] flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h2 className="text-base font-medium text-[#1a1a1a] mb-1">No orders yet</h2>
                            <p className="text-sm text-[#6b7280] text-center max-w-xs">
                                Use <kbd className="font-mono bg-[#f0f0f0] px-1.5 py-0.5 rounded text-xs">/order</kbd> in a chat to create your first order
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                                    {['Order ID', 'Customer', 'Product', 'Address', 'Phone', 'Status', 'Created', 'Actions'].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-[#9ca3af] font-medium whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-[#f0f0f0]">
                                {orders.map((order) => (
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                        onMarkDelivered={markDelivered}
                                        onExpand={handleExpand}
                                        isExpanded={expandedOrderId === order.id}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e5e5] safe-bottom">
                <div className="flex items-center">
                    {[
                        {
                            href: '/business/inbox', label: 'Inbox', icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            )
                        },
                        {
                            href: '/business/orders', label: 'Orders', active: true, icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            )
                        },
                    ].map((item: any) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`flex-1 flex flex-col items-center py-2.5 ${item.active ? 'text-[#1a1a1a]' : 'text-[#6b7280]'}`}
                        >
                            {item.icon}
                            <span className="text-[10px] mt-0.5">{item.label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}
