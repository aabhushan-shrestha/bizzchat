import { MessageWithSender } from '@/lib/types/database'
import { BOT_SENDER_ID } from '@/lib/hooks/useOrderBot'

interface MessageBubbleProps {
    message: MessageWithSender
    currentUserId: string
    isBusinessSender: boolean
}

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, currentUserId, isBusinessSender }: MessageBubbleProps) {
    const isOwn = message.sender_id === currentUserId
    const isBot = message.is_bot || message.sender_id === BOT_SENDER_ID

    // Parse markdown-like bold for bot messages
    function renderContent(content: string) {
        const parts = content.split(/\*\*(.*?)\*\*/g)
        return parts.map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
        )
    }

    if (isBot) {
        return (
            <div className="flex items-start gap-2 animate-slide-up">
                <div className="w-7 h-7 rounded-full bg-[#e8e0ff] flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#7c3aed]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                </div>
                <div className="max-w-[80%]">
                    <div className="bubble-bot px-4 py-3 text-sm whitespace-pre-line leading-relaxed">
                        {renderContent(message.content)}
                    </div>
                    <p className="text-[10px] text-[#9ca3af] mt-1 ml-1">Bot • {formatTime(message.created_at)}</p>
                </div>
            </div>
        )
    }

    if (isOwn) {
        return (
            <div className="flex items-end justify-end gap-2 animate-slide-up">
                <div className="max-w-[80%]">
                    <div className="bubble-business px-4 py-3 text-sm whitespace-pre-line leading-relaxed ml-auto w-fit">
                        {message.content}
                    </div>
                    <p className="text-[10px] text-[#9ca3af] mt-1 text-right mr-1">{formatTime(message.created_at)}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-start gap-2 animate-slide-up">
            <div className="w-7 h-7 rounded-full bg-[#e5e5e5] flex items-center justify-center text-[11px] font-semibold text-[#1a1a1a] flex-shrink-0">
                {(message.profiles?.full_name || 'U')[0].toUpperCase()}
            </div>
            <div className="max-w-[80%]">
                <div className="bubble-customer px-4 py-3 text-sm whitespace-pre-line leading-relaxed">
                    {message.content}
                </div>
                <p className="text-[10px] text-[#9ca3af] mt-1 ml-1">{formatTime(message.created_at)}</p>
            </div>
        </div>
    )
}
