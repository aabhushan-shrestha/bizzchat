'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message, MessageWithSender } from '@/lib/types/database'

export function useMessages(conversationId: string | null) {
    const [messages, setMessages] = useState<MessageWithSender[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

    const fetchMessages = useCallback(async () => {
        if (!conversationId) return
        setLoading(true)
        const { data } = await supabase
            .from('messages')
            .select('*, profiles(full_name)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        setMessages((data as MessageWithSender[]) || [])
        setLoading(false)
    }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!conversationId) return

        fetchMessages()

        if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
        }

        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                async (payload: { new: Record<string, unknown> }) => {
                    const newMsg = payload.new as unknown as Message
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', newMsg.sender_id)
                        .single()

                    setMessages((prev) => [
                        ...prev,
                        { ...newMsg, profiles: profile },
                    ])
                }
            )
            .subscribe()

        channelRef.current = channel

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId, fetchMessages]) // eslint-disable-line react-hooks/exhaustive-deps

    async function sendMessage(content: string, senderId: string, isBot = false) {
        if (!conversationId) return
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content,
            is_bot: isBot,
        })
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId)
    }

    return { messages, loading, sendMessage, refetch: fetchMessages }
}
