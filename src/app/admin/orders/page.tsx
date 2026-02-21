"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    Search,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    ArrowLeft,
    Filter
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { OrderDetailsDrawer } from "@/components/admin/order-details-drawer"

export default function AdminOrdersPage() {
    const [search, setSearch] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
    const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null)

    const { data: orders, isLoading } = api.admin.getOrders.useQuery({ take: 50 })

    const filteredOrders = React.useMemo(() => {
        if (!orders) return []
        let filtered = orders

        if (statusFilter !== "ALL") {
            filtered = filtered.filter((o: any) => o.status === statusFilter)
        }

        if (search.trim()) {
            const lowerSearch = search.toLowerCase()
            filtered = filtered.filter((o: any) =>
                o.orderNumber?.toLowerCase().includes(lowerSearch) ||
                o.email?.toLowerCase().includes(lowerSearch) ||
                o.user?.name?.toLowerCase().includes(lowerSearch) ||
                o.items?.some((item: any) =>
                    item?.product?.id?.toLowerCase().includes(lowerSearch) ||
                    item?.product?.name?.toLowerCase().includes(lowerSearch)
                )
            )
        }

        return filtered
    }, [orders, search, statusFilter])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "DELIVERED": return <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            case "SHIPPED": return <Truck className="w-3.5 h-3.5 text-black" />
            case "PROCESSING": return <Clock className="w-3.5 h-3.5 text-gray-500" />
            case "CANCELLED": return <XCircle className="w-3.5 h-3.5 text-red-600" />
            default: return <Clock className="w-3.5 h-3.5 text-gray-500" />
        }
    }

    return (
        <main className="p-8 md:p-12 space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
                <div className="space-y-3">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-5xl font-black uppercase tracking-tight text-black">Order History</h1>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by order ID, name, or email..."
                        className="rounded-none border-gray-300 focus-visible:ring-0 focus:border-black h-12 pl-12 font-medium"
                    />
                </div>
                <div className="w-full md:w-64">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full h-12 rounded-none border-gray-300 focus:ring-0 focus:border-black text-xs font-black uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-gray-400" />
                                <SelectValue placeholder="Filter by status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-black">
                            <SelectItem value="ALL" className="text-xs font-black uppercase tracking-widest cursor-pointer">All Orders</SelectItem>
                            <SelectItem value="PENDING" className="text-xs font-black uppercase tracking-widest cursor-pointer">Pending</SelectItem>
                            <SelectItem value="PROCESSING" className="text-xs font-black uppercase tracking-widest cursor-pointer">Processing</SelectItem>
                            <SelectItem value="SHIPPED" className="text-xs font-black uppercase tracking-widest cursor-pointer">Shipped</SelectItem>
                            <SelectItem value="DELIVERED" className="text-xs font-black uppercase tracking-widest cursor-pointer">Delivered</SelectItem>
                            <SelectItem value="CANCELLED" className="text-xs font-black uppercase tracking-widest cursor-pointer text-red-600">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border border-gray-200 overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-200">
                                <th className="p-4 md:p-6">Order ID</th>
                                <th className="p-4 md:p-6">Customer</th>
                                <th className="p-4 md:p-6">Date</th>
                                <th className="p-4 md:p-6">Total</th>
                                <th className="p-4 md:p-6">Status</th>
                                <th className="p-4 md:p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-24 text-center">
                                        <div className="flex items-center justify-center gap-3 text-gray-400 font-bold uppercase text-xs">
                                            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                            Loading orders...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-24 text-center border-dashed border-gray-300 bg-gray-50">
                                        <div className="space-y-4">
                                            <Search className="w-10 h-10 text-gray-300 mx-auto" strokeWidth={1} />
                                            <div>
                                                <p className="font-black uppercase tracking-widest text-black">No orders found</p>
                                                <p className="text-xs font-medium text-gray-500 mt-1">Try adjusting your search or filters.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders?.map((order: any) => (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 md:p-6">
                                            <span className="font-black tabular-nums tracking-wider uppercase text-black">
                                                #{order.orderNumber}
                                            </span>
                                        </td>
                                        <td className="p-4 md:p-6">
                                            <div className="flex flex-col">
                                                <span className="font-black uppercase text-xs text-black">{order.user?.name || "GUEST"}</span>
                                                <span className="text-[10px] font-medium text-gray-500 tracking-wide">{order.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-6 font-bold text-xs uppercase tracking-widest text-gray-600">
                                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                        </td>
                                        <td className="p-4 md:p-6 font-black tabular-nums text-black">
                                            ₹{order.total.toFixed(2)}
                                        </td>
                                        <td className="p-4 md:p-6">
                                            <div className={cn(
                                                "flex items-center gap-2 px-3 py-1 text-[9px] font-black uppercase tracking-widest w-fit rounded-full",
                                                order.status === "DELIVERED" ? "bg-black text-white" :
                                                    order.status === "CANCELLED" ? "bg-red-50 text-red-600" :
                                                        "bg-gray-100 text-black border border-gray-200"
                                            )}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </div>
                                        </td>
                                        <td className="p-4 md:p-6 text-right">
                                            <Button
                                                onClick={() => setSelectedOrderId(order.id)}
                                                variant="outline"
                                                className="h-9 px-4 rounded-none border-gray-300 hover:border-black hover:bg-transparent font-black uppercase text-[10px] tracking-widest gap-2 text-black"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailsDrawer
                orderId={selectedOrderId}
                open={!!selectedOrderId}
                onOpenChange={(open) => !open && setSelectedOrderId(null)}
            />
        </main>
    )
}
