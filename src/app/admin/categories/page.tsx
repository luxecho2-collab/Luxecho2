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
    MoreVertical,
    Tag as TagIcon
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

export default function AdminCategoriesPage() {
    const { toast } = useToast()
    const utils = api.useUtils()
    const { data: categories, isLoading } = api.product.getCategories.useQuery()

    // Form states
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [isCreateOpen, setIsCreateOpen] = React.useState(false)
    const [editingCategory, setEditingCategory] = React.useState<any>(null)

    const createCategory = api.admin.createCategory.useMutation({
        onSuccess: () => {
            toast({ title: "CLASS CREATED", description: "New category has been added to the register." })
            utils.product.getCategories.invalidate()
            setIsCreateOpen(false)
            setName("")
            setDescription("")
        }
    })

    const updateCategory = api.admin.updateCategory.useMutation({
        onSuccess: () => {
            toast({ title: "CLASS UPDATED", description: "Category record has been modified." })
            utils.product.getCategories.invalidate()
            setEditingCategory(null)
        }
    })

    const deleteCategory = api.admin.deleteCategory.useMutation({
        onSuccess: () => {
            toast({ title: "CLASS REMOVED", description: "Category has been wiped from the manifest." })
            utils.product.getCategories.invalidate()
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
                            CLASS <span className="text-gray-200">MATRIX</span>
                        </h1>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-black text-white font-black uppercase rounded-none h-16 px-12 text-[11px] tracking-widest hover:translate-x-1 hover:-translate-y-1 transition-all shadow-[8px_8px_0px_#f3f4f6] hover:shadow-none">
                                <Plus className="w-4 h-4 mr-3" /> New Class
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-none bg-white border-none p-10 max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black uppercase tracking-tight">Register New Class</DialogTitle>
                                <DialogDescription className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Deploy new category to the storefront manifest.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-8 py-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Class Designation</label>
                                    <Input
                                        placeholder="E.G. ACCESSORIES"
                                        value={name}
                                        onChange={(e) => setName(e.target.value.toUpperCase())}
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black text-xs tracking-widest"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Description (Optional)</label>
                                    <Textarea
                                        placeholder="Brief summary of the class contents..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none min-h-[120px] font-medium text-xs p-5"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="w-full bg-black text-white font-black uppercase h-14 rounded-none tracking-widest text-[10px]"
                                    disabled={!name || createCategory.isPending}
                                    onClick={() => createCategory.mutate({ name, description })}
                                >
                                    {createCategory.isPending ? "Syncing..." : "Launch Class"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </header>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <Input
                            placeholder="SEARCH BY CLASS DESIGNATION..."
                            className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 pl-14 text-[10px] font-black uppercase tracking-widest"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-48 bg-gray-50 animate-pulse border border-gray-100" />
                        ))
                    ) : categories?.map((cat) => (
                        <div key={cat.id} className="group relative border border-gray-50 bg-white p-10 hover:border-black transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 h-0 bg-black group-hover:h-full transition-all duration-700" />
                            <div className="space-y-6 relative">
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-300 mb-2">Class ID: {cat.id.slice(0, 8)}</p>
                                    <h3 className="text-2xl font-black uppercase tracking-tight group-hover:translate-x-1 transition-transform">{cat.name}</h3>
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed min-h-[40px]">
                                    {cat.description || "No description provided for this manifest."}
                                </p>
                                <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-black/20 group-hover:text-black transition-colors">
                                        Active Stream
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 hover:bg-black hover:text-white transition-all rounded-none"
                                            onClick={() => setEditingCategory(cat)}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 hover:bg-red-50 text-red-500 transition-all rounded-none"
                                            onClick={() => {
                                                if (confirm("Permanently wipe this class from manifest?")) {
                                                    deleteCategory.mutate({ id: cat.id })
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Edit Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent className="rounded-none bg-white border-none p-10 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight">Modify Class</DialogTitle>
                        <DialogDescription className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Update existing manifest record for {editingCategory?.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-8 py-8">
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Class Designation</label>
                            <Input
                                defaultValue={editingCategory?.name}
                                onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value.toUpperCase() })}
                                className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black text-xs tracking-widest"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Description (Optional)</label>
                            <Textarea
                                defaultValue={editingCategory?.description || ""}
                                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none min-h-[120px] font-medium text-xs p-5"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full bg-black text-white font-black uppercase h-14 rounded-none tracking-widest text-[10px]"
                            disabled={updateCategory.isPending}
                            onClick={() => updateCategory.mutate({
                                id: editingCategory.id,
                                name: editingCategory.name,
                                description: editingCategory.description
                            })}
                        >
                            {updateCategory.isPending ? "Syncing..." : "Push Mutations"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
