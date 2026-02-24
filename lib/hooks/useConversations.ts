'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ConversationWithDetails } from '@/lib/types/database'

export function useConversations(userId: string, role: 'business' | 'customer', businessId?: string) {
    const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

    const fetchConversations = useCallback(async () => {
        if (!userId) return
        setLoading(true)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query: any = supabase
            .from('conversations')
            .select(`
        *,
        businesses(business_name),
        profiles!conversations_customer_id_fkey(full_name, email)
      `)
            .order('last_message_at', { ascending: false })

        if (role === 'business' && businessId) {
            query = query.eq('business_id', businessId)
        } else if (role === 'customer') {
            query = query.eq('customer_id', userId)
        }

        const { data } = await query

        if (data) {
            const enriched = await Promise.all(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.map(async (conv: any) => {
                    const { data: msgs } = await supabase
                        .from('messages')
                        .select('content')
                        .eq('conversation_id', conv.id)
                        .order('created_at', { ascending: false })
                        .limit(1)

                    const msgRow = msgs?.[0] as { content: string } | undefined
                    return {
                        ...conv,
                        last_message: msgRow?.content || null,
                    } as ConversationWithDetails
                })
            )
            setConversations(enriched)
        }

        setLoading(false)
    }, [userId, role, businessId]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchConversations()

        if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
        }

        const channel = supabase
            .channel(`conversations:${userId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations' },
                () => fetchConversations()
            )
            .subscribe()

        channelRef.current = channel

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchConversations]) // eslint-disable-line react-hooks/exhaustive-deps

    return { conversations, loading, refetch: fetchConversations }
}
