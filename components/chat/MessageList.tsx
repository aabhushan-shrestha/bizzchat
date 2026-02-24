'use client'

import { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import { MessageWithSender } from '@/lib/types/database'

interface MessageListProps {
    messages: MessageWithSender[]
    currentUserId: string
    loading?: boolean
}

export default function MessageList({ messages, currentUserId, loading }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    if (loading) {
        return (
            <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`flex items-end gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                        <div className="w-7 h-7 rounded-full skeleton" />
                        <div className={`skeleton h-10 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
                    </div>
                ))}
            </div>
        )
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-sm text-[#6b7280]">No messages yet</p>
                    <p className="text-xs text-[#9ca3af] mt-1">Say hello to start the conversation</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
            {messages.map((msg) => (
                <MessageBubble
                    key={msg.id}
                    message={msg}
                    currentUserId={currentUserId}
                    isBusinessSender={false}
                />
            ))}
            <div ref={bottomRef} />
        </div>
    )
}
