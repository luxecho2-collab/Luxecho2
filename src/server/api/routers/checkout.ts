import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import Razorpay from "razorpay"
import { nanoid } from "nanoid"
import crypto from "crypto"

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

            // 2. Create Razorpay order
            const options = {
                amount: Math.round(finalAmount * 100),
                currency: input.currency,
                receipt: `receipt_${nanoid()}`,
            }

            try {
                const razorpayOrder = await razorpay.orders.create(options)

                // 3. Create the order in our database as PENDING
                const order = await ctx.db.order.create({
                    data: {
                        orderNumber: `FUNK-${nanoid(6).toUpperCase()}`,
                        email: input.customerInfo.email,
                        total: finalAmount,
                        subtotal: input.amount,
                        discount: discountValue,
                        shippingAddress: input.shippingAddress as any,
                        paymentId: razorpayOrder.id,
                        couponCode: input.couponCode?.toUpperCase(),
                        status: "PENDING",
                        paymentStatus: "PENDING",
                        items: {
                            create: input.items.map(item => ({
                                product: { connect: { id: item.id } },
                                variant: item.variantId ? { connect: { id: item.variantId } } : undefined,
                                quantity: item.quantity,
                                price: item.price,
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

                    // Update inventory
                    for (const item of order.items) {
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

                    return updatedOrder
                })

                return { success: true, order: result }
            } catch (error) {
                console.error("Payment Verification Error:", error)
                throw new Error("Failed to process order")
            }
        }),
})
