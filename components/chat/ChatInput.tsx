'use client'

import { useRef, useState, KeyboardEvent } from 'react'

interface ChatInputProps {
    onSend: (content: string) => Promise<void>
    placeholder?: string
    disabled?: boolean
    role?: 'business' | 'customer'
}

export default function ChatInput({ onSend, placeholder = 'Message...', disabled, role }: ChatInputProps) {
    const [value, setValue] = useState('')
    const [sending, setSending] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    async function handleSend() {
        const trimmed = value.trim()
        if (!trimmed || sending) return
        setSending(true)
        setValue('')
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
        await onSend(trimmed)
        setSending(false)
        textareaRef.current?.focus()
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    function handleInput() {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }

    const isOrderTrigger = value.trim() === '/order'

    return (
        <div className="border-t border-[#e5e5e5] bg-white safe-bottom">
            {value.trim() === '/order' && role === 'business' && (
                <div className="px-4 py-2 border-b border-[#e5e5e5]">
                    <div className="flex items-center gap-2 text-xs text-[#7c3aed]">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                        </svg>
                        Send to start the order automation flow
                    </div>
                </div>
            )}
            <div className="flex items-end gap-3 px-4 py-3">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => { setValue(e.target.value); handleInput() }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || sending}
                    rows={1}
                    className="flex-1 resize-none bg-[#f4f4f4] rounded-2xl px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#9ca3af] border-none outline-none max-h-[120px] leading-relaxed transition-all focus:bg-[#eeeeee]"
                    style={{ height: 'auto', minHeight: '42px' }}
                />
                <button
                    onClick={handleSend}
                    disabled={!value.trim() || sending || disabled}
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 ${value.trim() && !sending && !disabled
                            ? 'bg-[#1a1a1a] text-white hover:bg-[#2d2d2d] scale-100'
                            : 'bg-[#e5e5e5] text-[#9ca3af] scale-95'
                        }`}
                >
                    {sending ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    )
}
