"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Type,
    Eye,
    Globe,
    Settings
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function NewBlogPostPage() {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const createPost = api.blog.createPost.useMutation({
        onSuccess: () => {
            toast({
                title: "STORY PUBLISHED",
                description: "The new manuscript has been successfully deployed to the engine.",
            })
            router.push("/admin/blog")
        },
        onError: (err) => {
            toast({
                title: "PUBLICATION FAILED",
                description: err.message,
                variant: "destructive",
            })
            setIsSubmitting(false)
        }
    })

    const [form, setForm] = React.useState({
        title: "",
        content: "",
        excerpt: "",
        featuredImage: "",
        status: "DRAFT" as "DRAFT" | "ACTIVE" | "ARCHIVED",
        metaTitle: "",
        metaDescription: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        createPost.mutate(form)
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <main className="max-w-5xl mx-auto p-8 lg:p-16 space-y-16">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-100 pb-12">
                    <div className="space-y-4">
                        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Archives
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                            NEW <span className="text-gray-200">STORY</span>
                        </h1>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="rounded-none bg-black text-white h-14 px-12 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.1)] border border-black"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? "PUBLISHING..." : "SAVE & PUBLISH"}
                    </Button>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Primary Content Editor */}
                    <div className="lg:col-span-2 space-y-12">
                        <section className="space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                    <Type className="w-3 h-3" /> ARTICLE TITLE
                                </Label>
                                <Input
                                    required
                                    placeholder="ENTER CATCHY HEADLINE..."
                                    className="h-24 text-4xl md:text-5xl font-black uppercase border-none rounded-none bg-gray-50 focus-visible:ring-black placeholder:text-gray-200"
                                    value={form.title}
                                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                    BODY MANUSCRIPT
                                </Label>
                                <Textarea
                                    required
                                    placeholder="BEGIN TELLING YOUR STORY..."
                                    className="min-h-[600px] text-lg leading-relaxed border-none rounded-none bg-gray-50 focus-visible:ring-black p-10 font-medium"
                                    value={form.content}
                                    onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2">
                                    EXCERPT (SHORT SUMMARY)
                                </Label>
                                <Textarea
                                    placeholder="BRIEF INTRODUCTION FOR LISTINGS..."
                                    className="min-h-[120px] border-none rounded-none bg-gray-50 focus-visible:ring-black p-6 text-sm uppercase font-bold"
                                    value={form.excerpt}
                                    onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Configuration */}
                    <aside className="space-y-12">
                        <section className="p-8 border border-gray-100 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest border-b border-gray-100 pb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4" /> CONFIGURATION
                            </h3>

                            <div className="space-y-4">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">PUBLISHING STATUS</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={val => setForm(prev => ({ ...prev, status: val as any }))}
                                >
                                    <SelectTrigger className="rounded-none border-gray-200 h-10 text-[10px] font-black uppercase">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none border-gray-100">
                                        <SelectItem value="DRAFT" className="text-[10px] font-black uppercase">DRAFT</SelectItem>
                                        <SelectItem value="ACTIVE" className="text-[10px] font-black uppercase">ACTIVE / PUBLISH</SelectItem>
                                        <SelectItem value="ARCHIVED" className="text-[10px] font-black uppercase">ARCHIVED</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" /> COVER IMAGE URL
                                </Label>
                                <Input
                                    placeholder="https://..."
                                    className="rounded-none border-gray-200 h-10 text-[10px] font-bold"
                                    value={form.featuredImage}
                                    onChange={e => setForm(prev => ({ ...prev, featuredImage: e.target.value }))}
                                />
                                {form.featuredImage && (
                                    <div className="aspect-[16/9] bg-gray-100 overflow-hidden border border-gray-200">
                                        <img src={form.featuredImage} alt="Preview" className="w-full h-full object-cover grayscale" />
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="p-8 border border-gray-100 space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest border-b border-gray-100 pb-4 flex items-center gap-2">
                                <Globe className="w-4 h-4" /> SEO AUDIT
                            </h3>

                            <div className="space-y-4">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">META TITLE</Label>
                                <Input
                                    placeholder="SEO OPTIMIZED TITLE..."
                                    className="rounded-none border-gray-200 h-10 text-[10px] font-bold"
                                    value={form.metaTitle}
                                    onChange={e => setForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">META DESCRIPTION</Label>
                                <Textarea
                                    placeholder="SEARCH ENGINE SNIPPET..."
                                    className="rounded-none border-gray-200 h-24 text-[10px] font-bold"
                                    value={form.metaDescription}
                                    onChange={e => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                                />
                            </div>
                        </section>

                        <div className="p-8 bg-black text-white space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                <Eye className="w-4 h-4" /> VISIBILITY
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest leading-loose opacity-60">
                                THIS STORY WILL BE ACCESSIBLE TO ALL REGISTERED AND ANONYMOUS USERS ONCE SET TO ACTIVE.
                            </p>
                        </div>
                    </aside>
                </form>
            </main>
        </div>
    )
}
