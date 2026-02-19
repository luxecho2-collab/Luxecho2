"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import {
    Plus,
    Edit3,
    Trash2,
    ArrowLeft,
    FolderPlus,
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Search,
    Tag as TagIcon,
    Hash
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"

export default function AdminAttributesPage() {
    const { toast } = useToast()
    const utils = api.useUtils()
    const { data: attributes, isLoading } = api.admin.getAttributes.useQuery()

    // Form states
    const [name, setName] = React.useState("")
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [editingAttribute, setEditingAttribute] = React.useState<any>(null)

    const createTag = api.admin.createTag.useMutation({
        onSuccess: () => {
            toast({ title: "ATTRIBUTE DEPLOYED", description: "New filter tag has been added to the register." })
            utils.admin.getAttributes.invalidate()
            setName("")
        }
    })

    const updateTag = api.admin.updateTag.useMutation({
        onSuccess: () => {
            toast({ title: "ATTRIBUTE MODIFIED", description: "Filter tag record has been updated." })
            utils.admin.getAttributes.invalidate()
            setEditingAttribute(null)
        }
    })

    const deleteTag = api.admin.deleteTag.useMutation({
        onSuccess: () => {
            toast({ title: "ATTRIBUTE REMOVED", description: "Tag has been purged from the manifest." })
            utils.admin.getAttributes.invalidate()
        }
    })

    return (
        <div className="flex min-h-screen bg-white text-black">
            <main className="flex-grow p-10 lg:p-16 space-y-16 max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-4">
                        <Link href="/admin" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all group">
                            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                            Back to Center
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-black">
                            FILTER <span className="text-gray-200">ATTRIBUTES</span>
                        </h1>
                    </div>
                </header>

                <div className="bg-gray-50 p-10 border border-gray-100 space-y-8">
                    <div className="flex items-center gap-4">
                        <Hash className="w-5 h-5 text-gray-300" />
                        <h2 className="text-xl font-black uppercase tracking-tight">Active Tag Manifest</h2>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 max-w-2xl leading-relaxed">
                        Attributes are derived from product tags and used to populate the advanced filter stream.
                        Wiping a tag here will remove it from all associated products in the listing interface.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-6">
                        {isLoading ? (
                            Array(12).fill(0).map((_, i) => (
                                <div key={i} className="h-12 w-32 bg-gray-100 animate-pulse" />
                            ))
                        ) : attributes?.map((tag) => (
                            <div
                                key={tag.id}
                                className="group flex items-center gap-4 bg-white border border-gray-100 px-6 py-4 hover:border-black transition-all duration-300"
                            >
                                <span className="text-[10px] font-black uppercase tracking-widest">{tag.name}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingAttribute(tag)}
                                        className="text-gray-300 hover:text-black transition-colors"
                                    >
                                        <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                        onClick={() => {
                                            if (confirm(`Permanently purge #${tag.name} from manifest?`)) {
                                                deleteTag.mutate({ id: tag.id })
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="p-10 border border-gray-50 bg-white space-y-8">
                        <h3 className="text-xl font-black uppercase tracking-tight">Quick Register</h3>
                        <div className="space-y-4">
                            <Input
                                placeholder="NEW ATTRIBUTE NAME"
                                value={name}
                                onChange={(e) => setName(e.target.value.toUpperCase())}
                                className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-14 font-black text-[10px] tracking-widest"
                            />
                            <Button
                                className="w-full bg-black text-white font-black uppercase h-14 rounded-none tracking-widest text-[10px]"
                                disabled={!name || createTag.isPending}
                                onClick={() => createTag.mutate({ name })}
                            >
                                {createTag.isPending ? "Deploying..." : "Deploy Attribute"}
                            </Button>
                        </div>
                    </div>

                    <div className="p-10 border border-gray-50 bg-white space-y-6">
                        <h3 className="text-xl font-black uppercase tracking-tight">Logic Stream</h3>
                        <div className="space-y-4">
                            {[
                                "Product filters are aggregated across the entire catalog.",
                                "Changes to tags are reflected instantly in the filter drawer.",
                                "Aesthetics matter: Use concise, UPPERCASE names for tags.",
                            ].map((note, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-1 h-1 bg-black mt-2 flex-shrink-0" />
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Dialog */}
            <Dialog open={!!editingAttribute} onOpenChange={(open) => !open && setEditingAttribute(null)}>
                <DialogContent className="rounded-none bg-white border-none p-10 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight">Modify Attribute</DialogTitle>
                        <DialogDescription className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Update existing manifest record for {editingAttribute?.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-8 py-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Attribute Designation</label>
                            <Input
                                defaultValue={editingAttribute?.name}
                                onChange={(e) => setEditingAttribute({ ...editingAttribute, name: e.target.value.toUpperCase() })}
                                className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black text-xs tracking-widest"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full bg-black text-white font-black uppercase h-14 rounded-none tracking-widest text-[10px]"
                            disabled={updateTag.isPending}
                            onClick={() => {
                                updateTag.mutate({
                                    id: editingAttribute.id,
                                    name: editingAttribute.name
                                })
                            }}
                        >
                            {updateTag.isPending ? "Syncing..." : "Push Mutations"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
