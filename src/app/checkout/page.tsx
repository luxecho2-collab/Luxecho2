"use client"

import * as React from "react"
import { useCart } from "@/store/use-cart"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, ChevronRight, Lock, CreditCard, Truck, Tag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

const checkoutSchema = z.object({
    email: z.string().email("Valid email required"),
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    address: z.string().min(5, "Full address required"),
    city: z.string().min(1, "City required"),
    postalCode: z.string().min(5, "Valid postal code required"),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
    const { items, getTotalPrice } = useCart()
    const [step, setStep] = React.useState(1) // 1: Info, 2: Shipping, 3: Payment
    const [shippingMethod, setShippingMethod] = React.useState<"standard" | "express">("standard")

    // Coupon State
    const [couponCode, setCouponCode] = React.useState("")
    const [appliedCoupon, setAppliedCoupon] = React.useState<{
        code: string;
        discountType: "PERCENTAGE" | "FIXED";
        discountValue: number;
    } | null>(null)
    const [couponError, setCouponError] = React.useState<string | null>(null)

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            postalCode: "",
        }
    })

    const { register, handleSubmit, formState: { errors }, trigger } = form

    // trpc hooks
    const validateCouponQuery = api.checkout.validateCoupon.useQuery(
        { code: couponCode },
        { enabled: false }
    )
    const createOrder = api.checkout.createOrder.useMutation()
    const verifyPayment = api.checkout.verifyPayment.useMutation()

    const handleApplyCoupon = async () => {
        setCouponError(null)
        if (!couponCode) return

        const { data, error } = await validateCouponQuery.refetch()

        if (data?.valid) {
            setAppliedCoupon({
                code: couponCode.toUpperCase(),
                discountType: data.discountType as any,
                discountValue: data.discountValue ?? 0,
            })
            setCouponCode("")
        } else {
            setCouponError(data?.message || "Invalid coupon")
        }
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-4xl font-black uppercase italic mb-8">BAG IS <span className="text-neon-green">EMPTY</span></h1>
                <Link href="/products">
                    <Button className="bg-white text-black font-black uppercase tracking-widest rounded-none px-12 h-16 shadow-[8px_8px_0px_#000]">
                        Return to Store
                    </Button>
                </Link>
            </div>
        )
    }

    const nextStep = async () => {
        if (step === 1) {
            const isStepValid = await trigger()
            if (isStepValid) setStep(2)
        } else if (step === 2) {
            setStep(3)
        }
    }

    const shippingCost = shippingMethod === "express" ? 25 : 0
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
            const resp = await createOrder.mutateAsync({
                amount: total,
                customerInfo: {
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                },
                shippingAddress: {
                    street: data.address,
                    city: data.city,
                    state: "California",
                    zip: data.postalCode,
                    country: "USA",
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

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_placeholder",
                amount: resp.amount,
                currency: resp.currency,
                name: "FunkyStore",
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
                prefill: {
                    name: `${data.firstName} ${data.lastName}`,
                    email: data.email,
                },
                theme: {
                    color: "#00FF41",
                },
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch (error) {
            console.error("Payment failed", error)
            alert("Payment initialization failed")
        }
    }


    return (
        <>
            <script src="https://checkout.razorpay.com/v1/checkout.js" async />
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Main Checkout Flow */}
                    <div className="flex-grow space-y-12">
                        {/* Progress */}
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <span className={cn(step >= 1 ? "text-neon-green" : "text-muted-foreground")}>01. Information</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <span className={cn(step >= 2 ? "text-neon-green" : "text-muted-foreground")}>02. Shipping</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                            <span className={cn(step >= 3 ? "text-neon-green" : "text-muted-foreground")}>03. Payment</span>
                        </div>

                        {step === 1 && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-bold uppercase tracking-tight">CONTACT <span className="text-neon-green">INFO</span></h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="cyberpunk@neon.city"
                                            className={cn("bg-charcoal border-2 rounded-none h-12 text-white", errors.email ? "border-electric-pink" : "border-charcoal focus:border-neon-green")}
                                            {...register("email")}
                                        />
                                        {errors.email && <p className="text-[10px] text-electric-pink font-bold uppercase">{errors.email.message}</p>}
                                    </div>
                                </div>

                                <h2 className="text-3xl font-bold uppercase tracking-tight pt-8">SHIPPING <span className="text-neon-green">ADDRESS</span></h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-[10px] uppercase font-black tracking-widest">First Name</Label>
                                        <Input
                                            id="firstName"
                                            placeholder="V"
                                            className={cn("bg-charcoal border-2 rounded-none h-12 text-white", errors.firstName ? "border-electric-pink" : "border-charcoal focus:border-neon-green")}
                                            {...register("firstName")}
                                        />
                                        {errors.firstName && <p className="text-[10px] text-electric-pink font-bold uppercase">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-[10px] uppercase font-black tracking-widest">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Silverhand"
                                            className={cn("bg-charcoal border-2 rounded-none h-12 text-white", errors.lastName ? "border-electric-pink" : "border-charcoal focus:border-neon-green")}
                                            {...register("lastName")}
                                        />
                                        {errors.lastName && <p className="text-[10px] text-electric-pink font-bold uppercase">{errors.lastName.message}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="address" className="text-[10px] uppercase font-black tracking-widest">Address</Label>
                                        <Input
                                            id="address"
                                            placeholder="Night City, District 4"
                                            className={cn("bg-charcoal border-2 rounded-none h-12 text-white", errors.address ? "border-electric-pink" : "border-charcoal focus:border-neon-green")}
                                            {...register("address")}
                                        />
                                        {errors.address && <p className="text-[10px] text-electric-pink font-bold uppercase">{errors.address.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-[10px] uppercase font-black tracking-widest">City</Label>
                                        <Input
                                            id="city"
                                            placeholder="Night City"
                                            className={cn("bg-charcoal border-2 rounded-none h-12 text-white", errors.city ? "border-electric-pink" : "border-charcoal focus:border-neon-green")}
                                            {...register("city")}
                                        />
                                        {errors.city && <p className="text-[10px] text-electric-pink font-bold uppercase">{errors.city.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode" className="text-[10px] uppercase font-black tracking-widest">Postal Code</Label>
                                        <Input
                                            id="postalCode"
                                            placeholder="207700"
                                            className={cn("bg-charcoal border-2 rounded-none h-12 text-white", errors.postalCode ? "border-electric-pink" : "border-charcoal focus:border-neon-green")}
                                            {...register("postalCode")}
                                        />
                                        {errors.postalCode && <p className="text-[10px] text-electric-pink font-bold uppercase">{errors.postalCode.message}</p>}
                                    </div>
                                </div>

                                <Button
                                    onClick={nextStep}
                                    className="w-full h-16 bg-neon-green text-black font-black uppercase tracking-widest rounded-none text-lg hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]"
                                >
                                    Continue to Shipping
                                </Button>
                            </section>
                        )}

                        {step === 2 && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-bold uppercase tracking-tight">SHIPPING <span className="text-neon-green">METHOD</span></h2>
                                <div className="space-y-4">
                                    <div
                                        className={cn("p-6 border-2 flex justify-between items-center cursor-pointer transition-all", shippingMethod === "standard" ? "border-neon-green bg-charcoal" : "border-charcoal bg-deep-black")}
                                        onClick={() => setShippingMethod("standard")}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Truck className={cn("w-6 h-6", shippingMethod === "standard" ? "text-neon-green" : "text-white")} />
                                            <div>
                                                <p className="font-bold uppercase text-xs">Standard Shipping</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium">3-5 Business Days</p>
                                            </div>
                                        </div>
                                        <span className="font-black">FREE</span>
                                    </div>
                                    <div
                                        className={cn("p-6 border-2 flex justify-between items-center cursor-pointer transition-all", shippingMethod === "express" ? "border-neon-green bg-charcoal" : "border-charcoal bg-deep-black")}
                                        onClick={() => setShippingMethod("express")}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Truck className={cn("w-6 h-6", shippingMethod === "express" ? "text-neon-green" : "text-white")} />
                                            <div>
                                                <p className="font-bold uppercase text-xs">Express Shipping</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-medium">24-48 Hours</p>
                                            </div>
                                        </div>
                                        <span className="font-black">$25.00</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setStep(1)} className="h-16 flex-1 rounded-none border-2 border-white uppercase font-black italic">Back</Button>
                                    <Button
                                        onClick={nextStep}
                                        className="h-16 flex-[2] bg-neon-green text-black font-black uppercase tracking-widest rounded-none text-lg"
                                    >
                                        Continue to Payment
                                    </Button>
                                </div>
                            </section>
                        )}

                        {step === 3 && (
                            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-3xl font-bold uppercase tracking-tight">SECURE <span className="text-neon-green">PAYMENT</span></h2>
                                <div className="p-8 border-2 border-charcoal bg-charcoal/30 text-center space-y-6">
                                    <div className="relative w-16 h-16 mx-auto bg-neon-green flex items-center justify-center -rotate-12">
                                        <Lock className="w-8 h-8 text-black rotate-12" />
                                    </div>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                        You will be redirected to the secure Razorpay payment gateway to complete your purchase.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setStep(2)} className="h-16 flex-1 rounded-none border-2 border-white uppercase font-black italic">Back</Button>
                                    <Button
                                        onClick={handleSubmit(handlePayment)}
                                        className="h-16 flex-[2] bg-white text-black font-black uppercase tracking-widest rounded-none text-lg shadow-[8px_8px_0px_#00FF41]"
                                    >
                                        Pay Now ${total.toFixed(2)}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-center gap-6 opacity-30">
                                    <Image src="https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=200&auto=format&fit=crop" alt="Visa" width={40} height={25} className="grayscale" />
                                    <Image src="https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=200&auto=format&fit=crop" alt="Mastercard" width={40} height={25} className="grayscale" />
                                    <Image src="https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=200&auto=format&fit=crop" alt="Razorpay" width={60} height={25} className="grayscale" />
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Order Summary */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <div className="sticky top-32 space-y-8 bg-charcoal p-8 border-2 border-charcoal">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter border-b-2 border-deep-black pb-4">ORDER SUMMARY</h3>
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.variantId}`} className="flex gap-4">
                                        <div className="relative w-16 aspect-[3/4] bg-deep-black flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-grow space-y-1">
                                            <p className="text-[10px] font-black uppercase leading-tight">{item.name}</p>
                                            {item.options && (
                                                <p className="text-[8px] text-muted-foreground uppercase font-bold">
                                                    {Object.values(item.options).join(' / ')}
                                                </p>
                                            )}
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-[8px] font-bold uppercase text-muted-foreground">QTY: {item.quantity}</span>
                                                <span className="text-xs font-black">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="bg-deep-black h-0.5" />

                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-[10px] font-black uppercase text-neon-green">
                                        <span>Discount ({appliedCoupon?.code})</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span>Shipping</span>
                                    <span className={cn(shippingMethod === "express" ? "text-white" : "text-neon-green")}>
                                        {shippingMethod === "express" ? "$25.00" : "FREE"}
                                    </span>
                                </div>
                                <Separator className="bg-deep-black h-0.5" />
                                <div className="flex justify-between text-2xl font-black">
                                    <span className="italic">TOTAL</span>
                                    <span className="text-neon-green">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                {appliedCoupon ? (
                                    <div className="flex items-center justify-between bg-neon-green/10 border-2 border-neon-green p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-neon-green" />
                                            <span className="text-[10px] font-black uppercase text-neon-green">{appliedCoupon.code} APPLIED</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setAppliedCoupon(null)}
                                            className="h-fit p-0 text-neon-green hover:text-white"
                                        >
                                            <span className="text-[8px] font-black uppercase">REMOVE</span>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="COUPON CODE"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                className="bg-deep-black border-none rounded-none focus-visible:ring-neon-green h-12 uppercase font-black text-xs"
                                            />
                                            <Button
                                                onClick={handleApplyCoupon}
                                                className="bg-white text-black font-black uppercase rounded-none h-12 px-6"
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                        {couponError && <p className="text-[8px] text-electric-pink font-black uppercase">{couponError}</p>}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase">
                                    <Lock className="w-3 h-3" />
                                    Secure 256-bit SSL encryption
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
