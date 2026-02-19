"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import {
    FileText,
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    Calendar,
    Edit3,
    Trash2,
    ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminBlogPage() {
    const router = useRouter()
    const { data: posts, isLoading, refetch } = api.blog.getAdminPosts.useQuery({})
    const deletePost = api.blog.deletePost.useMutation({
        onSuccess: () => refetch()
    })

    const [searchQuery, setSearchQuery] = React.useState("")

    const filteredPosts = posts?.filter((post: any) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar Re-used from Admin Layout logic or hardcoded for consistency if layout is simple */}
            <main className="flex-grow p-10 lg:p-16 space-y-12 max-w-7xl">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-100 pb-12">
                    <div className="space-y-4">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                            BLOG <span className="text-gray-200">ENGINE</span>
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                            Editorial Content Management System
                        </p>
                    </div>
                    <Link href="/admin/blog/new">
                        <Button className="rounded-none bg-black text-white h-14 px-10 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.1)] hover:shadow-none border border-black">
                            <Plus className="w-4 h-4 mr-2" />
                            New Story
                        </Button>
                    </Link>
                </header>

                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <Input
                        placeholder="SEARCH STORIES BY TITLE OR KEYWORDS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-50 border-none rounded-none h-16 pl-14 font-black uppercase text-[10px] tracking-widest focus-visible:ring-1 focus-visible:ring-black"
                    />
                </div>

                <div className="border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                <th className="p-8">ARTICLE</th>
                                <th className="p-8">STATUS</th>
                                <th className="p-8">DATE</th>
                                <th className="p-8 text-right">METRICS</th>
                                <th className="p-8 w-20"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-24 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">
                                        ACCESSING EDITORIAL ARCHIVES...
                                    </td>
                                </tr>
                            ) : filteredPosts?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-24 text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                                        NO STORIES FOUND IN SYSTEM.
                                    </td>
                                </tr>
                            ) : filteredPosts?.map((post: any) => (
                                <tr key={post.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => router.push(`/admin/blog/${post.id}`)}>
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-20 bg-gray-100 relative grayscale group-hover:grayscale-0 transition-all duration-500 overflow-hidden">
                                                {post.featuredImage ? (
                                                    <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FileText className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black uppercase text-sm tracking-tight group-hover:translate-x-1 transition-transform">{post.title}</p>
                                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{post.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className={cn(
                                            "px-3 py-1 text-[8px] font-black uppercase border w-fit inline-block",
                                            post.status === "ACTIVE" ? "border-black bg-black text-white" : "border-gray-200 text-gray-400"
                                        )}>
                                            {post.status}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(post.createdAt), "MMM dd, yyyy")}
                                        </div>
                                    </td>
                                    <td className="p-8 text-right">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-end gap-2 text-[10px] font-black">
                                                <Eye className="w-3 h-3 text-gray-300" />
                                                {post.viewCount}
                                            </div>
                                            <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                                                {post.readingTime || 1} MIN READ
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-black hover:text-white rounded-none">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-none border-gray-100 shadow-2xl">
                                                <Link href={`/admin/blog/${post.id}`}>
                                                    <DropdownMenuItem className="text-[10px] font-black uppercase px-4 py-3 cursor-pointer">
                                                        <Edit3 className="mr-2 h-3 w-3" /> Edit Story
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="text-[10px] font-black uppercase px-4 py-3 cursor-pointer text-red-500 focus:text-red-500"
                                                    onClick={() => deletePost.mutate({ id: post.id })}
                                                >
                                                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
