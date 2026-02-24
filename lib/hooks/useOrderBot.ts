'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrderBotState, InvoiceJson } from '@/lib/types/database'
import { v4 as uuidv4 } from 'uuid'

export const BOT_SENDER_ID = '00000000-0000-0000-0000-000000000001'

interface UseOrderBotProps {
    businessId: string
    businessName: string
    conversationId: string
    senderId: string
    onMessageSent?: () => void
}

export function useOrderBot({ businessId, businessName, conversationId, onMessageSent }: UseOrderBotProps) {
    const [botState, setBotState] = useState<OrderBotState>({ active: false, step: 0 })
    const supabase = createClient()

    const sendBotMessage = useCallback(async (content: string) => {
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: BOT_SENDER_ID,
            content,
            is_bot: true,
        })
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId)
        onMessageSent?.()
    }, [conversationId, onMessageSent]) // eslint-disable-line react-hooks/exhaustive-deps

    const startOrderFlow = useCallback(async () => {
        setBotState({ active: true, step: 1 })
        await sendBotMessage("Let's create an order! What is the customer's full name?")
    }, [sendBotMessage])

    const handleCustomerReply = useCallback(async (reply: string): Promise<boolean> => {
        if (!botState.active) return false

        const step = botState.step

        if (step === 1) {
            setBotState((prev: OrderBotState) => ({ ...prev, step: 2, customer_name: reply }))
            await sendBotMessage('Got it. What is the delivery address?')
            return true
        }

        if (step === 2) {
            setBotState((prev: OrderBotState) => ({ ...prev, step: 3, address: reply }))
            await sendBotMessage("What is the customer's phone number?")
            return true
        }

        if (step === 3) {
            setBotState((prev: OrderBotState) => ({ ...prev, step: 4, phone: reply }))
            await sendBotMessage('What product are they ordering?')
            return true
        }

        if (step === 4) {
            const currentState = botState
            setBotState((prev: OrderBotState) => ({ ...prev, step: 5, product_name: reply }))

            const invoiceId = uuidv4()
            const now = new Date().toISOString()
            const invoice: InvoiceJson = {
                invoice_id: invoiceId,
                created_at: now,
                business: businessName,
                customer: {
                    name: currentState.customer_name!,
                    address: currentState.address!,
                    phone: currentState.phone!,
                },
                product: reply,
                status: 'pending',
            }

            const summary = `Order created! Here's the summary:

**Order Summary**
• Customer: ${currentState.customer_name}
• Address: ${currentState.address}
• Phone: ${currentState.phone}
• Product: ${reply}
• Status: Pending

Invoice ID: ${invoiceId.slice(0, 8).toUpperCase()}`

            await sendBotMessage(summary)

            await supabase.from('orders').insert({
                business_id: businessId,
                conversation_id: conversationId,
                customer_name: currentState.customer_name!,
                address: currentState.address!,
                phone: currentState.phone!,
                product_name: reply,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                invoice_json: invoice as any,
                status: 'pending',
            })

            setBotState({ active: false, step: 0 })
            return true
        }

        return false
    }, [botState, sendBotMessage, businessId, businessName, conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

    return { botState, startOrderFlow, handleCustomerReply, isActive: botState.active }
}
