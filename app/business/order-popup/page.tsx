'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useOrderFormConfig, FormField } from '@/lib/hooks/useOrderFormConfig'
import BusinessSidebar from '@/components/business/BusinessSidebar'
import { Business, Profile } from '@/lib/types/database'
import UserDropdown from '@/components/ui/UserDropdown'

export default function OrderPopupConfigPage() {
    const [business, setBusiness] = useState<Business | null>(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [draftFields, setDraftFields] = useState<FormField[]>([])
    const supabase = createClient()

    const [user, setUser] = useState<Profile | null>(null)

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

    const { fields, loading, saving, saveConfig } = useOrderFormConfig(business?.id)

    useEffect(() => {
        if (!loading) {
            setDraftFields(fields)
        }
    }, [fields, loading])

    const handleSave = async () => {
        const success = await saveConfig(draftFields)
        if (success) {
            alert('Form configuration saved!')
        }
    }

    const updateField = (index: number, changes: Partial<FormField>) => {
        const newFields = [...draftFields]
        newFields[index] = { ...newFields[index], ...changes }
        setDraftFields(newFields)
    }

    const addField = () => {
        if (draftFields.length >= 5) return
        setDraftFields([...draftFields, { key: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false }])
    }

    const removeField = (index: number) => {
        const newFields = [...draftFields]
        newFields.splice(index, 1)
        setDraftFields(newFields)
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
                <div className="bg-white border-b border-[#e5e5e5] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="md:hidden">
                            <UserDropdown name={user?.full_name || user?.email || business?.business_name} size="sm" position="bottom" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-[#1a1a1a]">Order Form</h1>
                            <p className="text-sm text-[#6b7280] mt-0.5 hidden sm:block">
                                Customize the fields customers fill out when ordering (max 5)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Form Builder content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="skeleton h-24 rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <>
                                {draftFields.map((field, index) => (
                                    <div key={index} className="bg-white border border-[#e5e5e5] rounded-xl p-4 shadow-sm flex items-start gap-4">
                                        {/* Drag Handle placeholder */}
                                        <div className="mt-2 text-[#d1d5db]">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                            </svg>
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-[#6b7280] mb-1">Field Name (Label)</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateField(index, { label: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded-md focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-[#6b7280] mb-1">Key (Internal Name)</label>
                                                <input
                                                    type="text"
                                                    value={field.key}
                                                    onChange={(e) => updateField(index, { key: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded-md focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-[#6b7280] mb-1">Input Type</label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateField(index, { type: e.target.value as any })}
                                                    className="w-full px-3 py-2 text-sm border border-[#e5e5e5] rounded-md focus:outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a]"
                                                >
                                                    <option value="text">Short Text</option>
                                                    <option value="textarea">Long Text</option>
                                                    <option value="tel">Phone</option>
                                                    <option value="number">Number</option>
                                                    <option value="email">Email</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center">
                                                <label className="flex items-center gap-2 cursor-pointer mt-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(index, { required: e.target.checked })}
                                                        className="w-4 h-4 text-[#1a1a1a] border-[#e5e5e5] rounded focus:ring-[#1a1a1a]"
                                                    />
                                                    <span className="text-sm font-medium text-[#1a1a1a]">Required Field</span>
                                                </label>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeField(index)}
                                            className="mt-2 text-[#9ca3af] hover:text-red-500 transition-colors"
                                            title="Remove field"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}

                                {draftFields.length < 5 && (
                                    <button
                                        onClick={addField}
                                        className="w-full py-4 border-2 border-dashed border-[#e5e5e5] rounded-xl text-[#6b7280] font-medium hover:border-[#1a1a1a] hover:text-[#1a1a1a] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Custom Field ({draftFields.length}/5)
                                    </button>
                                )}
                            </>
                        )}
                    </div>
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
                            href: '/business/orders', label: 'Orders', icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            )
                        },
                        {
                            href: '/business/order-popup', label: 'Order pop-up', active: true, icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
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
