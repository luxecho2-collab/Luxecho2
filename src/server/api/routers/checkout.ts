import { z } from "zod"
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import Razorpay from "razorpay"
import { nanoid } from "nanoid"
import crypto from "crypto"

import { sendEmail } from "@/lib/email"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID ?? "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET ?? "placeholder_secret",
})

export const checkoutRouter = createTRPCRouter({
    createOrder: publicProcedure
        .input(z.object({
            amount: z.number().min(1),
            currency: z.string().default("INR"),
            customerInfo: z.object({
                email: z.string().email(),
                phone: z.string().min(10, "Phone number is required"),
                firstName: z.string(),
                lastName: z.string(),
            }),
            shippingAddress: z.object({
                street: z.string(),
                city: z.string(),
                state: z.string(),
                zip: z.string(),
                country: z.string(),
            }),
            items: z.array(z.object({
                id: z.string(),
                variantId: z.string().optional().nullable(),
                quantity: z.number(),
                price: z.number(),
                name: z.string(),
                options: z.record(z.string(), z.any()).optional(),
            })),
            couponCode: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            let finalAmount = input.amount
            let discountValue = 0

            // 1. Validate Coupon if provided
            if (input.couponCode) {
                const coupon = await ctx.db.coupon.findUnique({
                    where: { code: input.couponCode.toUpperCase(), isActive: true }
                })

                if (coupon) {
                    const now = new Date()
                    const isExpired = coupon.endDate && coupon.endDate < now
                    const limitReached = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit

                    if (!isExpired && !limitReached) {
                        if (coupon.discountType === "PERCENTAGE") {
                            discountValue = (input.amount * coupon.discountValue) / 100
                        } else {
                            discountValue = Math.min(input.amount, coupon.discountValue)
                        }
                        finalAmount = Math.max(0, input.amount - discountValue)
                    }
                }
            }

            // 2. Enforce Razorpay minimum order amount (₹1 = 100 paise)
            const amountInPaise = Math.round(finalAmount * 100)
            if (amountInPaise < 100) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Order total must be at least ₹1 to process payment.",
                })
            }

            // 3. Create Razorpay order
            const options = {
                amount: amountInPaise,
                currency: input.currency,
                receipt: `receipt_${nanoid()}`,
            }

            try {
                const razorpayOrder = await razorpay.orders.create(options)

                // 3. Create the order in our database as PENDING
                const order = await ctx.db.order.create({
                    data: {
                        orderNumber: `FUNK-${nanoid(6).toUpperCase()}`,
                        userId: ctx.session?.user?.id,
                        email: input.customerInfo.email,
                        phone: input.customerInfo.phone,
                        total: finalAmount,
                        subtotal: input.amount,
                        discount: discountValue,
                        shippingAddress: {
                            ...input.shippingAddress,
                            phone: input.customerInfo.phone,
                            firstName: input.customerInfo.firstName,
                            lastName: input.customerInfo.lastName,
                        } as any,
                        paymentId: razorpayOrder.id,
                        couponCode: input.couponCode?.toUpperCase(),
                        status: "PENDING",
                        paymentStatus: "PENDING",
                        items: {
                            create: input.items.map(item => ({
                                product: { connect: { id: item.id } },
                                variant: item.variantId && item.variantId.length > 15 ? { connect: { id: item.variantId } } : undefined,
                                quantity: item.quantity,
                                price: item.price,
                                options: item.options || undefined,
                            }))
                        }
                    }
                })

                return {
                    id: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    orderId: order.id,
                }
            } catch (error) {
                console.error("Razorpay Order Creation Error:", error)
                throw new Error("Failed to initialize payment")
            }
        }),

    validateCoupon: publicProcedure
        .input(z.object({ code: z.string() }))
        .query(async ({ ctx, input }) => {
            const coupon = await ctx.db.coupon.findUnique({
                where: { code: input.code.toUpperCase(), isActive: true }
            })

            if (!coupon) return { valid: false, message: "Invalid code" }

            const now = new Date()
            if (coupon.endDate && coupon.endDate < now) return { valid: false, message: "Code expired" }
            if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { valid: false, message: "Usage limit reached" }

            return {
                valid: true,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minOrderAmount: coupon.minOrderAmount
            }
        }),

    verifyPayment: publicProcedure
        .input(z.object({
            razorpay_order_id: z.string(),
            razorpay_payment_id: z.string(),
            razorpay_signature: z.string(),
            orderId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // 1. Verify signature
            const generated_signature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "placeholder_secret")
                .update(input.razorpay_order_id + "|" + input.razorpay_payment_id)
                .digest("hex")

            if (generated_signature !== input.razorpay_signature) {
                throw new Error("Invalid payment signature")
            }

            // 2. Transaction for atomic inventory update and order status update
            try {
                const result = await ctx.db.$transaction(async (tx) => {
                    // Fetch order items
                    const order = await tx.order.findUnique({
                        where: { id: input.orderId },
                        include: { items: true },
                    })

                    if (!order) throw new Error("Order not found")
                    if (order.paymentStatus === "PAID") return order

                    // Update inventory and tracking
                    for (const item of order.items) {
                        // Increment salesCount always
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { salesCount: { increment: item.quantity } },
                        })

                        if (item.variantId) {
                            await tx.productVariant.update({
                                where: { id: item.variantId },
                                data: { quantity: { decrement: item.quantity } },
                            })
                        } else {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { quantity: { decrement: item.quantity } },
                            })
                        }
                    }

                    // Update order status
                    const updatedOrder = await tx.order.update({
                        where: { id: input.orderId },
                        data: {
                            status: "PROCESSING",
                            paymentStatus: "PAID",
                            paidAt: new Date(),
                            paymentId: input.razorpay_payment_id,
                        }
                    })

                    // Handle coupon usage increment if applicable
                    if (updatedOrder.couponCode) {
                        await tx.coupon.update({
                            where: { code: updatedOrder.couponCode },
                            data: { usageCount: { increment: 1 } }
                        })
                    }

                    // Send Order Confirmation Email
                    await sendEmail({
                        to: updatedOrder.email,
                        subject: `Order Confirmation - #${updatedOrder.orderNumber}`,
                        html: `
                            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
                                <h1 style="color: #000; text-transform: uppercase; font-style: italic;">Order Confirmed!</h1>
                                <p>Thank you for shopping with Luxecho. Your payment was successful.</p>
                                <div style="background: #f9f9f9; padding: 20px; border: 1px solid #eee; margin-top: 20px;">
                                    <p><strong>Order Number:</strong> ${updatedOrder.orderNumber}</p>
                                    <p><strong>Status:</strong> Processing</p>
                                    <p><strong>Total:</strong> ₹${updatedOrder.total.toLocaleString()}</p>
                                </div>
                                <p style="margin-top: 20px; font-size: 12px; color: #666;">
                                    You will receive another email when your order ships.
                                </p>
                            </div>
                        `
                    })

                    return updatedOrder
                })

                return { success: true, order: result }
            } catch (error) {
                console.error("Payment Verification Error:", error)
                throw new Error("Failed to process order")
            }
        }),

    getShippingSettings: publicProcedure.query(async ({ ctx }) => {
        const settings = await ctx.db.siteSettings.findMany({
            where: {
                key: {
                    in: [
                        "express_shipping_price", "express_shipping_label", "express_shipping_days",
                        "standard_shipping_price", "standard_shipping_label", "standard_shipping_days"
                    ]
                }
            }
        })
        const map = Object.fromEntries(settings.map((s: { key: string; value: string }) => [s.key, s.value]))
        return {
            expressPrice: parseFloat(map["express_shipping_price"] ?? "2000"),
            expressLabel: map["express_shipping_label"] ?? "Express Shipping",
            expressDays: map["express_shipping_days"] ?? "1–2 Business Days",
            standardPrice: parseFloat(map["standard_shipping_price"] ?? "0"),
            standardLabel: map["standard_shipping_label"] ?? "Standard Shipping",
            standardDays: map["standard_shipping_days"] ?? "3–7 Business Days",
        }
    }),

    requestCancellation: protectedProcedure
        .input(z.object({ orderId: z.string(), reason: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const order = await ctx.db.order.findUnique({
                where: { id: input.orderId }
            })

            if (!order || order.userId !== ctx.session.user.id) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" })
            }

            if (order.status !== "PENDING" && order.status !== "PROCESSING") {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Order cannot be cancelled in its current state"
                })
            }

            return ctx.db.order.update({
                where: { id: input.orderId },
                data: {
                    status: "CANCEL_REQUESTED",
                    cancelReason: input.reason
                }
            })
        }),

    requestReturn: protectedProcedure
        .input(z.object({ orderId: z.string(), reason: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const order = await ctx.db.order.findUnique({
                where: { id: input.orderId }
            })

            if (!order || order.userId !== ctx.session.user.id) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" })
            }

            if (order.status !== "SHIPPED" && order.status !== "DELIVERED") {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Order is not eligible for return"
                })
            }

            return ctx.db.order.update({
                where: { id: input.orderId },
                data: {
                    status: "RETURN_REQUESTED",
                    returnReason: input.reason
                }
            })
        }),
})
