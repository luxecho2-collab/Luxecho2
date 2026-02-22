"use client"

import { api } from "@/trpc/react"
import { useState } from "react"
import { Plus, Trash2, Megaphone, Image as ImageIcon, Edit2, Check, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

/* ─── Types ─────────────────────────────────────────────────────────── */
type SlideForm = {
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    image: string
    order: number
    isActive: boolean
    slideStyle: string
    backgroundBlur: number
    backgroundOpacity: number
}

const TEMPLATES = [
    { id: "01", name: "Premium Signature", desc: "Centered high-impact typography with decorative accents" },
    { id: "02", name: "Left-Aligned Editorial", desc: "Editorial layout with strong left alignment" },
    { id: "03", name: "Minimalist Film", desc: "Cinematic, border-boxed aesthetic" },
    { id: "04", name: "Avant-Garde Right", desc: "Right-aligned, staggered sleek typography" },
    { id: "05", name: "Boutique Frame", desc: "Minimalist thin border frame with classic serif" },
]

const EMPTY_SLIDE: SlideForm = {
    title: "",
    subtitle: "New Capsule '26",
    ctaText: "Explore Drop",
    ctaLink: "/products",
    image: "",
    order: 0,
    isActive: true,
    slideStyle: "01",
    backgroundBlur: 0,
    backgroundOpacity: 0.5,
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function HeroSlidesAdminPage() {
    const { toast } = useToast()

    // ── Slides state ──────────────────────────────────────────────────
    const { data: slides = [], refetch: refetchSlides } = api.admin.getHeroSlides.useQuery()
    const createSlide = api.admin.createHeroSlide.useMutation({
        onSuccess: () => {
            refetchSlides();
            setShowSlideForm(false);
            setSlideForm(EMPTY_SLIDE);
            toast({ title: "SLIDE CREATED", description: "Your new slide is now live." });
        },
        onError: (err) => toast({ title: "CREATE FAILED", description: err.message, variant: "destructive" })
    })
    const updateSlide = api.admin.updateHeroSlide.useMutation({
        onSuccess: () => {
            refetchSlides();
            setEditingSlideId(null);
            toast({ title: "SLIDE UPDATED", description: "Changes saved successfully." });
        },
        onError: (err) => toast({ title: "UPDATE FAILED", description: err.message, variant: "destructive" })
    })
    const deleteSlide = api.admin.deleteHeroSlide.useMutation({
        onSuccess: () => {
            refetchSlides();
            toast({ title: "SLIDE DELETED", description: "Slide removed." });
        },
        onError: (err) => toast({ title: "DELETE FAILED", description: err.message, variant: "destructive" })
    })

    const [showSlideForm, setShowSlideForm] = useState(false)
    const [slideForm, setSlideForm] = useState<SlideForm>(EMPTY_SLIDE)
    const [editingSlideId, setEditingSlideId] = useState<string | null>(null)
    const [editSlideForm, setEditSlideForm] = useState<Partial<SlideForm>>({})

    // ── Announcements state ───────────────────────────────────────────
    const { data: announcements = [], refetch: refetchAnnouncements } = api.admin.getAnnouncements.useQuery()
    const createAnnouncement = api.admin.createAnnouncement.useMutation({
        onSuccess: () => {
            refetchAnnouncements();
            setAnnText("");
            setAnnLink("");
            toast({ title: "ANNOUNCEMENT PUBLISHED" });
        }
    })
    const updateAnnouncement = api.admin.updateAnnouncement.useMutation({ onSuccess: () => refetchAnnouncements() })
    const deleteAnnouncement = api.admin.deleteAnnouncement.useMutation({ onSuccess: () => refetchAnnouncements() })

    const [annText, setAnnText] = useState("")
    const [annLink, setAnnLink] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    const handleFileUpload = async (file: File, isEdit: boolean = false) => {
        setIsUploading(true)
        const formData = new FormData()
        formData.append("files", file)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            if (data.urls && data.urls[0]) {
                if (isEdit) {
                    setEditSlideForm(p => ({ ...p, image: data.urls[0] }))
                } else {
                    setSlideForm(p => ({ ...p, image: data.urls[0] }))
                }
                toast({ title: "IMAGE UPLOADED", description: "Asset successfully staged." })
            }
        } catch (error) {
            toast({ title: "UPLOAD FAILED", description: "Could not process image.", variant: "destructive" })
        } finally {
            setIsUploading(false)
        }
    }

    const startEditSlide = (slide: any) => {
        setEditingSlideId(slide.id)
        setEditSlideForm({
            title: slide.title,
            subtitle: slide.subtitle,
            ctaText: slide.ctaText,
            ctaLink: slide.ctaLink,
            image: slide.image,
            order: slide.order,
            isActive: slide.isActive,
            slideStyle: (slide as any).slideStyle || "01",
            backgroundBlur: (slide as any).backgroundBlur ?? 0,
            backgroundOpacity: (slide as any).backgroundOpacity ?? 0.5,
        })
    }

    return (
        <div className="p-8 lg:p-12 max-w-7xl bg-white">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-[0.3em] text-gray-900">Homepage CMS</h1>
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.4em] mt-3">Manage hero slideshow & brand announcements</p>
                </div>

                {/* Live Preview */}
                <div className="hidden lg:block w-[500px] bg-white shadow-2xl overflow-hidden relative group border border-gray-200">
                    <div className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-400 absolute top-3 left-4 z-20">
                        Live Preview: {TEMPLATES.find(t => t.id === (editingSlideId ? editSlideForm.slideStyle : slideForm.slideStyle))?.name || "Premium Signature"}
                    </div>
                    <div className="h-72 bg-white relative overflow-hidden flex items-center justify-center">
                        {(editingSlideId ? editSlideForm.image : slideForm.image) && (
                            <img
                                src={editingSlideId ? editSlideForm.image : slideForm.image}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                style={{
                                    filter: `blur(${(editingSlideId ? editSlideForm.backgroundBlur : slideForm.backgroundBlur) ?? 0}px)`,
                                }}
                                alt="Preview"
                            />
                        )}
                        <div
                            className="absolute inset-0 z-[1] bg-black transition-opacity duration-500"
                            style={{ opacity: (editingSlideId ? editSlideForm.backgroundOpacity : slideForm.backgroundOpacity) ?? 0.5 }}
                        />

                        {/* DYNAMIC PREVIEW OVERLAY */}
                        {(() => {
                            const currentStyle = editingSlideId ? editSlideForm.slideStyle : slideForm.slideStyle;
                            const currentTitle = (editingSlideId ? editSlideForm.title : slideForm.title) || "CAPSULE";
                            const currentSubtitle = (editingSlideId ? editSlideForm.subtitle : slideForm.subtitle) || "New Collection";
                            const currentCta = (editingSlideId ? editSlideForm.ctaText : slideForm.ctaText) || "EXPLORE DROP";

                            if (currentStyle === "02") {
                                return (
                                    <div className="relative z-10 w-full h-full flex flex-col justify-center p-8 text-left bg-black/10">
                                        <div className="scale-[0.5] origin-left">
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="w-8 h-[2px] bg-white/80" />
                                                <p className="text-white text-xs font-black uppercase tracking-[0.4em] drop-shadow-lg">LUXECHO EDITORIAL</p>
                                            </div>
                                            <h1 className="text-7xl font-black text-white uppercase leading-[0.9] tracking-tighter drop-shadow-2xl mb-4">
                                                {currentTitle}
                                            </h1>
                                            <p className="text-white/80 text-xl font-light tracking-wide mb-8">
                                                {currentSubtitle}
                                            </p>
                                            <div className="inline-block bg-transparent border border-white text-white px-8 py-3 font-bold text-sm tracking-[0.2em] uppercase">
                                                {currentCta}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            if (currentStyle === "03") {
                                return (
                                    <div className="relative z-10 w-full h-full flex flex-col justify-end p-6 text-center bg-black/10">
                                        <div className="scale-[0.6] origin-bottom">
                                            <div className="bg-black/40 backdrop-blur-md p-6 border border-white/10 shadow-2xl rounded-sm">
                                                <h1 className="text-5xl font-serif text-white uppercase leading-tight tracking-tight drop-shadow-lg mb-2">
                                                    {currentTitle}
                                                </h1>
                                                <p className="text-white/70 text-sm font-medium tracking-[0.3em] uppercase mb-6">
                                                    {currentSubtitle}
                                                </p>
                                                <div className="inline-block text-white border-b-2 border-white/30 pb-1 text-xs font-black tracking-widest uppercase">
                                                    {currentCta}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            if (currentStyle === "04") {
                                return (
                                    <div className="relative z-10 w-full h-full flex flex-col justify-center p-8 text-right bg-black/10">
                                        <div className="scale-[0.5] origin-right ml-auto">
                                            <div className="mb-6 flex items-center justify-end gap-3">
                                                <p className="text-white text-xs font-black uppercase tracking-[0.6em] drop-shadow-lg">LUXECHO AVANT-GARDE</p>
                                                <div className="w-12 h-[1px] bg-white/60" />
                                            </div>
                                            <div className="flex flex-col items-end gap-1 mb-6">
                                                {currentTitle.split(' ').map((word: string, i: number) => (
                                                    <h1 key={i} className="text-6xl font-black text-white leading-[0.85] tracking-tight drop-shadow-2xl italic pr-2" style={{ paddingRight: `${i * 1}rem` }}>
                                                        {word}
                                                    </h1>
                                                ))}
                                            </div>
                                            <p className="text-white/90 text-lg font-normal tracking-[0.2em] uppercase mb-8 border-r border-white/50 pr-3">
                                                {currentSubtitle}
                                            </p>
                                            <div className="inline-block bg-white text-black px-6 py-2 text-xs font-black tracking-[0.3em] uppercase rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                                {currentCta}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            if (currentStyle === "05") {
                                return (
                                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 bg-black/10">
                                        <div className="w-full h-full border border-white/30 flex flex-col items-center justify-center p-4 relative">
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[6px] text-white/60 uppercase tracking-[0.5em] font-medium">
                                                L U X E C H O
                                            </div>
                                            <div className="scale-[0.5] origin-center text-center">
                                                <h1 className="text-4xl font-light text-white uppercase leading-tight tracking-[0.4em] drop-shadow-md mb-2">
                                                    {currentTitle}
                                                </h1>
                                                <p className="text-white/70 text-xs font-light tracking-[0.3em] uppercase">
                                                    {currentSubtitle}
                                                </p>
                                            </div>
                                            <div className="absolute bottom-6 scale-[0.5] origin-bottom text-white text-[8px] font-medium tracking-[0.4em] uppercase border-b border-white/40 pb-1 flex items-center gap-2">
                                                <span>{currentCta}</span>
                                                <span className="text-white/50 text-xs font-light">→</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            // Default 01 Signature
                            return (
                                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 text-center bg-black/10">
                                    <div className="scale-[0.4] origin-center">
                                        <p className="text-white text-base font-black uppercase tracking-[0.4em] mb-4 drop-shadow-lg">LUXECHO®</p>
                                        <h1 className="text-8xl font-black text-white uppercase leading-[0.8] tracking-tighter drop-shadow-2xl mb-12">
                                            {currentTitle}
                                        </h1>
                                        <div className="inline-block bg-white text-black px-12 py-5 rounded-xl font-bold text-xl uppercase tracking-tight">
                                            {currentCta}
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                </div>
            </div>

            {/* ══ Hero Slideshow Section ═════════════════════════════════ */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-gray-700" />
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-900">Hero Slides</h2>
                        <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 font-bold uppercase tracking-widest">{slides.length} slides</span>
                    </div>
                    <Button
                        onClick={() => setShowSlideForm(!showSlideForm)}
                        className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-none px-6 h-10 hover:bg-gray-800"
                    >
                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Slide
                    </Button>
                </div>

                {/* New slide form */}
                {showSlideForm && (
                    <div className="border border-gray-200 p-6 mb-4 bg-gray-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-5">New Slide</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Title</label>
                                <input placeholder="e.g. DEFINING LUXURY" value={slideForm.title} onChange={e => setSlideForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gray-900 bg-white" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Subtitle</label>
                                <input placeholder="e.g. New Collection — SS2026" value={slideForm.subtitle} onChange={e => setSlideForm(p => ({ ...p, subtitle: e.target.value }))} className="w-full border border-gray-200 px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gray-900 bg-white" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">CTA Text</label>
                                <input placeholder="Explore Drop" value={slideForm.ctaText} onChange={e => setSlideForm(p => ({ ...p, ctaText: e.target.value }))} className="w-full border border-gray-200 px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gray-900 bg-white" />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">CTA Link</label>
                                <input placeholder="/products" value={slideForm.ctaLink} onChange={e => setSlideForm(p => ({ ...p, ctaLink: e.target.value }))} className="w-full border border-gray-200 px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gray-900 bg-white" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Template Style</label>
                                <div className="grid grid-cols-3 gap-3 mt-1">
                                    {TEMPLATES.map((tmpl) => (
                                        <button
                                            key={tmpl.id}
                                            onClick={() => setSlideForm(p => ({ ...p, slideStyle: tmpl.id }))}
                                            className={`p-3 text-left border ${slideForm.slideStyle === tmpl.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'} transition-all`}
                                        >
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-1">{tmpl.name}</p>
                                            <p className={`text-[8px] opacity-70 leading-tight`}>{tmpl.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Image URL or Upload</label>
                                <div className="flex gap-2 mt-1">
                                    <input placeholder="/assets/images/brand/..." value={slideForm.image} onChange={e => setSlideForm(p => ({ ...p, image: e.target.value }))} className="flex-grow border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-900 bg-white" />
                                    <div className="relative">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], false)}
                                            disabled={isUploading}
                                        />
                                        <Button variant="outline" className="h-10 rounded-none border-gray-200 px-4 bg-white">
                                            <Upload className="w-4 h-4 text-gray-600" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-4 border-y border-gray-100 py-4 my-2">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Background Blur</label>
                                        <span className="text-[9px] font-bold text-gray-900">{slideForm.backgroundBlur}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="20"
                                        step="1"
                                        value={slideForm.backgroundBlur}
                                        onChange={e => setSlideForm(p => ({ ...p, backgroundBlur: parseInt(e.target.value) }))}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Background Darkness</label>
                                        <span className="text-[9px] font-bold text-gray-900">{Math.round((slideForm.backgroundOpacity || 0) * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={slideForm.backgroundOpacity}
                                        onChange={e => setSlideForm(p => ({ ...p, backgroundOpacity: parseFloat(e.target.value) }))}
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Order</label>
                                <input type="number" value={slideForm.order} onChange={e => setSlideForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 px-3 py-2 text-sm mt-1 focus:outline-none focus:border-gray-900 bg-white" />
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={slideForm.isActive} onChange={e => setSlideForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-gray-900" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Active</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => createSlide.mutate({ ...slideForm })}
                                disabled={createSlide.isPending || isUploading}
                                className="bg-gray-900 text-white hover:bg-gray-800 text-xs font-black uppercase tracking-widest rounded-none h-14 px-8"
                            >
                                {createSlide.isPending ? "Creating..." : "Add Slide"}
                            </Button>
                            <Button
                                onClick={() => setShowSlideForm(false)}
                                variant="outline"
                                className="text-[10px] font-black uppercase tracking-widest rounded-none px-6 h-14 border-gray-300"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Slides list */}
                {slides.length === 0 && !showSlideForm && (
                    <div className="border border-dashed border-gray-200 p-12 text-center bg-gray-50">
                        <p className="text-gray-500 text-xs uppercase tracking-widest">No slides yet. Add your first slide above.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slides.map((slide) => (
                        <div key={slide.id} className={`group relative border ${slide.isActive ? "border-gray-900 shadow-sm" : "border-gray-200"} transition-all duration-500 hover:shadow-2xl hover:border-gray-900 flex flex-col bg-white overflow-hidden`}>
                            {/* Visual Header / Thumbnail */}
                            <div className="aspect-[16/10] bg-gray-50 overflow-hidden relative">
                                {slide.image ? (
                                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <ImageIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-1">
                                    <div className="bg-gray-900/80 backdrop-blur-md px-2 py-1 flex items-center gap-1.5">
                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">{slide.order}</span>
                                    </div>
                                    {!slide.isActive && (
                                        <div className="bg-gray-400 px-2 py-1">
                                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Draft</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-5 flex-grow">
                                {editingSlideId === slide.id ? (
                                    <div className="space-y-3">
                                        <input
                                            placeholder="Title"
                                            value={editSlideForm.title ?? ""}
                                            onChange={e => setEditSlideForm(p => ({ ...p, title: e.target.value }))}
                                            className="w-full border border-gray-200 px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-gray-900 bg-white"
                                        />
                                        <input
                                            placeholder="Subtitle"
                                            value={editSlideForm.subtitle ?? ""}
                                            onChange={e => setEditSlideForm(p => ({ ...p, subtitle: e.target.value }))}
                                            className="w-full border border-gray-200 px-3 py-2 text-[10px] uppercase tracking-[0.2em] focus:outline-none focus:border-gray-900 bg-white"
                                        />

                                        <div className="flex gap-2">
                                            <div className="flex-1 min-w-[120px]">
                                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Template</label>
                                                <select
                                                    value={editSlideForm.slideStyle ?? "01"}
                                                    onChange={e => setEditSlideForm(p => ({ ...p, slideStyle: e.target.value }))}
                                                    className="w-full border border-gray-200 px-2 py-1.5 text-[10px] uppercase font-bold text-gray-700 focus:outline-none focus:border-gray-900 bg-white"
                                                >
                                                    {TEMPLATES.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Blur</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="20"
                                                    step="1"
                                                    value={editSlideForm.backgroundBlur ?? 0}
                                                    onChange={e => setEditSlideForm(p => ({ ...p, backgroundBlur: parseInt(e.target.value) }))}
                                                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Darkness</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={editSlideForm.backgroundOpacity ?? 0.5}
                                                    onChange={e => setEditSlideForm(p => ({ ...p, backgroundOpacity: parseFloat(e.target.value) }))}
                                                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-900"
                                                />
                                            </div>
                                            <div className="w-12">
                                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Order</label>
                                                <input
                                                    placeholder="Order"
                                                    type="number"
                                                    value={editSlideForm.order ?? 0}
                                                    onChange={e => setEditSlideForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                                                    className="w-full border border-gray-200 px-1 py-1 text-[10px] focus:outline-none focus:border-gray-900 bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                onClick={() => updateSlide.mutate({
                                                    id: slide.id,
                                                    ...(editSlideForm as SlideForm),
                                                })}
                                                disabled={updateSlide.isPending}
                                                className="flex-1 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-none h-8 hover:bg-gray-800"
                                            >
                                                <Check className="w-3 h-3 mr-1" /> Save
                                            </Button>
                                            <Button
                                                onClick={() => setEditingSlideId(null)}
                                                variant="outline"
                                                className="px-3 border-gray-200 rounded-none h-8"
                                            >
                                                <X className="w-3 h-3 text-gray-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="font-black text-sm uppercase tracking-[0.2em] mb-1 line-clamp-1 text-gray-900">{slide.title}</h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest line-clamp-1">{slide.subtitle}</p>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => startEditSlide(slide)}
                                                    className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                                                    title="Edit details"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteSlide.mutate({ id: slide.id })}
                                                    className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => updateSlide.mutate({ id: slide.id, isActive: !slide.isActive })}
                                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-all ${slide.isActive
                                                    ? "bg-gray-900 text-white hover:bg-gray-800"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {slide.isActive ? "Live" : "Draft"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ Announcement Bar Section ═══════════════════════════════ */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Megaphone className="w-5 h-5 text-gray-700" />
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gray-900">Announcement Bar</h2>
                </div>

                <div className="border border-gray-200 p-6 mb-4 bg-gray-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-4">New Announcement</p>
                    <div className="flex flex-col gap-3">
                        <input
                            placeholder="e.g. FREE SHIPPING ON ORDERS OVER ₹999 · NEW DROP LIVE NOW"
                            value={annText}
                            onChange={e => setAnnText(e.target.value)}
                            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-900 bg-white"
                        />
                        <input
                            placeholder="Link (optional) — e.g. /products"
                            value={annLink}
                            onChange={e => setAnnLink(e.target.value)}
                            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gray-900 bg-white"
                        />
                        <div>
                            <Button
                                onClick={() => createAnnouncement.mutate({ text: annText, link: annLink || undefined, isActive: true })}
                                disabled={!annText || createAnnouncement.isPending}
                                className="bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-widest rounded-none px-8 h-10"
                            >
                                {createAnnouncement.isPending ? "Publishing..." : "Publish Announcement"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    {announcements.map((ann) => (
                        <div key={ann.id} className={`border ${ann.isActive ? "border-gray-900 bg-gray-50" : "border-gray-200"} p-4 flex items-center gap-4 bg-white`}>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${ann.isActive ? "text-gray-900" : "text-gray-400 line-through"}`}>{ann.text}</p>
                                {ann.link && <p className="text-[10px] text-gray-500">→ {ann.link}</p>}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {!ann.isActive && (
                                    <button
                                        onClick={() => updateAnnouncement.mutate({ id: ann.id, isActive: true })}
                                        className="text-[9px] font-black uppercase tracking-widest border border-gray-300 px-3 py-1 hover:border-gray-900 transition-colors text-gray-700"
                                    >
                                        Activate
                                    </button>
                                )}
                                {ann.isActive && (
                                    <button
                                        onClick={() => updateAnnouncement.mutate({ id: ann.id, isActive: false })}
                                        className="text-[9px] font-black uppercase tracking-widest border border-gray-400 text-gray-600 px-3 py-1 hover:bg-gray-100 transition-colors"
                                    >
                                        Deactivate
                                    </button>
                                )}
                                <button onClick={() => deleteAnnouncement.mutate({ id: ann.id })} className="p-1.5 text-gray-300 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}