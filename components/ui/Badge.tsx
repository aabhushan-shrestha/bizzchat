interface BadgeProps {
    status: 'pending' | 'delivered'
    className?: string
}

export default function Badge({ status, className = '' }: BadgeProps) {
    const styles = {
        pending: 'status-pending',
        delivered: 'status-delivered',
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]} ${className}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'pending' ? 'bg-yellow-600' : 'bg-green-600'}`} />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}
