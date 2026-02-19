"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useRouter, useParams } from "next/navigation"
import {
    ArrowLeft,
    FileText,
    Sparkles,
    Image as ImageIcon,
    CheckCircle2,
    Calendar,
    Save,
    Trash2,
    Loader2,
    Clock,
    Layout,
    Type,
    Eye
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function AdminEditBlogPostPage() {
    const router = useRouter()
    const { id } = useParams() as { id: string }
    const { toast } = useToast()
    const utils = api.useUtils()

    // Form state
    const [title, setTitle] = React.useState("")
    const [content, setContent] = React.useState("")
    const [excerpt, setExcerpt] = React.useState("")
    const [featuredImage, setFeaturedImage] = React.useState("")
    const [status, setStatus] = React.useState<"ACTIVE" | "DRAFT" | "ARCHIVED">("DRAFT")
    const [metaTitle, setMetaTitle] = React.useState("")
    const [metaDescription, setMetaDescription] = React.useState("")
    const isInitialized = React.useRef(false)

    const { data: post, isLoading } = api.blog.getPostById.useQuery({ id })

    React.useEffect(() => {
        if (post && !isInitialized.current) {
            isInitialized.current = true
            setTitle(post.title)
            setContent(post.content)
            setExcerpt(post.excerpt || "")
            setFeaturedImage(post.featuredImage || "")
            setStatus(post.status as any)
            setMetaTitle(post.metaTitle || "")
            setMetaDescription(post.metaDescription || "")
        }
    }, [post])

    const updatePost = api.blog.updatePost.useMutation({
        onSuccess: () => {
            toast({
                title: "ARTICLE SYNCHRONIZED",
                description: "The editorial record has been successfully updated.",
            })
            utils.blog.getAdminPosts.invalidate()
            utils.blog.getPostById.invalidate({ id })
            router.push("/admin/blog")
        }
    })

    const deletePost = api.blog.deletePost.useMutation({
        onSuccess: () => {
            toast({
                title: "ARTICLE DELETED",
                description: "The article has been permanently removed from archives.",
            })
            utils.blog.getAdminPosts.invalidate()
            router.push("/admin/blog")
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        updatePost.mutate({
            id,
            title,
            content,
            excerpt,
            featuredImage,
            status,
            metaTitle,
            metaDescription,
        })
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-black" />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-white text-black">
            <main className="flex-grow p-10 lg:p-16 space-y-16 max-w-7xl mx-auto">
                <header className="space-y-6">
                    <Link href="/admin/blog" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all group">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Back to Editorial Archives
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                                EDIT <span className="text-gray-200">ARTICLE</span>
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                                Modifying Story Record: {post?.slug}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 p-5 border border-gray-100 bg-white">
                            <LuxechoLogo size={24} />
                            <p className="text-[9px] font-black uppercase tracking-widest text-black tabular-nums">
                                Views: {post?.viewCount || 0}
                            </p>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8 space-y-16">
                        <section className="space-y-10 p-10 border border-gray-50 bg-white hover:border-black transition-all duration-500">
                            <div className="flex items-center gap-5">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Editorial Content</h2>
                                <div className="h-[1px] flex-grow bg-gray-50" />
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Headline</Label>
                                    <Input
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="STORY HEADLINE..."
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black uppercase text-2xl pr-10"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Summary Excerpt</Label>
                                    <Textarea
                                        value={excerpt}
                                        onChange={(e) => setExcerpt(e.target.value)}
                                        placeholder="Brief hook for the listing view..."
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none min-h-[100px] font-medium text-sm p-6"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Article Body</Label>
                                    <Textarea
                                        required
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Begin the narrative..."
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none min-h-[500px] font-medium leading-relaxed text-base p-10"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-4 space-y-16">
                        {/* Visual Assets */}
                        <section className="space-y-10 p-10 border border-gray-50 bg-white hover:border-black transition-all duration-500">
                            <h2 className="text-xl font-black uppercase tracking-tight">Cover Asset</h2>
                            <div className="aspect-square bg-gray-50 border border-gray-100 relative group overflow-hidden">
                                {featuredImage ? (
                                    <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-200 p-10 text-center">
                                        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">Article Cover Awaiting Asset</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Cover URL</Label>
                                <Input
                                    value={featuredImage}
                                    onChange={(e) => setFeaturedImage(e.target.value)}
                                    placeholder="HTTPS://..."
                                    className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-12 text-[10px]"
                                />
                            </div>
                        </section>

                        {/* Status & Meta */}
                        <section className="space-y-10 p-10 border border-gray-50 bg-white hover:border-black transition-all duration-500">
                            <h2 className="text-xl font-black uppercase tracking-tight">Deployment Settings</h2>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Lifecycle State</Label>
                                    <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                        <SelectTrigger className="bg-gray-50 border-none rounded-none h-14 font-black uppercase text-[10px] tracking-widest">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE" className="font-black uppercase text-[9px]">Live Stream</SelectItem>
                                            <SelectItem value="DRAFT" className="font-black uppercase text-[9px]">Internal Draft</SelectItem>
                                            <SelectItem value="ARCHIVED" className="font-black uppercase text-[9px]">Cold Archive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">SEO Title</Label>
                                    <Input
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        className="bg-gray-50 border-none rounded-none h-12 text-[10px]"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">SEO Description</Label>
                                    <Textarea
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        className="bg-gray-50 border-none rounded-none min-h-[100px] text-[10px]"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                disabled={updatePost.isPending}
                                className="w-full bg-black text-white font-black uppercase text-xl rounded-none h-20 shadow-[8px_8px_0px_#f3f4f6] hover:shadow-none hover:translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50"
                            >
                                {updatePost.isPending ? "Syncing..." : "Commit Changes"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (confirm("Permanently remove this story from system archives?")) {
                                        deletePost.mutate({ id })
                                    }
                                }}
                                className="w-full border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-500 font-black uppercase text-[10px] tracking-widest rounded-none h-14 transition-all"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Article
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}
