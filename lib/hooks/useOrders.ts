'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/lib/types/database'

export function useOrders(businessId: string | null) {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchOrders = useCallback(async () => {
        if (!businessId) return
        setLoading(true)
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false })

        setOrders((data as Order[]) || [])
        setLoading(false)
    }, [businessId]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    async function markDelivered(orderId: string) {
        await supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', orderId)
        setOrders((prev: Order[]) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' as const } : o))
        )
    }

    return { orders, loading, markDelivered, refetch: fetchOrders }
}
