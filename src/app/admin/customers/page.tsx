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
    ShoppingBag
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
                                            <p className="font-black uppercase text-sm tracking-tighter">${user.totalSpent?.toFixed(2) || "0.00"}</p>
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

            {/* Mass Mailer Dialog */}
            <Dialog open={isMailDrawerOpen} onOpenChange={setIsMailDrawerOpen}>
                <DialogContent className="rounded-none bg-white border-none p-12 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-black">
                            MASS <span className="text-gray-200">MAILER</span>
                        </DialogTitle>
                        <DialogDescription className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-bold mb-8">
                            Transmitting official communique to {selectedUserIds.length} protocol recipients.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Recipient Segment Preview */}
                    <div className="bg-gray-50 p-6 flex flex-wrap gap-2 border border-gray-100 mb-8">
                        {users?.filter(u => selectedUserIds.includes(u.id)).slice(0, 5).map(u => (
                            <div key={u.id} className="bg-black text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest leading-none">
                                {u.name || (u.email ? u.email.split('@')[0] : "ANONYMOUS")}
                            </div>
                        ))}
                        {selectedUserIds.length > 5 && (
                            <div className="bg-gray-200 text-black px-3 py-1 text-[8px] font-black uppercase tracking-widest leading-none">
                                + {selectedUserIds.length - 5} OTHERS
                            </div>
                        )}
                    </div>

                    <div className="space-y-10 py-10">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-black ml-1">Communique Subject</Label>
                            <Input
                                placeholder="E.G. EXCLUSIVE SEASONAL ACCESS"
                                value={emailSubject}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailSubject(e.target.value.toUpperCase())}
                                className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black text-xs tracking-widest"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-black ml-1">Manuscript Body</Label>
                            <Textarea
                                placeholder="DRAFT YOUR TRANSMISSION HERE..."
                                value={emailBody}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEmailBody(e.target.value)}
                                className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none min-h-[300px] font-medium text-xs p-8 leading-relaxed"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-8 gap-4 sm:justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-black animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-black/30">
                                SEGMENT: SELECTED {selectedUserIds.length}
                            </span>
                        </div>
                        <Button
                            className="bg-black text-white font-black uppercase h-16 px-16 rounded-none tracking-widest text-[11px] hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[8px_8px_0px_#f3f4f6] hover:shadow-none border border-black"
                            disabled={!emailSubject || !emailBody || sendBulkEmail.isPending}
                            onClick={handleSendBulk}
                        >
                            {sendBulkEmail.isPending ? "TRANSMITTING..." : "DEPLOY CAMPAIGN"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
