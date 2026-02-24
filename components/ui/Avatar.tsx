interface AvatarProps {
    name?: string | null
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

function getInitials(name?: string | null): string {
    if (!name) return '?'
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

function getAvatarColor(name?: string | null): string {
    if (!name) return '#e5e5e5'
    const colors = [
        '#fde68a', '#fca5a5', '#d8b4fe', '#6ee7b7',
        '#7dd3fc', '#fb923c', '#f0abfc', '#a3e635'
    ]
    const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return colors[sum % colors.length]
}

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
    const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-11 h-11 text-base' }
    const bg = getAvatarColor(name)

    return (
        <div
            className={`rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-[#1a1a1a] ${sizes[size]} ${className}`}
            style={{ backgroundColor: bg }}
        >
            {getInitials(name)}
        </div>
    )
}
