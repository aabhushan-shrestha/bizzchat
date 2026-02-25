'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useConversations } from '@/lib/hooks/useConversations'
import { useMessages } from '@/lib/hooks/useMessages'
import { useOrderBot } from '@/lib/hooks/useOrderBot'
import BusinessSidebar from '@/components/business/BusinessSidebar'
import ConversationItem from '@/components/chat/ConversationItem'
import MessageList from '@/components/chat/MessageList'
import ChatInput from '@/components/chat/ChatInput'
import { Business, Profile } from '@/lib/types/database'
import Avatar from '@/components/ui/Avatar'
import UserDropdown from '@/components/ui/UserDropdown'

export default function InboxPage() {
    const [user, setUser] = useState<Profile | null>(null)
    const [business, setBusiness] = useState<Business | null>(null)
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
    const [selectedCustomerName, setSelectedCustomerName] = useState<string>('')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [showMobileChat, setShowMobileChat] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) return
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
            const { data: biz } = await supabase.from('businesses').select('*').eq('owner_id', authUser.id).single()
            setUser(profile)
            setBusiness(biz)
        }
        load()
    }, [])

    const { conversations, loading: convsLoading } = useConversations(
        user?.id || '', 'business', business?.id
    )

    const { messages, loading: msgsLoading, sendMessage } = useMessages(selectedConversationId)

    const { botState, startOrderFlow, handleCustomerReply, isActive: botActive } = useOrderBot({
        businessId: business?.id || '',
        businessName: business?.business_name || '',
        conversationId: selectedConversationId || '',
        senderId: user?.id || '',
    })

    async function handleSend(content: string) {
        if (!user || !selectedConversationId) return

        // Check for /order command
        if (content.trim() === '/order' && !botActive) {
            await startOrderFlow()
            return
        }

        // If bot is active, handle this as a customer reply for the bot  
        if (botActive) {
            const handled = await handleCustomerReply(content)
            if (handled) return
        }

        await sendMessage(content, user.id)
    }

    function openConversation(convId: string, customerName: string) {
        setSelectedConversationId(convId)
        setSelectedCustomerName(customerName)
        setShowMobileChat(true)
    }

    const isSomethingSelected = !!selectedConversationId

    return (
        <div className="h-screen flex bg-[#fafafa] overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <BusinessSidebar
                    businessName={business?.business_name || 'My Business'}
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Main area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Conversation list */}
                <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 lg:w-80 bg-white border-r border-[#e5e5e5]`}>
                    {/* Header */}
                    <div className="px-4 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="md:hidden">
                                <UserDropdown name={user?.full_name || user?.email || business?.business_name} size="sm" position="bottom" />
                            </div>
                            <h1 className="text-base font-semibold text-[#1a1a1a]">Inbox</h1>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-[#9ca3af]">{conversations.length} conversations</span>
                        </div>
                    </div>

                    {/* Conversations */}
                    <div className="flex-1 overflow-y-auto">
                        {convsLoading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full skeleton" />
                                        <div className="flex-1 space-y-2">
                                            <div className="skeleton h-3 w-24" />
                                            <div className="skeleton h-2.5 w-40" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
                                <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <p className="text-sm text-[#6b7280]">No conversations yet</p>
                                <p className="text-xs text-[#9ca3af] mt-1">Customers will message you here</p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conversation={conv}
                                    isActive={conv.id === selectedConversationId}
                                    role="business"
                                    onClick={() => openConversation(
                                        conv.id,
                                        conv.profiles?.full_name || conv.profiles?.email || 'Customer'
                                    )}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Chat panel */}
                <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white`}>
                    {selectedConversationId ? (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e5e5e5]">
                                <button
                                    className="md:hidden p-1 -ml-1 rounded hover:bg-[#f0f0f0] mr-1"
                                    onClick={() => setShowMobileChat(false)}
                                >
                                    <svg className="w-5 h-5 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <Avatar name={selectedCustomerName} size="sm" />
                                <div>
                                    <p className="text-sm font-semibold text-[#1a1a1a]">{selectedCustomerName}</p>
                                    <p className="text-[10px] text-[#9ca3af]">Customer</p>
                                </div>
                                {botActive && (
                                    <div className="ml-auto flex items-center gap-1.5 text-xs text-[#7c3aed] bg-[#f3f0ff] px-2.5 py-1 rounded-full">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                                        </svg>
                                        Order bot active — Step {botState.step}/4
                                    </div>
                                )}
                                <div className="ml-auto md:ml-0 flex items-center gap-1 text-[10px] text-[#9ca3af]">
                                    <span>Tip:</span>
                                    <kbd className="font-mono bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[10px]">/order</kbd>
                                    <span>for automation</span>
                                </div>
                            </div>

                            <MessageList
                                messages={messages}
                                currentUserId={user?.id || ''}
                                loading={msgsLoading}
                            />

                            <ChatInput
                                onSend={handleSend}
                                placeholder="Reply or type /order to start an order..."
                                role="business"
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-[#f0f0f0] flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h2 className="text-base font-medium text-[#1a1a1a] mb-1">Select a conversation</h2>
                                <p className="text-sm text-[#6b7280]">Choose a conversation from the list to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e5e5] safe-bottom">
                {!showMobileChat && (
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
                                href: '/business/orders', label: 'Orders', icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                )
                            },
                            {
                                href: '/business/order-popup', label: 'Order pop-up', icon: (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                                    </svg>
                                )
                            },
                        ].map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="flex-1 flex flex-col items-center py-2.5 text-[#6b7280]"
                            >
                                {item.icon}
                                <span className="text-[10px] mt-0.5">{item.label}</span>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
