"use client"

import * as React from "react"
import { api } from "@/trpc/react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Package,
    Sparkles,
    Image as ImageIcon,
    CheckCircle2,
    Check,
    Plus,
    X,
    Eye,
    ChevronLeft,
    ChevronRight,
    Upload,
    Zap,
    Tag as TagIcon,
    Loader2,
    Search,
    FileText
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { LuxechoLogo } from "@/components/layout/luxecho-logo"

interface ProductFormData {
    name: string
    description: string
    price: string
    compareAtPrice: string
    sku: string
    quantity: string
    status: "ACTIVE" | "DRAFT" | "ARCHIVED"
    tags: string
    metaTitle: string
    metaDescription: string
    productInfo: string
    shippingReturns: string
    additionalInfo: string
    imageUrls: string[]
    selectedCategoryIds: string[]
    sizes: string[]
    attributes: { key: string; value: string }[]
}

const INITIAL_FORM_STATE: ProductFormData = {
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    quantity: "0",
    status: "ACTIVE",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    productInfo: "",
    shippingReturns: "",
    additionalInfo: "",
    imageUrls: [],
    selectedCategoryIds: [],
    sizes: [],
    attributes: [
        { key: "Composition", value: "" },
        { key: "Wash Care", value: "" },
        { key: "Origin", value: "" }
    ]
}

