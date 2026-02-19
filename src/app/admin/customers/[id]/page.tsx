"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Mail,
    Calendar,
    ShoppingBag,
    TrendingUp,
    Shield,
    MoreHorizontal,
    ExternalLink,
    MapPin,
    Clock,
    CreditCard,
    ChevronRight,
    Search,
    Filter
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

export default function AdminCustomerDetailPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.id as string

    const { data: user, isLoading, refetch } = api.admin.getUserById.useQuery({ id: userId })
    const updateUserStatus = api.admin.updateUserStatus.useMutation({
        onSuccess: () => refetch()
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white pt-40 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Synchronizing Client Archives...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-white pt-40 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 italic">Client <span className="text-gray-200">Not Found</span></h1>
                <Link href="/admin/customers">
                    <Button className="rounded-none bg-black text-white h-14 px-12 text-[10px] font-black uppercase tracking-widest">
                        Return to Matrix
                    </Button>
                </Link>
            </div>
        )
    }

    const totalSpent = user.orders.reduce((acc, order) => acc + order.total, 0)
    const avgOrderValue = user.orders.length > 0 ? totalSpent / user.orders.length : 0

    return (
        <div className="flex min-h-screen bg-white text-black">
            <main className="flex-grow p-10 lg:p-16 space-y-16 max-w-7xl">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-100 pb-12">
                    <div className="space-y-4">
                        <Link href="/admin/customers" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Client Matrix
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                            CLIENT <span className="text-gray-200">PROFILE</span>
                        </h1>
                        <div className="flex items-center gap-6 mt-4">
                            <div className="w-20 h-20 bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl font-black">
                                {user.name?.charAt(0) || "U"}
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black uppercase tracking-tight italic">{user.name || "UNIDENTIFIED OPERATIVE"}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="rounded-none border-gray-100 h-14 px-8 text-[10px] font-black uppercase tracking-widest hover:border-black transition-all">
                            Send Manual Email
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="rounded-none bg-black text-white h-14 px-10 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all border border-black">
                                    Administrative Actions
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none border-gray-100 shadow-2xl p-2 w-56">
                                <DropdownMenuItem
                                    className="text-[10px] font-black uppercase px-4 py-3 cursor-pointer"
                                    onClick={() => updateUserStatus.mutate({ userId: user.id, role: user.role === "ADMIN" ? "USER" : "ADMIN" })}
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Promote to {user.role === "ADMIN" ? "User" : "Admin"}
                                </DropdownMenuItem>
                                <Separator className="my-2 bg-gray-50" />
                                <DropdownMenuItem className="text-[10px] font-black uppercase px-4 py-3 cursor-pointer text-red-500 focus:text-red-500">
                                    Block Account
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Engagement Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: "LIFETIME VALUE", value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: TrendingUp },
                        { label: "TOTAL TRANSACTIONS", value: user.orders.length, icon: ShoppingBag },
                        { label: "AVG ORDER VALUE", value: `₹${avgOrderValue.toLocaleString('en-IN')}`, icon: CreditCard },
                        { label: "JOIN DATE", value: format(new Date(user.createdAt), "MMM yyyy"), icon: Clock },
                    ].map((stat) => (
                        <div key={stat.label} className="p-10 border border-gray-50 bg-gray-50/30 space-y-6">
                            <stat.icon className="w-4 h-4 text-gray-300" />
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">{stat.label}</p>
                                <p className="text-3xl font-black tracking-tighter tabular-nums">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Detailed Order History */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-8">
                            <h3 className="text-3xl font-black uppercase tracking-tight italic">Transaction Log</h3>
                            <div className="flex gap-4">
                                <button className="text-[8px] font-black uppercase tracking-widest text-black underline underline-offset-4">Full History</button>
                                <button className="text-[8px] font-black uppercase tracking-widest text-gray-300">Pending</button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {user.orders.length === 0 ? (
                                <div className="p-24 text-center border border-dashed border-gray-200">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">No transactions recorded for this operative.</p>
                                </div>
                            ) : user.orders.map((order) => (
                                <div key={order.id} className="border border-gray-50 p-8 hover:border-black transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-gray-300 tabular-nums">#{order.orderNumber.slice(-6)}</span>
                                                <div className={cn(
                                                    "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest leading-none border",
                                                    order.status === "DELIVERED" ? "border-black bg-black text-white" : "border-gray-200 text-gray-400"
                                                )}>
                                                    {order.status}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
                                                </p>
                                                <div className="flex gap-2 pt-2">
                                                    {order.items.map((item: any, i: number) => (
                                                        <div key={i} className="w-10 h-12 bg-gray-50 border border-gray-100 overflow-hidden grayscale hover:grayscale-0 transition-all">
                                                            {item.product.images?.[0] && <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Total Amount</p>
                                                <p className="text-2xl font-black tabular-nums tracking-tighter">₹{order.total.toLocaleString('en-IN')}</p>
                                            </div>
                                            <Link href={`/admin/orders/${order.id}`}>
                                                <Button variant="ghost" className="h-10 text-[9px] font-black uppercase tracking-widest gap-2 p-0 hover:bg-transparent hover:text-black">
                                                    View Details <ExternalLink className="w-3 h-3" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Metadata & Logistical Data */}
                    <div className="space-y-12">
                        <section className="p-10 border border-gray-100 bg-gray-50/20 space-y-10">
                            <h3 className="text-xl font-black uppercase tracking-tight border-b border-gray-100 pb-6 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Logistical Matrix
                            </h3>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Default Shipping Vector</p>
                                    {user.addresses.length > 0 ? (
                                        <div className="text-[11px] font-bold uppercase tracking-widest leading-loose">
                                            {user.addresses[0].street}<br />
                                            {user.addresses[0].city}, {user.addresses[0].state}<br />
                                            {user.addresses[0].zip}, {user.addresses[0].country}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] font-black uppercase text-gray-200">No addresses on record.</p>
                                    )}
                                </div>

                                <Separator className="bg-gray-100" />

                                <div className="space-y-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">User Identification</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                            <span className="text-gray-400">Database ID</span>
                                            <span className="tabular-nums opacity-40">{user.id.slice(0, 12)}...</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                            <span className="text-gray-400">Permissions</span>
                                            <span className="bg-black text-white px-2 py-0.5">{user.role}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                            <span className="text-gray-400">Marketing Opt-in</span>
                                            <span className={cn((user as any).isSubscribed ? "text-black" : "text-gray-300")}>
                                                {(user as any).isSubscribed ? "ACTIVE" : "OPT-OUT"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="p-10 bg-black text-white space-y-6">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Shield className="w-4 h-4" /> Administrative Disclaimer
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest leading-loose opacity-60 italic">
                                Modifying client data or blocking accounts is a restricted superuser action. Audit logs will record all changes made to this tactical profile.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
