"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    Package,
    ChevronRight,
    ArrowLeft,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle,
    ArrowRight,
    Undo2,
    Ban,
    ExternalLink,
    Info
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { AuthPortal } from "@/components/auth/auth-portal"

export default function OrdersPage() {
    const { data: session, status } = useSession()
    const { data: orders, isLoading } = api.account.getOrders.useQuery(undefined, {
        enabled: !!session,
    })

    if (status === "loading" || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-2 border-gray-100 border-t-black rounded-full animate-spin" />
            </div>
        )
    }

    if (!session) {
        return <AuthPortal isPopup />
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "DELIVERED": return <CheckCircle2 className="w-3 h-3" />
            case "SHIPPED": return <Truck className="w-3 h-3" />
            case "PROCESSING": return <Clock className="w-3 h-3" />
            case "CANCEL_REQUESTED": return <Ban className="w-3 h-3" />
            case "RETURN_REQUESTED": return <Undo2 className="w-3 h-3" />
            case "CANCELLED": return <Ban className="w-3 h-3" />
            default: return <AlertCircle className="w-3 h-3" />
        }
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "DELIVERED": return "bg-green-50 text-green-700 border-green-100"
            case "SHIPPED": return "bg-blue-50 text-blue-700 border-blue-100"
            case "PROCESSING": return "bg-amber-50 text-amber-700 border-amber-100"
            case "CANCEL_REQUESTED":
            case "RETURN_REQUESTED": return "bg-orange-50 text-orange-700 border-orange-100"
            case "CANCELLED": return "bg-red-50 text-red-700 border-red-100"
            default: return "bg-gray-50 text-gray-700 border-gray-100"
        }
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-black">
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <div className="mb-12 space-y-4">
                    <Link href="/account" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Order <span className="text-gray-400">History</span></h1>
                </div>

                {!orders || orders.length === 0 ? (
                    <div className="py-24 text-center border-4 border-dashed border-gray-100 bg-white italic">
                        <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-400">No Orders Yet</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mt-2 italic">You haven't placed any orders with us yet.</p>
                        <Link href="/products">
                            <Button className="mt-8 bg-black text-white hover:bg-gray-800 rounded-none h-12 px-8 text-xs font-bold uppercase tracking-widest">Shop Collection</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order: any) => (
                            <div key={order.id} className="bg-white border border-gray-100 hover:border-black transition-all group overflow-hidden shadow-sm hover:shadow-md italic">
                                {/* Order Header */}
                                <div className="bg-gray-50/50 p-6 border-b border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 w-full">
                                        <div className="space-y-1">
                                            <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Order Number</p>
                                            <p className="text-[13px] font-black uppercase tracking-tight">#{order.orderNumber}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Date Placed</p>
                                            <p className="text-[13px] font-black uppercase tracking-tight">{format(new Date(order.createdAt), "MMM dd, yyyy")}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400">Total Amount</p>
                                            <p className="text-[13px] font-black uppercase tracking-tight">₹{order.total.toFixed(2)}</p>
                                        </div>
                                        <div className="space-y-1 flex flex-col items-start lg:items-end">
                                            <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400 lg:text-right">Status</p>
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest border shadow-sm",
                                                getStatusStyles(order.status)
                                            )}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items & Action */}
                                <div className="p-8 flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8">
                                    <div className="flex -space-x-4 overflow-hidden self-start">
                                        {order.items.map((item: any, idx: number) => (
                                            <div
                                                key={item.id}
                                                className="relative w-20 aspect-[3/4] bg-gray-50 border border-white ring-4 ring-white shadow-sm transition-transform group-hover:translate-y-[-4px]"
                                                style={{ zIndex: 10 - idx }}
                                            >
                                                {item.product.images[0] && (
                                                    <Image
                                                        src={item.product.images[0].url}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                                {item.quantity > 1 && (
                                                    <div className="absolute -bottom-1 -right-1 bg-black text-white text-[8px] font-bold px-1.5 py-0.5 z-20">
                                                        x{item.quantity}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action & Tracking Section */}
                                    <div className="w-full lg:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-6">
                                        {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                                            <>
                                                {/* Tracking Info Box */}
                                                <div className="flex-1 min-w-[240px] border border-black p-5 flex flex-col gap-3 group/track relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/track:opacity-20 transition-opacity">
                                                        <Truck className="w-8 h-8" />
                                                    </div>

                                                    <div className="relative z-10">
                                                        <p className="text-[8px] uppercase font-black text-gray-400 tracking-[0.2em] mb-1.5">Shipment Logistics</p>
                                                        <div className="flex flex-col gap-2.5">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                <span className="text-[11px] font-black uppercase font-mono tracking-tighter text-black truncate max-w-[200px]">
                                                                    TRACKING ID: {order.trackingNumber || "RESERVED"}
                                                                </span>
                                                                {order.trackingUrl ? (
                                                                    <a
                                                                        href={order.trackingUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] font-black uppercase bg-black text-white px-3 py-1.5 flex items-center gap-2 hover:bg-gray-800 transition-colors w-fit shadow-sm"
                                                                    >
                                                                        Follow Shipment <ExternalLink className="w-2.5 h-2.5" />
                                                                    </a>
                                                                ) : (
                                                                    <div className="text-[9px] font-black uppercase text-gray-300 italic flex items-center gap-1">
                                                                        <Clock className="w-2.5 h-2.5" /> Awaiting Link
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <ReturnRequestButton orderId={order.id} orderNumber={order.orderNumber} />
                                                </div>
                                            </>
                                        )}

                                        {(order.status === "PENDING" || order.status === "PROCESSING") && (
                                            <CancelRequestButton orderId={order.id} orderNumber={order.orderNumber} />
                                        )}

                                        {(order.status === "CANCEL_REQUESTED" || order.status === "RETURN_REQUESTED" || order.status === "CANCELLED") && (
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 px-6 py-4 italic">
                                                <Info className="w-3 h-3" /> Action Logged
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function CancelRequestButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [reason, setReason] = React.useState("")
    const utils = api.useUtils()
    const requestCancellation = api.checkout.requestCancellation.useMutation({
        onSuccess: () => {
            utils.account.getOrders.invalidate()
            setIsOpen(false)
        }
    })

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="w-full md:w-auto rounded-none border-gray-200 hover:border-red-500 hover:text-red-500 hover:bg-red-50/50 uppercase font-black text-[10px] tracking-widest h-12 px-8 transition-all flex items-center gap-2 group"
            >
                <Ban className="w-3 h-3 text-gray-400 group-hover:text-red-500" /> Request Cancellation
            </Button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 italic">
                    <div className="bg-white w-full max-w-lg p-10 space-y-8 animate-in fade-in zoom-in duration-300">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black uppercase tracking-tighter">Request <span className="text-gray-400">Cancellation</span></h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Order #{orderNumber}</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black">Reason for Cancellation</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="E.G. CHANGED MY MIND, BOUGHT BY MISTAKE..."
                                className="w-full bg-gray-50 border-none p-5 h-32 text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-black outline-none placeholder:text-gray-200 resize-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 h-16 rounded-none border border-gray-100 text-[10px] font-black uppercase tracking-widest"
                            >
                                Nevermind
                            </Button>
                            <Button
                                disabled={!reason || requestCancellation.isPending}
                                onClick={() => requestCancellation.mutate({ orderId, reason })}
                                className="flex-1 h-16 rounded-none bg-black text-white hover:bg-gray-800 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                                {requestCancellation.isPending ? "Submitting..." : "Submit Request"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function ReturnRequestButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [reason, setReason] = React.useState("")
    const utils = api.useUtils()
    const requestReturn = api.checkout.requestReturn.useMutation({
        onSuccess: () => {
            utils.account.getOrders.invalidate()
            setIsOpen(false)
        }
    })

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="w-full md:w-auto rounded-none border-gray-200 hover:border-black hover:bg-gray-50 uppercase font-black text-[10px] tracking-widest h-12 px-8 transition-all flex items-center gap-2 group"
            >
                <Undo2 className="w-3 h-3 text-gray-400 group-hover:text-black" /> Request Return
            </Button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 italic">
                    <div className="bg-white w-full max-w-lg p-10 space-y-8 animate-in fade-in zoom-in duration-300">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black uppercase tracking-tighter">Request <span className="text-gray-400">Return</span></h3>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Order #{orderNumber}</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black">Reason for Return</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="E.G. SIZE DOESN'T FIT, ITEM DAMAGED, NOT AS DESCRIBED..."
                                className="w-full bg-gray-50 border-none p-5 h-32 text-xs font-bold uppercase tracking-widest focus:ring-1 focus:ring-black outline-none placeholder:text-gray-200 resize-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 h-16 rounded-none border border-gray-100 text-[10px] font-black uppercase tracking-widest"
                            >
                                Nevermind
                            </Button>
                            <Button
                                disabled={!reason || requestReturn.isPending}
                                onClick={() => requestReturn.mutate({ orderId, reason })}
                                className="flex-1 h-16 rounded-none bg-black text-white hover:bg-gray-800 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                            >
                                {requestReturn.isPending ? "Submitting..." : "Submit Request"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
