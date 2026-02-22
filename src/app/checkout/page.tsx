"use client"

import * as React from "react"
import { useCart } from "@/store/use-cart"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, ChevronRight, Lock, Truck, Tag, CheckCircle2, BookmarkCheck, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useSession } from "next-auth/react"

const checkoutSchema = z.object({
    email: z.string().email("Valid email required"),
    phone: z.string().min(10, "Valid phone number required"),
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    address: z.string().min(5, "Full address required"),
    city: z.string().min(1, "City required"),
    state: z.string().min(1, "State required"),
    postalCode: z.string().min(4, "Valid postal code required"),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const STEPS = ["Information", "Shipping", "Payment"]

export default function CheckoutPage() {
    const { items, getTotalPrice } = useCart()
    const { data: session } = useSession()
    const [step, setStep] = React.useState(1)
    const [shippingMethod, setShippingMethod] = React.useState<"standard" | "express">("standard")
    const [saveAddress, setSaveAddress] = React.useState(true)
    const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(null)

    const [couponCode, setCouponCode] = React.useState("")
    const [appliedCoupon, setAppliedCoupon] = React.useState<{
        code: string
        discountType: "PERCENTAGE" | "FIXED"
        discountValue: number
    } | null>(null)
    const [couponError, setCouponError] = React.useState<string | null>(null)
    // Stores Razorpay config after order creation — opened on direct user click
    const [pendingRzpOptions, setPendingRzpOptions] = React.useState<any>(null)

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { email: "", phone: "", firstName: "", lastName: "", address: "", city: "", state: "", postalCode: "" }
    })

    const { register, handleSubmit, formState: { errors }, trigger, setValue, getValues } = form

    // ── Fetch saved addresses if logged in ──
    const { data: savedAddresses } = api.account.getAddresses.useQuery(undefined, {
        enabled: !!session?.user,
    })

    // ── Fetch dynamic shipping settings ──
    const { data: shippingSettings } = api.checkout.getShippingSettings.useQuery()
    const expressPrice = shippingSettings?.expressPrice ?? 2000
    const expressLabel = shippingSettings?.expressLabel ?? "Express Shipping"
    const expressDays = shippingSettings?.expressDays ?? "1–2 Business Days"

    // ── Auto-fill from default/first saved address ──
    React.useEffect(() => {
        if (savedAddresses && savedAddresses.length > 0 && !getValues("address")) {
            const defaultAddr = savedAddresses.find(a => a.isDefault) ?? savedAddresses[0]!
            setSelectedAddressId(defaultAddr.id)
            setValue("address", defaultAddr.street)
            setValue("city", defaultAddr.city)
            setValue("state", defaultAddr.state)
            setValue("postalCode", defaultAddr.zip)
        }
    }, [savedAddresses])

    // ── Auto-fill email from session ──
    React.useEffect(() => {
        if (session?.user?.email && !getValues("email")) {
            setValue("email", session.user.email)
        }
        if (session?.user?.name && !getValues("firstName")) {
            const parts = session.user.name.split(" ")
            setValue("firstName", parts[0] ?? "")
            setValue("lastName", parts.slice(1).join(" "))
        }
    }, [session])

    const validateCouponQuery = api.checkout.validateCoupon.useQuery(
        { code: couponCode },
        { enabled: false }
    )
    const createOrder = api.checkout.createOrder.useMutation()
    const verifyPayment = api.checkout.verifyPayment.useMutation()
    const createAddress = api.account.createAddress.useMutation()

    const handleApplyCoupon = async () => {
        setCouponError(null)
        if (!couponCode.trim()) return
        const { data } = await validateCouponQuery.refetch()
        if (data?.valid) {
            setAppliedCoupon({
                code: couponCode.toUpperCase(),
                discountType: data.discountType as any,
                discountValue: data.discountValue ?? 0,
            })
            setCouponCode("")
        } else {
            setCouponError(data?.message || "Invalid coupon code")
        }
    }

    // ── Fill form when an address card is clicked ──
    const applyAddress = (addr: NonNullable<typeof savedAddresses>[0]) => {
        setSelectedAddressId(addr.id)
        setValue("address", addr.street)
        setValue("city", addr.city)
        setValue("state", addr.state)
        setValue("postalCode", addr.zip)
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 px-4">
                <ShoppingBag className="w-16 h-16 text-black/20" />
                <h1 className="text-4xl font-black uppercase tracking-tight text-black">
                    Your Bag is <span className="text-black/30">Empty</span>
                </h1>
                <Link href="/products">
                    <Button className="bg-black text-white font-black uppercase tracking-widest rounded-none px-12 h-14 hover:bg-black/90">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        )
    }

    const nextStep = async () => {
        if (step === 1) {
            const isValid = await trigger()
            if (isValid) setStep(2)
        } else if (step === 2) {
            setStep(3)
        }
    }

    const shippingCost = shippingMethod === "express" ? expressPrice : 0
    const subtotal = getTotalPrice()

    let discount = 0
    if (appliedCoupon) {
        if (appliedCoupon.discountType === "PERCENTAGE") {
            discount = (subtotal * appliedCoupon.discountValue) / 100
        } else {
            discount = Math.min(subtotal, appliedCoupon.discountValue)
        }
    }

    const total = Math.max(0, subtotal + shippingCost - discount)

    const handlePayment = async (data: CheckoutFormData) => {
        try {
            // Save new address to profile if requested
            if (session?.user && saveAddress && !selectedAddressId) {
                createAddress.mutate({
                    street: data.address,
                    city: data.city,
                    state: data.state,
                    zip: data.postalCode,
                    country: "India",
                    isDefault: !savedAddresses || savedAddresses.length === 0,
                })
            }

            const resp = await createOrder.mutateAsync({
                amount: total,
                customerInfo: {
                    email: data.email,
                    phone: data.phone,
                    firstName: data.firstName,
                    lastName: data.lastName,
                },
                shippingAddress: {
                    street: data.address,
                    city: data.city,
                    state: data.state,
                    zip: data.postalCode,
                    country: "India",
                },
                items: items.map(item => ({
                    id: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                })),
                couponCode: appliedCoupon?.code,
            })

            // Store options — DO NOT call rzp.open() here (breaks gesture chain)
            // The browser blocks popups triggered after async network calls.
            // Instead, we update state and the user clicks the button below which
            // directly calls rzp.open() preserving the user-gesture requirement.
            setPendingRzpOptions({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
                amount: resp.amount,
                currency: resp.currency,
                name: "Luxecho",
                description: "Secure Checkout",
                order_id: resp.id,
                handler: async (response: any) => {
                    const verifyResp = await verifyPayment.mutateAsync({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: resp.orderId,
                    })
                    if (verifyResp.success) {
                        window.location.href = `/order-success?id=${resp.orderId}`
                    }
                },
                prefill: { name: `${data.firstName} ${data.lastName}`, email: data.email },
                theme: { color: "#000000" },
            })
        } catch (error) {
            console.error("Payment failed", error)
            alert("Payment initialization failed. Please try again.")
        }
    }

    // Direct click handler — must be called synchronously from a click event
    const openRazorpay = () => {
        if (!pendingRzpOptions) return
        const rzp = new (window as any).Razorpay(pendingRzpOptions)
        rzp.open()
    }

    const inputCls = (hasError?: boolean) =>
        cn("bg-white border rounded-none h-12 text-black placeholder:text-black/30 focus-visible:ring-0 transition-colors",
            hasError ? "border-red-500" : "border-black/20 focus:border-black/60")

    return (
        <>
            <div className="min-h-screen bg-white text-black">
                <div className="container mx-auto px-4 py-10 max-w-7xl">

                    {/* Header */}
                    <div className="mb-10">
                        <Link href="/products" className="text-black/40 text-xs uppercase font-bold tracking-widest hover:text-black transition-colors">
                            ← Back to Store
                        </Link>
                        <h1 className="text-4xl font-black uppercase tracking-tight mt-4 text-black">Checkout</h1>

                        {/* Progress Steps */}
                        <div className="flex items-center gap-3 mt-6">
                            {STEPS.map((s, i) => {
                                const num = i + 1
                                const isActive = step === num
                                const isDone = step > num
                                return (
                                    <React.Fragment key={s}>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                                                isDone || isActive ? "bg-black text-white" : "bg-black/10 text-black/40"
                                            )}>
                                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : num}
                                            </div>
                                            <span className={cn(
                                                "text-xs font-bold uppercase tracking-widest transition-colors",
                                                isActive ? "text-black" : isDone ? "text-black/60" : "text-black/30"
                                            )}>
                                                {s}
                                            </span>
                                        </div>
                                        {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-black/20 flex-shrink-0" />}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 xl:gap-14">

                        {/* ── Left: Form Steps ── */}
                        <div className="flex-grow min-w-0">

                            {/* STEP 1: Information */}
                            {step === 1 && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
                                    {/* Contact */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-black uppercase tracking-tight border-b border-black/10 pb-3">Contact Information</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-black/50">Email Address</Label>
                                                <Input id="email" type="email" placeholder="customer@example.com" className={inputCls(!!errors.email)} {...register("email")} />
                                                {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.email.message}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="phone" className="text-[10px] uppercase font-black tracking-widest text-black/50">Phone Number</Label>
                                                <Input id="phone" type="tel" placeholder="+91 99999 99999" className={inputCls(!!errors.phone)} {...register("phone")} />
                                                {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{errors.phone.message}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Saved Addresses */}
                                    {session?.user && savedAddresses && savedAddresses.length > 0 && (
                                        <div className="space-y-3">
                                            <h2 className="text-xl font-black uppercase tracking-tight border-b border-black/10 pb-3">
                                                Saved Addresses
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {savedAddresses.map(addr => (
                                                    <button
                                                        key={addr.id}
                                                        type="button"
                                                        onClick={() => applyAddress(addr)}
                                                        className={cn(
                                                            "text-left p-4 border-2 transition-all space-y-1",
                                                            selectedAddressId === addr.id
                                                                ? "border-black bg-black/5"
                                                                : "border-black/10 hover:border-black/30"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3 h-3 text-black/40" />
                                                            {addr.isDefault && <span className="text-[8px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5">Default</span>}
                                                            {selectedAddressId === addr.id && <BookmarkCheck className="w-3.5 h-3.5 text-black ml-auto" />}
                                                        </div>
                                                        <p className="text-xs font-bold text-black leading-relaxed">{addr.street}</p>
                                                        <p className="text-[10px] text-black/50 font-bold">{addr.city}, {addr.state} – {addr.zip}</p>
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-black/40 font-bold uppercase tracking-wide">Or enter a new address below</p>
                                        </div>
                                    )}

                                    {/* Shipping Address Form */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-black uppercase tracking-tight border-b border-black/10 pb-3">Shipping Address</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-black/50">First Name</Label>
                                                <Input placeholder="First Name" className={inputCls(!!errors.firstName)} {...register("firstName")} />
                                                {errors.firstName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.firstName.message}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-black/50">Last Name</Label>
                                                <Input placeholder="Last Name" className={inputCls(!!errors.lastName)} {...register("lastName")} />
                                                {errors.lastName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.lastName.message}</p>}
                                            </div>
                                            <div className="md:col-span-2 space-y-1">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-black/50">Street Address</Label>
                                                <Input placeholder="House/Flat No, Street, Area" className={inputCls(!!errors.address)} {...register("address")}
                                                    onChange={e => { setValue("address", e.target.value); setSelectedAddressId(null) }} />
                                                {errors.address && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.address.message}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-black/50">City</Label>
                                                <Input placeholder="Mumbai" className={inputCls(!!errors.city)} {...register("city")} />
                                                {errors.city && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.city.message}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-black/50">State</Label>
                                                <Input placeholder="Maharashtra" className={inputCls(!!errors.state)} {...register("state")} />
                                                {errors.state && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.state.message}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-black/50">PIN Code</Label>
                                                <Input placeholder="400001" className={inputCls(!!errors.postalCode)} {...register("postalCode")} />
                                                {errors.postalCode && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.postalCode.message}</p>}
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-black/50">Country</Label>
                                                <div className="bg-gray-50 border border-black/10 h-12 flex items-center px-3 text-black/40 text-sm font-bold uppercase tracking-wider rounded-none">
                                                    India 🇮🇳
                                                </div>
                                            </div>
                                        </div>

                                        {/* Save Address toggle — only show for logged-in users with no matching saved address */}
                                        {session?.user && !selectedAddressId && (
                                            <label className="flex items-center gap-3 cursor-pointer mt-2">
                                                <div
                                                    onClick={() => setSaveAddress(v => !v)}
                                                    className={cn(
                                                        "w-5 h-5 border-2 flex items-center justify-center transition-all",
                                                        saveAddress ? "bg-black border-black" : "border-black/20"
                                                    )}
                                                >
                                                    {saveAddress && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-black/60">
                                                    Save this address to my profile
                                                </span>
                                            </label>
                                        )}
                                    </div>

                                    <Button onClick={nextStep} className="w-full h-14 bg-black text-white font-black uppercase tracking-widest rounded-none text-sm hover:bg-black/90 transition-all">
                                        Continue to Shipping
                                    </Button>
                                </section>
                            )}

                            {/* STEP 2: Shipping */}
                            {step === 2 && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-black uppercase tracking-tight border-b border-black/10 pb-3">Shipping Method</h2>
                                        <div className="space-y-3">
                                            {[
                                                { id: "standard", label: "Standard Shipping", sub: "3–7 Business Days", price: "FREE" },
                                                { id: "express", label: expressLabel, sub: expressDays, price: `₹${expressPrice.toLocaleString("en-IN")}` },
                                            ].map(opt => (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => setShippingMethod(opt.id as any)}
                                                    className={cn(
                                                        "p-5 border-2 flex justify-between items-center cursor-pointer transition-all rounded-none",
                                                        shippingMethod === opt.id ? "border-black bg-black/5" : "border-black/10 bg-white hover:border-black/30"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0", shippingMethod === opt.id ? "border-black" : "border-black/30")}>
                                                            {shippingMethod === opt.id && <div className="w-2 h-2 rounded-full bg-black" />}
                                                        </div>
                                                        <Truck className={cn("w-5 h-5", shippingMethod === opt.id ? "text-black" : "text-black/30")} />
                                                        <div>
                                                            <p className="font-bold uppercase text-xs text-black">{opt.label}</p>
                                                            <p className="text-[10px] text-black/40 uppercase font-medium mt-0.5">{opt.sub}</p>
                                                        </div>
                                                    </div>
                                                    <span className={cn("font-black text-sm", shippingMethod === opt.id ? "text-black" : "text-black/50")}>
                                                        {opt.price}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => setStep(1)} className="h-14 flex-1 rounded-none border border-black/20 text-black uppercase font-black text-xs hover:bg-black/5">Back</Button>
                                        <Button onClick={nextStep} className="h-14 flex-[3] bg-black text-white font-black uppercase tracking-widest rounded-none text-sm hover:bg-black/90 transition-all">Continue to Payment</Button>
                                    </div>
                                </section>
                            )}

                            {/* STEP 3: Payment */}
                            {step === 3 && (
                                <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-black uppercase tracking-tight border-b border-black/10 pb-3">Secure Payment</h2>
                                        <div className="border border-black/10 bg-gray-50 p-8 text-center space-y-4">
                                            <div className="w-14 h-14 mx-auto bg-black flex items-center justify-center">
                                                <Lock className="w-7 h-7 text-white" />
                                            </div>
                                            <p className="text-sm text-black/50 max-w-sm mx-auto leading-relaxed">
                                                You'll be redirected to Razorpay's secure payment gateway. We support UPI, Cards, Net Banking & Wallets.
                                            </p>
                                            <div className="flex items-center justify-center gap-3 pt-2">
                                                {["UPI", "VISA", "MC", "RZP"].map(badge => (
                                                    <div key={badge} className="px-3 py-1.5 border border-black/10 text-[9px] font-black text-black/40 uppercase tracking-widest">{badge}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => setStep(2)} className="h-14 flex-1 rounded-none border border-black/20 text-black uppercase font-black text-xs hover:bg-black/5" disabled={createOrder.isPending}>Back</Button>
                                        {pendingRzpOptions ? (
                                            <Button
                                                onClick={openRazorpay}
                                                className="h-14 flex-[3] bg-black text-white font-black uppercase tracking-widest rounded-none text-sm hover:bg-black/90 transition-all animate-pulse"
                                            >
                                                ✓ Order Ready — Open Payment
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleSubmit(handlePayment)}
                                                disabled={createOrder.isPending}
                                                className="h-14 flex-[3] bg-black text-white font-black uppercase tracking-widest rounded-none text-sm hover:bg-black/90 transition-all disabled:opacity-60"
                                            >
                                                {createOrder.isPending ? "Creating Order..." : `Pay ₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-black/30 uppercase">
                                        <Lock className="w-3 h-3" />
                                        256-bit SSL Encrypted · Powered by Razorpay
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* ── Right: Order Summary ── */}
                        <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0">
                            <div className="sticky top-28 border border-black/10 bg-gray-50 p-6 space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-black border-b border-black/10 pb-4">Order Summary</h3>

                                {/* Items */}
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={`${item.id}-${item.variantId}`} className="flex gap-4">
                                            <div className="relative w-16 aspect-[3/4] bg-black/5 flex-shrink-0 overflow-hidden">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[9px] font-black">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-grow space-y-1 py-1">
                                                <p className="text-xs font-black uppercase leading-tight text-black">{item.name}</p>
                                                {item.options && (
                                                    <p className="text-[10px] text-black/40 uppercase font-bold">
                                                        {Object.values(item.options).join(" / ")}
                                                    </p>
                                                )}
                                                <p className="text-sm font-black text-black pt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="bg-black/10" />

                                {/* Coupon */}
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-black/5 border border-black/10 p-3 animate-in fade-in">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-3.5 h-3.5 text-black" />
                                            <span className="text-[10px] font-black uppercase text-black">{appliedCoupon.code} Applied</span>
                                        </div>
                                        <button onClick={() => setAppliedCoupon(null)} className="text-[9px] font-black uppercase text-black/40 hover:text-black transition-colors">Remove</button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Coupon Code"
                                                value={couponCode}
                                                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null) }}
                                                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                                                className="bg-white border-black/20 rounded-none h-11 text-black placeholder:text-black/30 text-xs uppercase font-bold focus-visible:ring-0 focus:border-black/60"
                                            />
                                            <Button onClick={handleApplyCoupon} className="bg-black text-white font-black uppercase rounded-none h-11 px-5 text-xs hover:bg-black/90 flex-shrink-0">Apply</Button>
                                        </div>
                                        {couponError && <p className="text-[10px] text-red-500 font-black uppercase">{couponError}</p>}
                                    </div>
                                )}

                                <Separator className="bg-black/10" />

                                {/* Totals */}
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-black/60 uppercase">
                                        <span>Subtotal</span>
                                        <span className="text-black">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-xs font-bold uppercase text-green-600">
                                            <span>Discount ({appliedCoupon?.code})</span>
                                            <span>−₹{discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xs font-bold text-black/60 uppercase">
                                        <span>Shipping</span>
                                        <span className={shippingMethod === "express" ? "text-black" : "text-green-600"}>
                                            {shippingMethod === "express" ? `₹${expressPrice.toLocaleString("en-IN")}` : "FREE"}
                                        </span>
                                    </div>
                                    <Separator className="bg-black/10" />
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-lg font-black uppercase text-black">Total</span>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-black">₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                                            <p className="text-[9px] text-black/30 uppercase font-bold">Incl. all taxes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
