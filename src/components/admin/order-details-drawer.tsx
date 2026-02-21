"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    Sheet,
    SheetContent,
    SheetTitle
} from "@/components/ui/sheet"
import { format } from "date-fns"
import {
    MapPin, Mail, Phone, Package, Truck, Clock, Copy,
    CheckCircle2, X, Printer
} from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function OrderDetailsDrawer({
    orderId,
    open,
    onOpenChange
}: {
    orderId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { toast } = useToast()
    const utils = api.useUtils()

    const { data: order, isLoading } = api.admin.getOrderDetails.useQuery(
        { id: orderId! },
        { enabled: !!orderId && open }
    )

    const updateStatus = api.admin.updateOrderStatus.useMutation({
        onSuccess: () => {
            utils.admin.getOrderDetails.invalidate({ id: orderId! })
            utils.admin.getOrders.invalidate()
            toast({ title: "Status Updated", description: "Order status has been successfully updated." })
        }
    })

    const updateTracking = api.admin.updateOrderTracking.useMutation({
        onSuccess: () => {
            utils.admin.getOrderDetails.invalidate({ id: orderId! })
            toast({ title: "Tracking Saved", description: "Tracking information has been saved." })
        }
    })

    const [localTrackingNumber, setLocalTrackingNumber] = React.useState("")
    const [localTrackingUrl, setLocalTrackingUrl] = React.useState("")

    React.useEffect(() => {
        if (order) {
            setLocalTrackingNumber(order.trackingNumber || "")
            setLocalTrackingUrl(order.trackingUrl || "")
        }
    }, [order])

    if (!orderId) return null

    const handleCopyAddress = () => {
        if (!order?.shippingAddress) return
        const addr = order.shippingAddress as any
        const textToCopy = `${addr.firstName} ${addr.lastName}\n${addr.street}\n${addr.apartment ? addr.apartment + '\n' : ''}${addr.city}, ${addr.state} ${addr.pincode}\n${addr.country}\nPhone: ${addr.phone}`
        navigator.clipboard.writeText(textToCopy)
        toast({ title: "Address Copied", description: "Shipping address copied to clipboard." })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "DELIVERED": return "bg-black text-white"
            case "SHIPPED": return "bg-blue-50 text-blue-600 border-blue-200"
            case "CANCELLED": return "bg-red-50 text-red-600 border-red-200"
            default: return "bg-gray-100 text-black border-gray-200"
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 border-l border-gray-200 print:w-full print:max-w-none print:border-none print:shadow-none print:p-8">
                <VisuallyHidden>
                    <SheetTitle>Order Details</SheetTitle>
                </VisuallyHidden>
                {isLoading || !order ? (
                    <div className="flex items-center justify-center p-24 text-gray-500 font-bold uppercase text-xs tracking-widest gap-3 print:hidden">
                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                        Loading Order Details...
                    </div>
                ) : (
                    <div className="h-full w-full relative">
                        {/* 
                            --- PRINTER-ONLY COURIER SLIP ---
                            This section is entirely hidden on screen, but becomes the ONLY visible 
                            element when printing. It's styled like a real shipping label/packing slip.
                        */}
                        <div className="hidden print:block w-full text-black bg-white p-8">
                            {/* Slip Header */}
                            <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
                                <div>
                                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-1">LUXECHO</h1>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Packing Slip & Shipping Label</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black uppercase tracking-tight">#{order.orderNumber}</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">
                                        Date: {format(new Date(order.createdAt), "dd MMM yyyy")}
                                    </p>
                                </div>
                            </div>

                            {/* Addresses Grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                {/* FROM Address (Store) */}
                                <div className="border border-gray-300 p-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-2 mb-2">From (Sender)</h3>
                                    <p className="font-bold text-sm uppercase">Luxecho Operations</p>
                                    <div className="text-xs mt-1 space-y-0.5">
                                        <p>Warehouse Facility 4A</p>
                                        <p>Industrial Estate, Phase 1</p>
                                        <p>City, State, 100001</p>
                                        <p>India</p>
                                    </div>
                                </div>

                                {/* TO Address (Customer) */}
                                <div className="border-2 border-black p-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-black border-b border-black pb-2 mb-2">Ship To (Recipient)</h3>
                                    <p className="font-bold text-lg uppercase">
                                        {(order.shippingAddress as any)?.firstName} {(order.shippingAddress as any)?.lastName}
                                    </p>
                                    <div className="text-sm mt-1 space-y-0.5 font-medium">
                                        <p>{(order.shippingAddress as any)?.street}</p>
                                        {(order.shippingAddress as any)?.apartment && <p>{(order.shippingAddress as any)?.apartment}</p>}
                                        <p>{(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.state} {(order.shippingAddress as any)?.pincode}</p>
                                        <p>{(order.shippingAddress as any)?.country}</p>
                                        <p className="mt-2 font-bold flex items-center gap-1">
                                            <Phone className="w-3 h-3" /> {(order.shippingAddress as any)?.phone || "No phone provided"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tracking/Courier Block (If Shipped) */}
                            {order.status === "SHIPPED" && order.trackingNumber && (
                                <div className="mb-8 p-4 border-2 border-black bg-gray-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tracking Number</h3>
                                        <p className="text-2xl font-black tracking-widest uppercase">{order.trackingNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest">
                                            Priority Shipping
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Order Items Table */}
                            <div className="mb-8">
                                <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4">
                                    Included Items ({order.items.length})
                                </h3>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-300 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <th className="py-2 w-16">Item Code</th>
                                            <th className="py-2">Description</th>
                                            <th className="py-2 w-24">Variant</th>
                                            <th className="py-2 text-right w-16">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {order.items.map((item: any, i: number) => (
                                            <tr key={item.id} className="border-b border-gray-200">
                                                <td className="py-3 font-mono text-xs text-gray-500">
                                                    {item.product.id.substring(0, 8).toUpperCase()}
                                                </td>
                                                <td className="py-3 font-bold uppercase">{item.product.name}</td>
                                                <td className="py-3 text-xs uppercase tracking-widest text-gray-500">
                                                    {item.variant ? item.variant.optionValues?.map((ov: any) => ov.value).join(", ") : "N/A"}
                                                </td>
                                                <td className="py-3 text-right font-black text-lg">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Footer / Notes */}
                            <div className="border-t border-gray-300 pt-4 mt-auto">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
                                    Thank you for shopping with Luxecho. For returns or support, visit luxecho.com/support.
                                </p>
                            </div>
                        </div>

                        {/* 
                            --- SCREEN-ONLY DRAWER UI ---
                            This is the normal app UI that the admin sees. It hides completely when printed.
                        */}
                        <div className="flex flex-col min-h-full print:hidden">
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-6 md:p-8 shrink-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                                                #{order.orderNumber}
                                            </h2>
                                            <div className={cn("px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border", getStatusColor(order.status))}>
                                                {order.status}
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            Placed {format(new Date(order.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => window.print()} className="font-black uppercase text-[10px] tracking-widest gap-2">
                                            <Printer className="w-3.5 h-3.5" /> Print Slip
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="hover:bg-gray-100 rounded-full">
                                            <X className="w-5 h-5 text-gray-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="p-6 md:p-8 space-y-8 bg-gray-50/50 flex-grow">

                                {/* Status Control */}
                                <div className="bg-white border border-gray-200 p-6 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-black mb-4">Fulfillment Status</h3>
                                        <Select
                                            value={order.status}
                                            onValueChange={(val: any) => updateStatus.mutate({ id: order.id, status: val })}
                                        >
                                            <SelectTrigger className="w-full h-12 rounded-none border-gray-300 focus:ring-0 focus:border-black font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none border-black">
                                                <SelectItem value="PENDING" className="font-bold uppercase text-xs tracking-widest cursor-pointer">Pending</SelectItem>
                                                <SelectItem value="PROCESSING" className="font-bold uppercase text-xs tracking-widest cursor-pointer">Processing</SelectItem>
                                                <SelectItem value="SHIPPED" className="font-bold uppercase text-xs tracking-widest cursor-pointer">Shipped</SelectItem>
                                                <SelectItem value="DELIVERED" className="font-bold uppercase text-xs tracking-widest cursor-pointer">Delivered</SelectItem>
                                                <SelectItem value="CANCELLED" className="font-bold uppercase text-xs tracking-widest text-red-600 cursor-pointer">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {order.status === "SHIPPED" && (
                                        <div className="border-t border-gray-100 pt-6 space-y-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
                                                <Truck className="w-4 h-4" /> Tracking Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tracking Number</Label>
                                                    <Input
                                                        value={localTrackingNumber}
                                                        onChange={(e) => setLocalTrackingNumber(e.target.value)}
                                                        placeholder="e.g. AW123456789XX"
                                                        className="rounded-none border-gray-300 focus-visible:ring-0 focus:border-black"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tracking URL (Optional)</Label>
                                                    <Input
                                                        value={localTrackingUrl}
                                                        onChange={(e) => setLocalTrackingUrl(e.target.value)}
                                                        placeholder="https://..."
                                                        className="rounded-none border-gray-300 focus-visible:ring-0 focus:border-black"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => updateTracking.mutate({ id: order.id, trackingNumber: localTrackingNumber, trackingUrl: localTrackingUrl })}
                                                disabled={updateTracking.isPending}
                                                className="w-full h-10 rounded-none bg-black text-white hover:bg-gray-900 font-black uppercase tracking-widest text-[10px]"
                                            >
                                                {updateTracking.isPending ? "Saving..." : "Save Tracking Info"}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Customer Info */}
                                    <div className="bg-white border border-gray-200 p-6 space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2 border-b border-gray-100 pb-3">
                                            <MapPin className="w-4 h-4" /> Shipping Details
                                        </h3>
                                        <div className="space-y-3 text-sm font-medium text-gray-600">
                                            <p className="font-bold text-black text-base uppercase">
                                                {(order.shippingAddress as any)?.firstName} {(order.shippingAddress as any)?.lastName}
                                            </p>
                                            <p className="flex gap-2"><Mail className="w-4 h-4 shrink-0 text-gray-400" /> {order.email}</p>
                                            <p className="flex gap-2"><Phone className="w-4 h-4 shrink-0 text-gray-400" /> {(order.shippingAddress as any)?.phone || "No phone provided"}</p>

                                            <div className="pt-2">
                                                <p>{(order.shippingAddress as any)?.street}</p>
                                                {(order.shippingAddress as any)?.apartment && <p>{(order.shippingAddress as any)?.apartment}</p>}
                                                <p>{(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.state} {(order.shippingAddress as any)?.pincode}</p>
                                                <p>{(order.shippingAddress as any)?.country}</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleCopyAddress}
                                            variant="outline"
                                            className="w-full h-10 rounded-none border-gray-200 hover:border-black hover:bg-transparent font-black uppercase tracking-widest text-[10px] mt-2 gap-2"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copy Address
                                        </Button>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="bg-white border border-gray-200 p-6 space-y-4 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2 border-b border-gray-100 pb-3">
                                                <CheckCircle2 className="w-4 h-4" /> Payment: {order.paymentStatus}
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between font-medium text-gray-600">
                                                    <span>Subtotal</span>
                                                    <span>₹{order.subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-medium text-gray-600">
                                                    <span>Shipping</span>
                                                    <span>₹{order.shipping.toFixed(2)}</span>
                                                </div>
                                                {order.discount > 0 && (
                                                    <div className="flex justify-between font-medium text-green-600">
                                                        <span>Discount</span>
                                                        <span>-₹{order.discount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xl font-black pt-4 border-t border-gray-100">
                                            <span>TOTAL</span>
                                            <span>₹{order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="bg-white border border-gray-200 p-6 space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2 border-b border-gray-100 pb-3">
                                        <Package className="w-4 h-4" /> Order Items ({order.items.length})
                                    </h3>
                                    <div className="space-y-4">
                                        {order.items.map((item: any, i: number) => (
                                            <div key={item.id} className={cn("flex gap-4", i !== order.items.length - 1 && "border-b border-gray-100 pb-4")}>
                                                <div className="w-20 h-24 bg-gray-100 relative shrink-0">
                                                    {item.product.images?.[0]?.url ? (
                                                        <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-gray-400 uppercase tracking-widest text-center px-2">No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-grow flex flex-col justify-center space-y-1">
                                                    <p className="font-bold text-sm text-black line-clamp-2">{item.product.name}</p>
                                                    {item.variant && (
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                                                            {item.variant.optionValues?.map((ov: any) => ov.value).join(" • ")}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs font-black pt-1">
                                                        <span className="text-gray-400">QTY: {item.quantity}</span>
                                                        <span className="text-black">₹{item.price.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
