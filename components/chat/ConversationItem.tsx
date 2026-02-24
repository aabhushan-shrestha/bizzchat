import { ConversationWithDetails } from '@/lib/types/database'
import Avatar from '@/components/ui/Avatar'

interface ConversationItemProps {
    conversation: ConversationWithDetails
    isActive: boolean
    onClick: () => void
    role: 'business' | 'customer'
}

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (d > 0) return `${d}d`
    if (h > 0) return `${h}h`
    if (m > 0) return `${m}m`
    return 'now'
}

export default function ConversationItem({ conversation, isActive, onClick, role }: ConversationItemProps) {
    const displayName = role === 'business'
        ? (conversation.profiles?.full_name || conversation.profiles?.email || 'Customer')
        : (conversation.businesses?.business_name || 'Business')

    const preview = conversation.last_message
        ? conversation.last_message.length > 60
            ? conversation.last_message.slice(0, 60) + '...'
            : conversation.last_message
        : 'Start a conversation...'

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#f5f5f5] border-b border-[#f0f0f0] ${isActive ? 'bg-[#f0f0f0]' : ''
                }`}
        >
            <Avatar name={displayName} size="md" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-[#1a1a1a] truncate">{displayName}</span>
                    <span className="text-[10px] text-[#9ca3af] ml-2 flex-shrink-0">
                        {timeAgo(conversation.last_message_at || conversation.created_at)}
                    </span>
                </div>
                <p className="text-xs text-[#6b7280] truncate">{preview}</p>
            </div>
        </button>
    )
}