export default function AdminNewProductPage() {
    const router = useRouter()
    const { toast } = useToast()
    const utils = api.useUtils()

    // Combined form state
    const [formData, setFormData] = React.useState<ProductFormData>(INITIAL_FORM_STATE)

    // UI Only state
    const [activeImageIndex, setActiveImageIndex] = React.useState(0)
    const [isUploading, setIsUploading] = React.useState(false)
    const [isAddingCategory, setIsAddingCategory] = React.useState(false)
    const [newCategoryName, setNewCategoryName] = React.useState("")

    const { data: categories } = api.product.getCategories.useQuery()

    const createProduct = api.admin.createProduct.useMutation({
        onSuccess: () => {
            toast({
                title: "MANIFEST UPDATED",
                description: "New product record has been successfully deployed.",
            })
            utils.admin.getProducts.invalidate()
            router.push("/admin/products")
        },
        onError: (err: any) => {
            toast({
                title: "DEPLOYMENT ERROR",
                description: err.message,
                variant: "destructive",
            })
        }
    })

    const createCategory = api.admin.createCategory.useMutation({
        onSuccess: (newCat) => {
            toast({
                title: "CLASS CREATED",
                description: `${newCat.name} has been added to the register.`,
            })
            utils.product.getCategories.invalidate()
            setNewCategoryName("")
            setIsAddingCategory(false)
            setFormData(prev => ({
                ...prev,
                selectedCategoryIds: [...prev.selectedCategoryIds, newCat.id]
            }))
        }
    })

    const enhanceDescription = api.admin.enhanceDescription.useMutation({
        onSuccess: (data) => {
            setFormData(prev => ({ ...prev, description: data.enhanced }))
            toast({
                title: "CONTENT REFINED",
                description: "AI-enhanced copy has been applied to the manifest.",
            })
        }
    })

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        const uploadData = new FormData()
        for (let i = 0; i < files.length; i++) {
            uploadData.append("files", files[i])
        }

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData
            })
            const data = await res.json()
            if (data.urls) {
                const newUrls = data.urls
                setFormData(prev => {
                    const nextUrls = [...prev.imageUrls, ...newUrls]
                    setActiveImageIndex(prev.imageUrls.length)
                    return { ...prev, imageUrls: nextUrls }
                })
            }
        } catch (err) {
            toast({
                title: "UPLOAD FAILED",
                description: "Failed to transmit asset data.",
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleAddImageField = () => {
        setFormData(prev => {
            const nextUrls = [...prev.imageUrls, ""]
            setActiveImageIndex(prev.imageUrls.length)
            return { ...prev, imageUrls: nextUrls }
        })
    }

    const handleRemoveImageField = (index: number) => {
        const newUrls = formData.imageUrls.filter((_, i) => i !== index)
        setFormData(prev => ({ ...prev, imageUrls: newUrls }))

        if (activeImageIndex >= newUrls.length && newUrls.length > 0) {
            setActiveImageIndex(newUrls.length - 1)
        } else if (newUrls.length === 0) {
            setActiveImageIndex(0)
        }
    }

    const handleImageUrlChange = (index: number, value: string) => {
        const newUrls = [...formData.imageUrls]
        newUrls[index] = value
        setFormData(prev => ({ ...prev, imageUrls: newUrls }))
    }

    const generateSku = () => {
        const random = Math.random().toString(36).substring(2, 9).toUpperCase()
        setFormData(prev => ({ ...prev, sku: `LX-${random}` }))
    }

    const addAttribute = () => setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { key: "", value: "" }]
    }))

    const removeAttribute = (index: number) => setFormData(prev => ({
        ...prev,
        attributes: prev.attributes.filter((_, i) => i !== index)
    }))

    const updateAttribute = (index: number, field: 'key' | 'value', value: string) => {
        setFormData(prev => {
            const newAttrs = [...prev.attributes]
            newAttrs[index] = { ...newAttrs[index]!, [field]: value }
            return { ...prev, attributes: newAttrs }
        })
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const finalImageUrls = formData.imageUrls.filter(url =>
            url.trim() !== "" && (url.startsWith("http") || url.startsWith("/uploads") || url.startsWith("https") || url.startsWith("blob:"))
        )

        createProduct.mutate({
            ...formData,
            price: Number(formData.price),
            compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
            quantity: Number(formData.quantity),
            imageUrls: finalImageUrls,
            categoryIds: formData.selectedCategoryIds,
        })
    }

    return (
        <div className="flex min-h-screen bg-white text-black">
            <main className="flex-grow p-10 lg:p-16 space-y-16 max-w-7xl mx-auto">
                <header className="space-y-6">
                    <Link href="/admin/products" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all group">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Back to Ledger
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                                INITIAL <span className="text-gray-200">ENTRY</span>
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400">
                                Deploying New Asset to Storefront Manifest
                            </p>
                        </div>
                        <div className="flex items-center gap-4 p-5 border border-gray-100 bg-white">
                            <LuxechoLogo size={24} />
                            <p className="text-[9px] font-black uppercase tracking-widest text-black">
                                Entry Serial: LX-{Date.now().toString().slice(-6)}
                            </p>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-8 space-y-16">
                        <section className="space-y-10 p-10 border border-gray-50 bg-white relative overflow-hidden group hover:border-black transition-all duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <Package className="w-48 h-48" />
                            </div>

                            <div className="flex items-center gap-5">
                                <h2 className="text-2xl font-black uppercase tracking-tight">Core Specifications</h2>
                                <div className="h-[1px] flex-grow bg-gray-50" />
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Asset Designation</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="E.G. LUXECHO SILK SHIRT"
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black uppercase placeholder:text-gray-200 transition-all text-xl pr-10"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end mb-1">
                                        <Label htmlFor="description" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Manifest Description</Label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (formData.name && formData.description) {
                                                    enhanceDescription.mutate({ name: formData.name, description: formData.description })
                                                } else {
                                                    toast({
                                                        title: "DATA DEFICIENCY",
                                                        description: "Please provide a name and brief notes first.",
                                                        variant: "destructive"
                                                    })
                                                }
                                            }}
                                            disabled={enhanceDescription.isPending}
                                            className="text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-2 hover:translate-x-1 transition-all disabled:opacity-50"
                                        >
                                            <Sparkles className={cn("w-3 h-3", enhanceDescription.isPending && "animate-pulse")} />
                                            {enhanceDescription.isPending ? "Refining..." : "AI Enhancement"}
                                        </button>
                                    </div>
                                    <Textarea
                                        id="description"
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe the aesthetic, material composition, and silhouette..."
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none min-h-[300px] font-medium placeholder:text-gray-200 transition-all leading-relaxed text-sm p-8"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-10 p-10 border border-gray-50 bg-white hover:border-black transition-all duration-500">
                            <div className="flex items-center gap-5">
                                <FileText className="w-5 h-5 text-gray-300" />
                                <h2 className="text-xl font-black uppercase tracking-tight">Extended Details</h2>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Technical Specifications</Label>
                                        <Button
                                            type="button"
                                            onClick={addAttribute}
                                            variant="ghost"
                                            className="text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-2 hover:translate-x-1 transition-all"
                                        >
                                            <Plus className="w-3 h-3" /> Add Spec
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {formData.attributes.map((attr, idx) => (
                                            <div key={idx} className="flex gap-3 group">
                                                <Input
                                                    placeholder="KEY (E.G. COMPOSITION)"
                                                    value={attr.key}
                                                    onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
                                                    className="bg-gray-50 border-none rounded-none h-12 text-[10px] font-black uppercase tracking-widest flex-1"
                                                />
                                                <Input
                                                    placeholder="VALUE (E.G. 100% COTTON)"
                                                    value={attr.value}
                                                    onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                                                    className="bg-gray-50 border-none rounded-none h-12 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex-[2]"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeAttribute(idx)}
                                                    className="h-12 w-12 border border-gray-50 rounded-none hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                                        These values will appear in the "Product Information" section on the public page.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="shippingReturns" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Logistics Policy</Label>
                                    <Textarea
                                        id="shippingReturns"
                                        value={formData.shippingReturns}
                                        onChange={(e) => setFormData(prev => ({ ...prev, shippingReturns: e.target.value }))}
                                        placeholder="Shipping timelines, return window, global delivery notes..."
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none min-h-[150px] font-medium placeholder:text-gray-200 transition-all text-xs p-5"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="additionalInfo" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Archive Notes</Label>
                                    <Textarea
                                        id="additionalInfo"
                                        value={formData.additionalInfo}
                                        onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                                        placeholder="Styling tips, limited edition details, brand story snippets..."
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none min-h-[150px] font-medium placeholder:text-gray-200 transition-all text-xs p-5"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <section className="space-y-10 p-10 border border-gray-50 bg-white hover:border-black transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <h2 className="text-xl font-black uppercase tracking-tight">Valuation</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end mb-1">
                                            <Label htmlFor="price" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Listing Price (INR)</Label>
                                            {(Number(formData.compareAtPrice) > 0 && Number(formData.price) > 0 && Number(formData.compareAtPrice) > Number(formData.price)) && (
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                                                    -{Math.round(((Number(formData.compareAtPrice) - Number(formData.price)) / Number(formData.compareAtPrice)) * 100)}% Discount
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-black">₹</span>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                required
                                                value={formData.price}
                                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                                placeholder="0.00"
                                                className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black pl-12 transition-all tabular-nums"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="compareAtPrice" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Archive Price (Optional)</Label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-200">₹</span>
                                            <Input
                                                id="compareAtPrice"
                                                type="number"
                                                step="0.01"
                                                value={formData.compareAtPrice}
                                                onChange={(e) => setFormData(prev => ({ ...prev, compareAtPrice: e.target.value }))}
                                                placeholder="Original price"
                                                className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black pl-12 transition-all opacity-70 tabular-nums placeholder:text-gray-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-10 p-10 border border-gray-50 bg-white hover:border-black transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <h2 className="text-xl font-black uppercase tracking-tight">Reserve</h2>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end mb-1">
                                            <Label htmlFor="sku" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Registry Code (SKU)</Label>
                                            <button
                                                type="button"
                                                onClick={generateSku}
                                                className="text-[9px] font-black uppercase tracking-widest text-black flex items-center gap-2 hover:translate-x-1 transition-all"
                                            >
                                                <Zap className="w-2.5 h-2.5" /> Auto-Code
                                            </button>
                                        </div>
                                        <Input
                                            id="sku"
                                            required
                                            value={formData.sku}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                                            placeholder="LX-SPEC-001"
                                            className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black uppercase placeholder:text-gray-200 transition-all font-mono tracking-widest"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="quantity" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Stock Reserve</Label>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            required
                                            value={formData.quantity}
                                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                            placeholder="0"
                                            className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black transition-all tabular-nums placeholder:text-gray-200"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-10 p-10 border border-gray-50 bg-white hover:border-black transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <h2 className="text-xl font-black uppercase tracking-tight">Size Matrix</h2>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1 block mb-2">Available Dimensions</Label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {["S", "M", "L", "XL"].map((size) => {
                                            const isSelected = formData.sizes.includes(size);
                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            sizes: prev.sizes.includes(size)
                                                                ? prev.sizes.filter(s => s !== size)
                                                                : [...prev.sizes, size]
                                                        }))
                                                    }}
                                                    className={cn(
                                                        "h-14 border text-[10px] font-black uppercase tracking-widest transition-all",
                                                        isSelected
                                                            ? "bg-black text-white border-black"
                                                            : "bg-gray-50 text-gray-400 border-gray-50 hover:border-gray-200"
                                                    )}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-4">
                                        Refined standard: S, M, L, XL configuration.
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-16">
                        <section className="space-y-10 p-10 border border-gray-50 bg-white flex flex-col hover:border-black transition-all duration-500">
                            <div className="flex items-center gap-5">
                                <Eye className="w-5 h-5 text-gray-300" />
                                <h2 className="text-xl font-black uppercase tracking-tight">Visual Stream</h2>
                            </div>

                            <div className="aspect-[3/4] relative bg-gray-50 border border-gray-100 overflow-hidden group mb-6">
                                <AnimatePresence mode="wait">
                                    {formData.imageUrls[activeImageIndex] ? (
                                        <motion.div
                                            key={formData.imageUrls[activeImageIndex]}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0"
                                        >
                                            <Image
                                                src={formData.imageUrls[activeImageIndex]}
                                                alt={`Preview ${activeImageIndex + 1}`}
                                                fill
                                                className="object-cover"
                                                quality={100}
                                                priority
                                            />
                                        </motion.div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-200 text-center p-10">
                                            <ImageIcon className="w-16 h-16 mb-6 opacity-20" />
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] leading-relaxed">
                                                Awaiting Assets
                                            </p>
                                        </div>
                                    )}
                                </AnimatePresence>

                                {isUploading && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                                        <Loader2 className="w-10 h-10 text-black animate-spin" />
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-50 flex justify-between items-center z-10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-black">
                                        {formData.imageUrls.length > 0 ? `${activeImageIndex + 1} / ${formData.imageUrls.length}` : "No Assets"}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-none border border-gray-100 hover:bg-black hover:text-white transition-all"
                                            onClick={() => setActiveImageIndex(prev => Math.max(0, prev - 1))}
                                            disabled={activeImageIndex === 0}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-none border border-gray-100 hover:bg-black hover:text-white transition-all"
                                            onClick={() => setActiveImageIndex(prev => Math.min(formData.imageUrls.length - 1, prev + 1))}
                                            disabled={activeImageIndex === formData.imageUrls.length - 1}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                                {formData.imageUrls.map((url, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={cn(
                                            "w-14 h-20 border flex-shrink-0 transition-all overflow-hidden relative cursor-pointer",
                                            activeImageIndex === i ? "border-black scale-105 z-10" : "border-gray-100 opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
                                        )}
                                    >
                                        <Image src={url} alt="" fill className="object-cover" quality={60} />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveImageField(i); }}
                                            className="absolute top-0 right-0 p-1 bg-black text-white hover:bg-red-500 opacity-0 group-hover/thumb:opacity-100 transition-opacity z-10"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                <label className="w-14 h-20 flex-shrink-0 border border-dashed border-gray-200 rounded-none hover:border-black transition-colors cursor-pointer flex flex-col items-center justify-center group/upload">
                                    <Upload className="w-5 h-5 text-gray-300 group-hover/upload:text-black transition-colors" />
                                    <span className="text-[7px] font-black uppercase mt-1 text-gray-300 group-hover/upload:text-black">PC</span>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
                                </label>

                                <Button
                                    type="button"
                                    onClick={handleAddImageField}
                                    variant="outline"
                                    className="w-14 h-20 flex-shrink-0 border border-dashed border-gray-200 rounded-none hover:border-black p-0"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="space-y-5">
                                <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Asset Links</Label>
                                <div className="space-y-4">
                                    {formData.imageUrls.map((url, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="HTTPS://..."
                                                value={url}
                                                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                                onFocus={() => setActiveImageIndex(index)}
                                                className={cn(
                                                    "bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-12 font-medium transition-all text-[10px] pr-4",
                                                    activeImageIndex === index ? "ring-1 ring-black" : ""
                                                )}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => handleRemoveImageField(index)}
                                                className="h-12 w-12 border border-gray-100 rounded-none hover:bg-black hover:text-white transition-colors flex-shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-10 p-10 border border-gray-50 bg-white hover:border-black transition-all duration-500">
                            <div className="flex items-center gap-5">
                                <Search className="w-5 h-5 text-gray-300" />
                                <h2 className="text-xl font-black uppercase tracking-tight">SEO Optimization</h2>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <Label htmlFor="metaTitle" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Meta Title</Label>
                                    <Input
                                        id="metaTitle"
                                        placeholder="SEO Title (Recommended < 60 chars)"
                                        value={formData.metaTitle}
                                        onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black uppercase placeholder:text-gray-200 transition-all text-[10px] tracking-widest"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="metaDescription" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Meta Description</Label>
                                    <Textarea
                                        id="metaDescription"
                                        placeholder="Brief summary for search engine results..."
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none min-h-[120px] font-medium placeholder:text-gray-200 transition-all text-xs p-5"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-10 p-10 border border-gray-50 bg-white hover:border-black transition-all duration-500">
                            <div className="flex items-center gap-5">
                                <TagIcon className="w-5 h-5 text-gray-300" />
                                <h2 className="text-xl font-black uppercase tracking-tight">Classification</h2>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1 block mb-2">Category Matrix</Label>
                                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                                        {categories?.map((cat) => {
                                            const isSelected = formData.selectedCategoryIds.includes(cat.id);
                                            return (
                                                <div
                                                    key={cat.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 border transition-all cursor-pointer group",
                                                        isSelected ? "border-black bg-black text-white" : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"
                                                    )}
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            selectedCategoryIds: prev.selectedCategoryIds.includes(cat.id)
                                                                ? prev.selectedCategoryIds.filter(id => id !== cat.id)
                                                                : [...prev.selectedCategoryIds, cat.id]
                                                        }))
                                                    }}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                                                    <div className={cn(
                                                        "w-4 h-4 border flex items-center justify-center transition-all",
                                                        isSelected ? "bg-white border-white" : "border-white/20"
                                                    )}>
                                                        {isSelected && <Check className="w-3 h-3 text-black" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-50 space-y-5">
                                    {!isAddingCategory ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border border-dashed border-gray-200 rounded-none h-14 text-[9px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all"
                                            onClick={() => setIsAddingCategory(true)}
                                        >
                                            <Plus className="w-4 h-4 mr-3" /> New Class
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-400">
                                            <Input
                                                placeholder="NEW CLASS NAME"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
                                                className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-14 font-black text-[10px] tracking-widest"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    className="flex-grow bg-black text-white font-black uppercase text-[10px] tracking-widest rounded-none h-12"
                                                    disabled={!newCategoryName || createCategory.isPending}
                                                    onClick={() => createCategory.mutate({ name: newCategoryName })}
                                                >
                                                    Deploy Class
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="border border-gray-100 rounded-none h-12 px-5"
                                                    onClick={() => setIsAddingCategory(false)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-10 border-t border-gray-50">
                                    <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Lifecycle Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={React.useCallback((v: "ACTIVE" | "DRAFT" | "ARCHIVED") => {
                                            setFormData(prev => (prev.status !== v ? { ...prev, status: v } : prev));
                                        }, [])}
                                    >
                                        <SelectTrigger className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black uppercase text-[10px] tracking-widest">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-100 rounded-none">
                                            <SelectItem value="ACTIVE" className="uppercase font-black text-[9px] tracking-widest text-black">Live Deployment</SelectItem>
                                            <SelectItem value="DRAFT" className="uppercase font-black text-[9px] tracking-widest text-gray-400">Sandbox Draft</SelectItem>
                                            <SelectItem value="ARCHIVED" className="uppercase font-black text-[9px] tracking-widest text-red-500">Archived Record</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="tags" className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Metadata Tags</Label>
                                    <Input
                                        id="tags"
                                        value={formData.tags}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.toUpperCase() }))}
                                        placeholder="MINIMAL, PREMIUM, LUXURY"
                                        className="bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-black rounded-none h-16 font-black uppercase placeholder:text-gray-200 transition-all text-[10px] tracking-widest"
                                    />
                                </div>
                            </div>
                        </section>

                        <Button
                            type="submit"
                            disabled={createProduct.isPending}
                            className="w-full bg-black text-white font-black uppercase text-2xl rounded-none h-24 shadow-[16px_16px_0px_#f3f4f6] hover:shadow-none hover:translate-x-1 hover:-translate-y-1 transition-all duration-500 disabled:opacity-50"
                        >
                            {createProduct.isPending ? (
                                <div className="flex items-center gap-5">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    SYNCING MANIFEST...
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-4">
                                        <CheckCircle2 className="w-7 h-7" />
                                        DEPLOY ASSET
                                    </div>
                                    <span className="text-[9px] tracking-[0.5em] mt-1 text-white/40">Authorize and Launch to Public Stream</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}