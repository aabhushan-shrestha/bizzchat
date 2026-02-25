import { Order, InvoiceJson } from '@/lib/types/database'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface OrderRowProps {
    order: Order
    onMarkDelivered: (id: string) => void
    onExpand: (order: Order) => void
    isExpanded: boolean
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

export function OrderRow({ order, onMarkDelivered, onExpand, isExpanded }: OrderRowProps) {
    const invoice = order.invoice_json as unknown as InvoiceJson

    return (
        <>
            <tr
                onClick={() => onExpand(order)}
                className={`border-b border-[#f0f0f0] hover:bg-[#fafafa] cursor-pointer transition-colors ${isExpanded ? 'bg-[#fafafa]' : ''}`}
            >
                <td className="px-4 py-3.5 text-xs font-mono text-[#6b7280]">
                    {order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-4 py-3.5 text-sm text-[#1a1a1a] font-medium">{order.customer_name}</td>
                <td className="px-4 py-3.5 text-sm text-[#1a1a1a]">{order.product_name}</td>
                <td className="px-4 py-3.5 text-sm text-[#6b7280] max-w-[140px] truncate">{order.address}</td>
                <td className="px-4 py-3.5 text-sm text-[#6b7280]">{order.phone}</td>
                <td className="px-4 py-3.5">
                    <Badge status={order.status} />
                </td>
                <td className="px-4 py-3.5 text-xs text-[#9ca3af]">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3.5">
                    {order.status === 'pending' ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onMarkDelivered(order.id) }}
                            className="whitespace-nowrap"
                        >
                            Mark Delivered
                        </Button>
                    ) : (
                        <span className="text-xs text-[#9ca3af]">Delivered</span>
                    )}
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-[#fafafa]">
                    <td colSpan={8} className="px-6 py-4">
                        <OrderPanel invoice={invoice} order={order} />
                    </td>
                </tr>
            )}
        </>
    )
}

function OrderPanel({ invoice, order }: { invoice: InvoiceJson; order: Order }) {
    const formData = order.form_response_json as Record<string, any> | null;

    return (
        <div className="bg-white border border-[#e5e5e5] rounded-xl p-5 animate-fade-in max-w-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#1a1a1a]">Invoice Details</h3>
                <Badge status={order.status} />
            </div>
            <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] mb-1">Invoice ID</p>
                        <p className="font-mono text-xs text-[#1a1a1a]">{invoice?.invoice_id?.slice(0, 16) || order.id.slice(0, 16)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] mb-1">Business</p>
                        <p className="text-[#1a1a1a]">{invoice?.business || '—'}</p>
                    </div>
                </div>
                <div className="border-t border-[#f0f0f0] pt-3">
                    <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] mb-2">Customer Details</p>
                    <div className="space-y-1">
                        <p className="text-[#1a1a1a]"><span className="text-[#6b7280]">Name:</span> {order.customer_name || '—'}</p>
                        <p className="text-[#1a1a1a]"><span className="text-[#6b7280]">Address:</span> {order.address || '—'}</p>
                        <p className="text-[#1a1a1a]"><span className="text-[#6b7280]">Phone:</span> {order.phone || '—'}</p>
                    </div>
                </div>
                {formData && Object.keys(formData).length > 0 && (
                    <div className="border-t border-[#f0f0f0] pt-3">
                        <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] mb-2">Form Responses</p>
                        <div className="space-y-2">
                            {Object.entries(formData).map(([key, value]) => (
                                <div key={key}>
                                    <p className="text-[#6b7280] text-xs capitalize">{key.replace(/_/g, ' ')}:</p>
                                    <p className="text-[#1a1a1a]">{String(value) || '—'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="border-t border-[#f0f0f0] pt-3">
                    <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] mb-1">Product</p>
                    <p className="text-[#1a1a1a] font-medium">{order.product_name}</p>
                </div>
                <div className="border-t border-[#f0f0f0] pt-3">
                    <p className="text-[10px] uppercase tracking-wide text-[#9ca3af] mb-1">Created</p>
                    <p className="text-[#6b7280] text-xs">{new Date(order.created_at).toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}
