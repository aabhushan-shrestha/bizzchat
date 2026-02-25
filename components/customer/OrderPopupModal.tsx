'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FormField } from '@/lib/hooks/useOrderFormConfig'

interface OrderPopupModalProps {
    isOpen: boolean
    businessId: string
    conversationId: string
    customerId: string
    onClose: () => void
    onSuccess: () => void
}

export default function OrderPopupModal({
    isOpen, businessId, conversationId, customerId, onClose, onSuccess
}: OrderPopupModalProps) {
    const [fields, setFields] = useState<FormField[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState<Record<string, string>>({})
    const supabase = createClient()

    useEffect(() => {
        if (!isOpen || !businessId) return

        async function fetchConfig() {
            setLoading(true)
            const { data, error } = await supabase
                .from('order_form_configs')
                .select('fields_json')
                .eq('business_id', businessId)
                .maybeSingle()

            if (!error && data?.fields_json) {
                const parsedFields = Array.isArray(data.fields_json) ? data.fields_json as unknown as FormField[] : []
                setFields(parsedFields)
                // Initialize form data state
                const initialData: Record<string, string> = {}
                parsedFields.forEach(f => {
                    initialData[f.key] = ''
                })
                setFormData(initialData)
            } else {
                // Default fallback if no config
                const defaultFields: FormField[] = [
                    { key: 'full_name', label: 'Full Name', type: 'text', required: true },
                    { key: 'address', label: 'Delivery Address', type: 'textarea', required: true },
                    { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
                    { key: 'product', label: 'Product Name', type: 'text', required: true },
                    { key: 'note', label: 'Note', type: 'text', required: false }
                ]
                setFields(defaultFields)
                const initialData: Record<string, string> = {}
                defaultFields.forEach(f => {
                    initialData[f.key] = ''
                })
                setFormData(initialData)
            }
            setLoading(false)
        }

        fetchConfig()
    }, [isOpen, businessId])

    if (!isOpen) return null

    const handleInputChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        // Try to map default values for backwards compatibility
        const customerName = formData['full_name'] || formData['name'] || ''
        const address = formData['address'] || ''
        const phone = formData['phone'] || ''
        const productName = formData['product'] || formData['product_name'] || ''

        const { error } = await supabase.from('orders').insert({
            business_id: businessId,
            conversation_id: conversationId,
            customer_id: customerId,
            customer_name: customerName,
            address: address,
            phone: phone,
            product_name: productName,
            form_response_json: formData,
            status: 'pending'
        })

        setSubmitting(false)

        if (!error) {
            onSuccess()
            onClose()
        } else {
            alert('Failed to place order. Please try again.')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-semibold text-[#1a1a1a]">Place Order</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-[#9ca3af] hover:text-[#1a1a1a] rounded-full hover:bg-[#f0f0f0] transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="skeleton h-4 w-24"></div>
                                    <div className="skeleton h-10 w-full rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <form id="orderForm" onSubmit={handleSubmit} className="space-y-4">
                            {fields.map((field) => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            required={field.required}
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] min-h-[80px]"
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            value={formData[field.key] || ''}
                                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded-lg focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]"
                                            placeholder={`Enter ${field.label.toLowerCase()}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </form>
                    )}
                </div>

                <div className="p-4 border-t border-[#e5e5e5] bg-[#fafafa] flex gap-3 sticky bottom-0 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-white border border-[#e5e5e5] text-[#1a1a1a] font-medium text-sm rounded-xl hover:bg-[#f0f0f0] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="orderForm"
                        disabled={submitting || loading}
                        className="flex-1 px-4 py-2.5 bg-[#1a1a1a] text-white font-medium text-sm rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Placing Order...' : 'Confirm Order'}
                    </button>
                </div>
            </div>
        </div>
    )
}
