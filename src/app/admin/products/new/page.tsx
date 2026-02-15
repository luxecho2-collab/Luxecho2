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
    Plus,
    Info,
    X,
    Eye,
    ChevronLeft,
    ChevronRight,
    Upload,
    Zap,
    Tag as TagIcon,
    FolderPlus,
    Loader2
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

function AdminNewProductPage() {
    const router = useRouter()
    const { toast } = useToast()
    const utils = api.useUtils()

    // Multi-image state
    const [imageUrls, setImageUrls] = React.useState<string[]>([])
    const [activeImageIndex, setActiveImageIndex] = React.useState(0)
    const [isUploading, setIsUploading] = React.useState(false)

    // Category state
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([])
    const [newCategoryName, setNewCategoryName] = React.useState("")
    const [isAddingCategory, setIsAddingCategory] = React.useState(false)

    // SKU state
    const [sku, setSku] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [status, setStatus] = React.useState<"ACTIVE" | "DRAFT" | "ARCHIVED">("ACTIVE")
    const [name, setName] = React.useState("")

    const { data: categories } = api.product.getCategories.useQuery()

    const createProduct = api.admin.createProduct.useMutation({
        onSuccess: () => {
            toast({
                title: "PRODUCT CREATED",
                description: "The new product has been successfully added to the store.",
            })
            utils.admin.getProducts.invalidate()
            router.push("/admin/products")
        },
        onError: (err) => {
            toast({
                title: "CREATION FAILED",
                description: err.message,
                variant: "destructive",
            })
        }
    })

    const createCategory = api.admin.createCategory.useMutation({
        onSuccess: (newCat) => {
            toast({
                title: "CATEGORY ADDED",
                description: `${newCat.name} has been created.`,
            })
            utils.product.getCategories.setData(undefined, (old: any) =>
                old ? [...old, newCat] : [newCat]
            )
            setNewCategoryName("")
            setIsAddingCategory(false)
            setSelectedCategoryIds(prev => [...prev, newCat.id])
        }
    })

    const enhanceDescription = api.admin.enhanceDescription.useMutation({
        onSuccess: (data) => {
            setDescription(data.enhanced)
            toast({
                title: "CONTENT ENHANCED",
                description: "Description has been polished for a premium look.",
            })
        }
    })

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)
        const formData = new FormData()
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i])
        }

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            if (data.urls) {
                const newUrls = data.urls
                setImageUrls(prev => [...prev, ...newUrls])
                // Move setActiveImageIndex out of the updater to avoid nested updates
                setActiveImageIndex(imageUrls.length)
            }
        } catch (err) {
            toast({
                title: "UPLOAD FAILED",
                description: "Could not upload images from PC.",
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleAddImageField = () => {
        setImageUrls([...imageUrls, ""])
        setActiveImageIndex(imageUrls.length)
    }

    const handleRemoveImageField = (index: number) => {
        const newUrls = imageUrls.filter((_, i) => i !== index)
        setImageUrls(newUrls)
        if (activeImageIndex >= newUrls.length && newUrls.length > 0) {
            setActiveImageIndex(newUrls.length - 1)
        } else if (newUrls.length === 0) {
            setActiveImageIndex(0)
        }
    }

    const handleImageUrlChange = (index: number, value: string) => {
        const newUrls = [...imageUrls]
        newUrls[index] = value
        setImageUrls(newUrls)
    }

    const generateSku = () => {
        const random = Math.random().toString(36).substring(2, 9).toUpperCase()
        setSku(`FS-${random}`)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const finalImageUrls = imageUrls.filter(url => url.trim() !== "" && (url.startsWith("http") || url.startsWith("/uploads")))

        createProduct.mutate({
            name: name,
            description: description,
            price: Number(formData.get("price")),
            compareAtPrice: formData.get("compareAtPrice") ? Number(formData.get("compareAtPrice")) : undefined,
            quantity: Number(formData.get("quantity")),
            sku: sku,
            categoryIds: selectedCategoryIds,
            imageUrls: finalImageUrls,
            status: status,
            tags: formData.get("tags") as string,
        })
    }

    return (
        <div className="flex min-h-screen bg-black text-white">
            <main className="flex-grow p-4 md:p-8 space-y-12 max-w-7xl mx-auto">
                <header className="space-y-4 border-b-4 border-white/5 pb-8">
                    <Link href="/admin/products" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Products
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                            NEW <span className="text-neon-green">PRODUCT</span>
                        </h1>
                        <div className="flex items-center gap-4 p-4 bg-charcoal border-2 border-white/5">
                            <Info className="w-5 h-5 text-neon-green" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Product Management Portal
                            </p>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Core Data */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Primary Identity Section */}
                        <section className="space-y-8 p-8 border-4 border-black bg-charcoal relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Package className="w-32 h-32" />
                            </div>

                            <div className="flex items-center gap-4 text-neon-green">
                                <Sparkles className="w-5 h-5" />
                                <h2 className="text-xl font-black uppercase tracking-widest">GENERAL DETAILS</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. CYBER-PULSE OVERSIZED HOODIE"
                                        className="bg-black border-2 border-transparent focus:border-neon-green rounded-none h-14 font-black uppercase placeholder:text-muted-foreground/30 transition-all text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Description</Label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (name && description) {
                                                    enhanceDescription.mutate({ name, description })
                                                } else {
                                                    toast({
                                                        title: "INPUT REQUIRED",
                                                        description: "Please provide a name and brief description first.",
                                                        variant: "destructive"
                                                    })
                                                }
                                            }}
                                            disabled={enhanceDescription.isPending}
                                            className="text-[8px] font-black uppercase tracking-[0.2em] text-neon-green flex items-center gap-1 hover:brightness-125 transition-all disabled:opacity-50"
                                        >
                                            <Sparkles className={cn("w-2.5 h-2.5", enhanceDescription.isPending && "animate-pulse")} />
                                            {enhanceDescription.isPending ? "POLISHING..." : "MAGIC ENHANCE"}
                                        </button>
                                    </div>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter details about the fabric, fit, and style..."
                                        className="bg-black border-2 border-transparent focus:border-neon-green rounded-none min-h-[250px] font-medium placeholder:text-muted-foreground/30 transition-all leading-relaxed"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Value & Inventory Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-8 p-8 border-4 border-black bg-charcoal">
                                <div className="flex items-center gap-4 text-neon-green">
                                    <h2 className="text-xl font-black uppercase tracking-widest">PRICING</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price (₹)</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-neon-green">₹</span>
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="0.00"
                                                className="bg-black border-2 border-transparent focus:border-neon-green rounded-none h-14 font-black pl-8 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="compareAtPrice" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Compare at Price (₹)</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground">₹</span>
                                            <Input
                                                id="compareAtPrice"
                                                name="compareAtPrice"
                                                type="number"
                                                step="0.01"
                                                placeholder="Original price for discount"
                                                className="bg-black border-2 border-transparent focus:border-neon-green rounded-none h-14 font-black pl-8 transition-all opacity-70"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8 p-8 border-4 border-black bg-charcoal">
                                <div className="flex items-center gap-4 text-neon-green">
                                    <h2 className="text-xl font-black uppercase tracking-widest">INVENTORY</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end mb-1">
                                            <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                Unique ID (SKU)
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={generateSku}
                                                className="text-[8px] font-black uppercase tracking-[0.2em] text-neon-green flex items-center gap-1 hover:brightness-125 transition-all"
                                            >
                                                <Zap className="w-2 h-2" /> Auto-Generate
                                            </button>
                                        </div>
                                        <Input
                                            id="sku"
                                            name="sku"
                                            required
                                            value={sku}
                                            onChange={(e) => setSku(e.target.value.toUpperCase())}
                                            placeholder="FS-TECH-001"
                                            className="bg-black border-2 border-transparent focus:border-neon-green rounded-none h-14 font-black uppercase placeholder:text-muted-foreground/30 transition-all font-mono"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="quantity" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Stock Quantity</Label>
                                        <Input
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            required
                                            placeholder="0"
                                            className="bg-black border-2 border-transparent focus:border-neon-green rounded-none h-14 font-black transition-all"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Right Column: Visuals & Meta */}
                    <div className="lg:col-span-4 space-y-12">
                        {/* Visual Preview Section */}
                        <section className="space-y-8 p-8 border-4 border-black bg-charcoal flex flex-col">
                            <div className="flex items-center gap-4 text-neon-green">
                                <Eye className="w-5 h-5" />
                                <h2 className="text-xl font-black uppercase tracking-widest">VISUAL FEED</h2>
                            </div>

                            {/* main preview */}
                            <div className="aspect-[3/4] relative bg-black border-4 border-white/5 overflow-hidden group mb-4">
                                <AnimatePresence mode="wait">
                                    {imageUrls[activeImageIndex] ? (
                                        <motion.div
                                            key={imageUrls[activeImageIndex]}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0"
                                        >
                                            <Image
                                                src={imageUrls[activeImageIndex]}
                                                alt={`Preview ${activeImageIndex + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </motion.div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/20 text-center p-8">
                                            <ImageIcon className="w-16 h-16 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                                Awaiting Assets...
                                            </p>
                                        </div>
                                    )}
                                </AnimatePresence>

                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                                        <Loader2 className="w-8 h-8 text-neon-green animate-spin" />
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 backdrop-blur-md flex justify-between items-center z-10">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-neon-green">
                                        {imageUrls.length > 0 ? `Asset ${activeImageIndex + 1}/${imageUrls.length}` : "No Assets"}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-none border border-white/10"
                                            onClick={() => setActiveImageIndex(prev => Math.max(0, prev - 1))}
                                            disabled={activeImageIndex === 0}
                                        >
                                            <ChevronLeft className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 rounded-none border border-white/10"
                                            onClick={() => setActiveImageIndex(prev => Math.min(imageUrls.length - 1, prev + 1))}
                                            disabled={activeImageIndex === imageUrls.length - 1}
                                        >
                                            <ChevronRight className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* thumbnail track */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                {imageUrls.map((url, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={cn(
                                            "w-12 h-16 border-2 flex-shrink-0 transition-all overflow-hidden relative cursor-pointer",
                                            activeImageIndex === i ? "border-neon-green scale-105" : "border-white/5 opacity-50 grayscale hover:opacity-100 hover:grayscale-0"
                                        )}
                                    >
                                        <Image src={url} alt="" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveImageField(i); }}
                                            className="absolute top-0 right-0 p-0.5 bg-black/80 text-white hover:text-electric-pink opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <X className="w-2 h-2" />
                                        </button>
                                    </div>
                                ))}

                                <label className="w-12 h-16 flex-shrink-0 border-2 border-dashed border-white/10 rounded-none hover:border-neon-green transition-colors cursor-pointer flex flex-col items-center justify-center group">
                                    <Upload className="w-4 h-4 text-muted-foreground group-hover:text-neon-green transition-colors" />
                                    <span className="text-[6px] font-black uppercase mt-1 text-muted-foreground">PC</span>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
                                </label>

                                <Button
                                    type="button"
                                    onClick={handleAddImageField}
                                    variant="outline"
                                    className="w-12 h-16 flex-shrink-0 border-2 border-dashed border-white/10 rounded-none hover:border-white/30 p-0"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Asset URLs / Local Paths</Label>
                                <div className="space-y-3">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="flex gap-2">
                                            <div className="relative flex-grow">
                                                <Input
                                                    type="text"
                                                    placeholder="https://..."
                                                    value={url}
                                                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                                    onFocus={() => setActiveImageIndex(index)}
                                                    className={cn(
                                                        "bg-black border-2 rounded-none h-12 font-medium transition-all text-[10px]",
                                                        activeImageIndex === index ? "border-neon-green" : "border-white/5"
                                                    )}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => handleRemoveImageField(index)}
                                                className="h-12 w-12 border-2 border-white/10 rounded-none hover:bg-electric-pink hover:text-white hover:border-electric-pink transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Status & Category */}
                        <section className="space-y-8 p-8 border-4 border-black bg-charcoal">
                            <div className="flex items-center gap-4 text-neon-green">
                                <TagIcon className="w-5 h-5" />
                                <h2 className="text-xl font-black uppercase tracking-widest">CATEGORIES</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 block mb-4">Select Categories (Multi-select)</Label>
                                    <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neon-green">
                                        {categories?.map((cat) => {
                                            const isSelected = selectedCategoryIds.includes(cat.id);
                                            return (
                                                <div
                                                    key={cat.id}
                                                    className={cn(
                                                        "flex items-center space-x-3 bg-black/40 p-3 border transition-all cursor-pointer group",
                                                        isSelected ? "border-neon-green bg-neon-green/5" : "border-white/5 hover:border-neon-green/30"
                                                    )}
                                                    onClick={() => {
                                                        setSelectedCategoryIds(prev =>
                                                            prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                                                        )
                                                    }}
                                                >
                                                    <Checkbox
                                                        id={cat.id}
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => {
                                                            setSelectedCategoryIds(prev =>
                                                                checked
                                                                    ? [...prev, cat.id]
                                                                    : prev.filter(id => id !== cat.id)
                                                            )
                                                        }}
                                                        className="border-neon-green data-[state=checked]:bg-neon-green data-[state=checked]:text-black rounded-none"
                                                    />
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest transition-colors",
                                                        isSelected ? "text-neon-green" : "text-muted-foreground group-hover:text-white"
                                                    )}>
                                                        {cat.name}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Quick Add Category */}
                                <div className="pt-4 border-t border-white/5 space-y-4">
                                    {!isAddingCategory ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-2 border-dashed border-white/10 rounded-none h-12 text-[10px] font-black uppercase tracking-widest hover:border-neon-green hover:text-neon-green transition-all"
                                            onClick={() => setIsAddingCategory(true)}
                                        >
                                            <FolderPlus className="w-4 h-4 mr-2" /> Quick Add Category
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Input
                                                placeholder="NEW CATEGORY NAME"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value.toUpperCase())}
                                                className="bg-black border-2 border-neon-green rounded-none h-12 font-black text-xs"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    className="flex-grow bg-neon-green text-black font-black uppercase text-[10px] rounded-none h-10"
                                                    disabled={!newCategoryName || createCategory.isPending}
                                                    onClick={() => createCategory.mutate({ name: newCategoryName })}
                                                >
                                                    SAVE CATEGORY
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="border border-white/10 rounded-none h-10 px-4"
                                                    onClick={() => setIsAddingCategory(false)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 pt-6 border-t border-white/5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Lifecycle Status</Label>
                                    <Select value={status} onValueChange={(v: "ACTIVE" | "DRAFT" | "ARCHIVED") => {
                                        if (v !== status) setStatus(v);
                                    }}>
                                        <SelectTrigger className="bg-black border-2 border-charcoal focus:border-neon-green rounded-none h-14 font-black uppercase">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-charcoal border-2 border-black rounded-none">
                                            <SelectItem value="ACTIVE" className="uppercase font-black text-[10px] tracking-widest text-neon-green">Live</SelectItem>
                                            <SelectItem value="DRAFT" className="uppercase font-black text-[10px] tracking-widest text-white">Draft</SelectItem>
                                            <SelectItem value="ARCHIVED" className="uppercase font-black text-[10px] tracking-widest text-electric-pink">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Tags (comma separated)</Label>
                                    <Input
                                        id="tags"
                                        name="tags"
                                        placeholder="STREETWEAR, NEON, TECH"
                                        className="bg-black border-2 border-transparent focus:border-neon-green rounded-none h-14 font-black uppercase placeholder:text-muted-foreground/30 transition-all text-xs"
                                    />
                                </div>
                            </div>
                        </section>

                        <Button
                            type="submit"
                            disabled={createProduct.isPending}
                            className="w-full bg-neon-green text-black font-black uppercase text-xl rounded-none h-24 shadow-[12px_12px_0px_#fff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
                        >
                            {createProduct.isPending ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    SYNCING DATA...
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="w-6 h-6 mr-3" />
                                        DEPLOY PRODUCT
                                    </div>
                                    <span className="text-[8px] tracking-[0.4em] mt-1 text-black/60">Launch to public storefront</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default AdminNewProductPage;
