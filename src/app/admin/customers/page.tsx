"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useToast } from "@/hooks/use-toast"
import {
    Users,
    ArrowLeft,
    Search,
    Shield,
    MoreHorizontal,
    Mail,
    ShoppingBag,
    X
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function AdminCustomersPage() {
    const { toast } = useToast()
    const { data: users, isLoading, refetch } = api.admin.getUsers.useQuery({})
    const sendBulkEmail = api.admin.sendMarketingBlast.useMutation({
        onSuccess: (data) => {
            toast({
                title: "CAMPAIGN DEPLOYED",
                description: `Successfully transmitted to ${data.sentCount} operatives.`,
            })
            setIsMailDrawerOpen(false)
            setSelectedUserIds([])
        }
    })

    const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([])
    const [isMailDrawerOpen, setIsMailDrawerOpen] = React.useState(false)
    const [emailSubject, setEmailSubject] = React.useState("")
    const [emailBody, setEmailBody] = React.useState("")

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const toggleAllSelections = () => {
        if (selectedUserIds.length === (users?.length || 0)) {
            setSelectedUserIds([])
        } else {
            setSelectedUserIds(users?.map(u => u.id) || [])
        }
    }

    const handleSendBulk = () => {
        if (!emailSubject || !emailBody) return
        sendBulkEmail.mutate({
            subject: emailSubject,
            body: emailBody
        })
    }

    return (
        <div className="flex min-h-screen bg-white text-black">
            <main className="flex-grow p-10 lg:p-16 space-y-16 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-gray-100 pb-10">
                    <div className="space-y-4">
                        <Link href="/admin" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all group">
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            Back to Center
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-black">
                            CUSTOMER <span className="text-gray-200">RELATIONS</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        {selectedUserIds.length > 0 && (
                            <Button
                                onClick={() => setIsMailDrawerOpen(true)}
                                className="bg-black text-white font-black uppercase rounded-none h-16 px-12 text-[11px] tracking-widest hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[8px_8px_0px_#f3f4f6] hover:shadow-none border border-black"
                            >
                                <Mail className="w-4 h-4 mr-3" /> Mass Mail ({selectedUserIds.length})
                            </Button>
                        )}
                    </div>
                </header>

                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <Input
                        placeholder="SEARCH OPERATIVES BY DESIGNATION OR ALIAS..."
                        className="bg-gray-50 border-none rounded-none h-16 pl-14 font-black uppercase text-[10px] tracking-widest focus-visible:ring-1 focus-visible:ring-black"
                    />
                </div>

                <div className="border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <th className="p-8 w-24 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Checkbox
                                            checked={selectedUserIds.length === (users?.length || 0) && (users?.length || 0) > 0}
                                            onCheckedChange={toggleAllSelections}
                                            className="h-6 w-6 border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white transition-all shadow-sm"
                                        />
                                        <span className="text-[8px] font-black opacity-40">SELECT ALL</span>
                                    </div>
                                </th>
                                <th className="p-8">OPERATIVE</th>
                                <th className="p-8">STATUS</th>
                                <th className="p-8">ENGAGEMENT</th>
                                <th className="p-8">TOTAL VALUE</th>
                                <th className="p-8 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-24 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">SYNCHRONIZING CUSTOMER LEDGER...</td></tr>
                            ) : users?.map((user: any) => (
                                <tr key={user.id} className={cn(
                                    "transition-colors group",
                                    selectedUserIds.includes(user.id) ? "bg-gray-50/50" : "hover:bg-gray-50"
                                )}>
                                    <td className="p-8 text-center align-middle">
                                        <Checkbox
                                            checked={selectedUserIds.includes(user.id)}
                                            onCheckedChange={() => toggleUserSelection(user.id)}
                                            className="h-6 w-6 border-2 border-black/40 group-hover:border-black data-[state=checked]:bg-black data-[state=checked]:text-white transition-all shadow-sm mx-auto"
                                        />
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-gray-100 border border-gray-100 relative overflow-hidden flex items-center justify-center">
                                                {user.image ? (
                                                    <img src={user.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                ) : (
                                                    <Users className="w-5 h-5 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black uppercase text-sm tracking-tight group-hover:translate-x-1 transition-transform">{user.name || "UNIDENTIFIED"}</p>
                                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className={cn(
                                            "px-3 py-1 text-[8px] font-black uppercase border w-fit",
                                            user.role === "ADMIN" ? "border-black bg-black text-white" : "border-gray-200 text-gray-400"
                                        )}>
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            <ShoppingBag className="w-3 h-3" />
                                            {user.orderCount} ORDERS
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="space-y-1">
                                            <p className="font-black uppercase text-sm tracking-tighter">₹{user.totalSpent?.toFixed(2) || "0.00"}</p>
                                            <p className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">ACCUMULATED VALUE</p>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-black hover:text-white rounded-none">
                                                <Shield className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-black hover:text-white rounded-none">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Mass Mailer Command Center */}
            <Dialog open={isMailDrawerOpen} onOpenChange={setIsMailDrawerOpen}>
                <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] bg-white border-none p-0 overflow-y-auto rounded-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                    <div className="flex flex-col">
                        {/* Status Bar */}
                        <div className="bg-black text-white px-8 py-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Transmission Active</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Protocol: CRM-7A</span>
                        </div>

                        <div className="p-8 lg:p-16 space-y-12">
                            {/* Header Section */}
                            <header className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black leading-none">
                                            CATALOG <span className="text-gray-200">COMMUNIQUE</span>
                                        </h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
                                            Deploying manuscript to {selectedUserIds.length} target operatives
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsMailDrawerOpen(false)}
                                        className="h-12 w-12 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </Button>
                                </div>
                            </header>

                            {/* Main Input Flow */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-12">
                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Subject Line</Label>
                                        <Input
                                            placeholder="E.G. EXCLUSIVE SEASONAL ACCESS"
                                            value={emailSubject}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailSubject(e.target.value.toUpperCase())}
                                            className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black text-sm tracking-widest px-6"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Manuscript Body</Label>
                                        <Textarea
                                            placeholder="DRAFT YOUR OFFICIAL TRANSMISSION HERE..."
                                            value={emailBody}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailBody(e.target.value)}
                                            className="min-h-[350px] bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none p-8 font-medium text-base leading-relaxed placeholder:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Sidebar Intel */}
                                <div className="space-y-8">
                                    <div className="bg-gray-50 p-8 border border-gray-100">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-black border-b border-gray-200 pb-4 mb-6">Target Intel</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <span className="text-3xl font-black tabular-nums">{selectedUserIds.length}</span>
                                                <span className="text-[10px] font-black uppercase text-gray-400 mb-1">Recipients</span>
                                            </div>
                                            <div className="h-[1px] w-full bg-gray-200" />
                                            <div className="space-y-2">
                                                {users?.filter(u => selectedUserIds.includes(u.id)).slice(0, 5).map(u => (
                                                    <p key={u.id} className="text-[10px] font-bold uppercase text-gray-500 truncate">
                                                        {u.name || (u.email ? u.email.split('@')[0] : "OPERATIVE")}
                                                    </p>
                                                ))}
                                                {selectedUserIds.length > 5 && (
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest pt-2">
                                                        + {selectedUserIds.length - 5} ADDITIONAL
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-black/5 p-6 border-l-2 border-black">
                                            <p className="text-[9px] font-bold text-gray-400 leading-relaxed uppercase">
                                                Finalizing this deployment will transmit the communique to all selected accounts. Protocol adherence is mandatory.
                                            </p>
                                        </div>

                                        <Button
                                            className="w-full bg-black text-white font-black uppercase h-20 rounded-none tracking-widest text-xs hover:bg-gray-900 transition-all border border-black shadow-[6px_6px_0px_rgba(0,0,0,0.1)] active:shadow-none translate-x-0 active:translate-x-1 active:translate-y-1"
                                            disabled={!emailSubject || !emailBody || sendBulkEmail.isPending}
                                            onClick={handleSendBulk}
                                        >
                                            {sendBulkEmail.isPending ? "TRANSMITTING..." : "DEPLOY CAMPAIGN"}
                                        </Button>

                                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 text-center">
                                            Security Level: Admin Restricted
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
