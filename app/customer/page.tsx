'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useConversations } from '@/lib/hooks/useConversations'
import { useMessages } from '@/lib/hooks/useMessages'
import ConversationItem from '@/components/chat/ConversationItem'
import MessageList from '@/components/chat/MessageList'
import ChatInput from '@/components/chat/ChatInput'
import { Profile, Business } from '@/lib/types/database'
import Avatar from '@/components/ui/Avatar'
import OrderPopupModal from '@/components/customer/OrderPopupModal'
import Link from 'next/link'

export default function CustomerPage() {
    const [user, setUser] = useState<Profile | null>(null)
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
    const [selectedBusinessName, setSelectedBusinessName] = useState('')
    const [showChat, setShowChat] = useState(false)
    const [isOrderPopupOpen, setIsOrderPopupOpen] = useState(false)
    const [showBusinessList, setShowBusinessList] = useState(false)
    const [businesses, setBusinesses] = useState<Business[]>([])
    const [creating, setCreating] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
            setUser(profile)
        }
        load()
    }, [])

    const { conversations, loading: convsLoading, refetch } = useConversations(
        user?.id || '', 'customer'
    )

    const { messages, loading: msgsLoading, sendMessage } = useMessages(selectedConversationId)

    async function loadBusinesses() {
        const { data } = await supabase.from('businesses').select('*').order('business_name')
        setBusinesses(data || [])
        setShowBusinessList(true)
    }

    async function startConversation(biz: Business) {
        if (!user) return
        setCreating(true)

        // Check if conversation already exists
        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('business_id', biz.id)
            .eq('customer_id', user.id)
            .single()

        if (existing) {
            setSelectedConversationId(existing.id)
            setSelectedBusinessId(biz.id)
            setSelectedBusinessName(biz.business_name)
            setShowBusinessList(false)
            setShowChat(true)
            setCreating(false)
            return
        }

        // Create new conversation
        const { data: newConv } = await supabase
            .from('conversations')
            .insert({
                business_id: biz.id,
                customer_id: user.id,
                last_message_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (newConv) {
            setSelectedConversationId(newConv.id)
            setSelectedBusinessId(biz.id)
            setSelectedBusinessName(biz.business_name)
            await refetch()
        }

        setShowBusinessList(false)
        setShowChat(true)
        setCreating(false)
    }

    function openConversation(convId: string, businessId: string, businessName: string) {
        setSelectedConversationId(convId)
        setSelectedBusinessId(businessId)
        setSelectedBusinessName(businessName)
        setShowChat(true)
    }

    async function handleSend(content: string) {
        if (!user || !selectedConversationId) return
        await sendMessage(content, user.id)
    }

    // Business picker modal
    if (showBusinessList) {
        return (
            <div className="h-screen bg-white flex flex-col safe-top">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-[#e5e5e5]">
                    <button
                        onClick={() => setShowBusinessList(false)}
                        className="p-1.5 rounded-xl hover:bg-[#f0f0f0] text-[#6b7280]"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-base font-semibold text-[#1a1a1a]">New Conversation</h1>
                </div>
                <p className="px-4 py-3 text-sm text-[#6b7280]">Choose a business to message</p>
                <div className="flex-1 overflow-y-auto">
                    {businesses.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16">
                            <p className="text-sm text-[#6b7280]">No businesses available</p>
                        </div>
                    ) : (
                        businesses.map((biz) => (
                            <button
                                key={biz.id}
                                onClick={() => startConversation(biz)}
                                disabled={creating}
                                className="w-full flex items-center gap-3 px-4 py-4 border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-sm">{biz.business_name[0]?.toUpperCase()}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#1a1a1a]">{biz.business_name}</p>
                                    <p className="text-xs text-[#9ca3af] mt-0.5">Tap to message</p>
                                </div>
                                <svg className="w-4 h-4 text-[#9ca3af] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ))
                    )}
                </div>
            </div>
        )
    }

    // Full screen chat view
    if (showChat && selectedConversationId) {
        return (
            <div className="h-screen flex flex-col bg-white safe-top">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e5e5e5] safe-top">
                    <button
                        onClick={() => { setShowChat(false); setSelectedConversationId(null) }}
                        className="p-1.5 rounded-xl hover:bg-[#f0f0f0] text-[#6b7280]"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <Avatar name={selectedBusinessName} size="sm" />
                    <div>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{selectedBusinessName}</p>
                        <p className="text-[10px] text-[#9ca3af]">Business</p>
                    </div>
                    <button
                        onClick={() => setIsOrderPopupOpen(true)}
                        className="ml-auto bg-[#1a1a1a] text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#333] transition-colors flex items-center gap-1.5"
                    >
                        <span>🛍️</span> Order Now
                    </button>
                </div>

                <OrderPopupModal
                    isOpen={isOrderPopupOpen}
                    businessId={selectedBusinessId || ''}
                    conversationId={selectedConversationId}
                    customerId={user?.id || ''}
                    onClose={() => setIsOrderPopupOpen(false)}
                    onSuccess={() => {
                        // Optional: trigger a message or reload orders
                    }}
                />

                <MessageList
                    messages={messages}
                    currentUserId={user?.id || ''}
                    loading={msgsLoading}
                />

                <ChatInput
                    onSend={handleSend}
                    placeholder={`Message ${selectedBusinessName}...`}
                    role="customer"
                />
            </div>
        )
    }

    // Conversation list
    return (
        <div className="h-screen flex flex-col bg-white safe-top pb-16">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                    <Avatar name={user?.full_name || user?.email} size="sm" />
                    <h1 className="text-base font-semibold text-[#1a1a1a]">Messages</h1>
                </div>
                <button
                    onClick={loadBusinesses}
                    className="flex items-center gap-1.5 text-sm text-[#2383e2] font-medium px-3 py-1.5 rounded-xl hover:bg-[#f0f8ff] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New
                </button>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
                {convsLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full skeleton" />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-3.5 w-28" />
                                    <div className="skeleton h-2.5 w-44" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 px-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#f0f0f0] flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-[#1a1a1a] mb-2">No messages yet</h2>
                        <p className="text-sm text-[#6b7280] text-center mb-6">
                            Start a conversation with a business
                        </p>
                        <button
                            onClick={loadBusinesses}
                            className="flex items-center gap-2 bg-[#1a1a1a] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#2d2d2d] transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Start a conversation
                        </button>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isActive={conv.id === selectedConversationId}
                            role="customer"
                            onClick={() => openConversation(
                                conv.id,
                                conv.business_id,
                                conv.businesses?.business_name || 'Business'
                            )}
                        />
                    ))
                )}
            </div>

            {/* Mobile bottom nav */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e5e5] safe-bottom flex items-center pb-2 pt-2 md:pb-0 md:pt-0">
                {[
                    {
                        href: '/customer', label: 'Messages', active: true, icon: (
                            <svg className="w-5 h-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        )
                    },
                    {
                        href: '/customer/orders', label: 'Orders', active: false, icon: (
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
