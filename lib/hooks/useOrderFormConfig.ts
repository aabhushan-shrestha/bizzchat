import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Json } from '@/lib/types/database'

export type FormField = {
    key: string
    label: string
    type: 'text' | 'textarea' | 'tel' | 'number' | 'email'
    required: boolean
}

export function useOrderFormConfig(businessId: string | undefined) {
    const [fields, setFields] = useState<FormField[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (!businessId) {
            setLoading(false)
            return
        }

        async function fetchConfig() {
            setLoading(true)
            const { data, error } = await supabase
                .from('order_form_configs')
                .select('fields_json')
                .eq('business_id', businessId)
                .maybeSingle()

            if (!error && data?.fields_json) {
                // Ensure it's an array
                const parsedFields = Array.isArray(data.fields_json) ? data.fields_json as unknown as FormField[] : []
                setFields(parsedFields)
            } else {
                // Default fallback if no config
                setFields([
                    { key: 'full_name', label: 'Full Name', type: 'text', required: true },
                    { key: 'address', label: 'Delivery Address', type: 'textarea', required: true },
                    { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
                    { key: 'product', label: 'Product Name', type: 'text', required: true },
                    { key: 'note', label: 'Note', type: 'text', required: false }
                ])
            }
            setLoading(false)
        }

        fetchConfig()
    }, [businessId])

    async function saveConfig(newFields: FormField[]) {
        if (!businessId) return false
        setSaving(true)

        const { error } = await supabase
            .from('order_form_configs')
            .upsert(
                {
                    business_id: businessId,
                    fields_json: newFields as unknown as Json,
                    updated_at: new Date().toISOString()
                },
                { onConflict: 'business_id' }
            )

        setSaving(false)
        if (!error) {
            setFields(newFields)
            return true
        }
        console.error('Failed to save config:', error)
        return false
    }

    return { fields, loading, saving, saveConfig }
}
