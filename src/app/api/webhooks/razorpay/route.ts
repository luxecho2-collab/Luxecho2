import { NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { emailService } from "@/lib/email"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = req.headers.get("x-razorpay-signature")

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET ?? "")
        .update(body)
        .digest("hex")

    if (signature !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === "order.paid") {
        const payload = event.payload.order.entity
        const paymentPayload = event.payload.payment.entity

        const order = await db.order.findFirst({
            where: { paymentId: payload.id },
            include: { items: { include: { product: true } } }
        })

        if (order && order.paymentStatus !== "PAID") {
            await db.$transaction(async (tx) => {
                // Update order status
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        status: "PROCESSING",
                        paymentStatus: "PAID",
                        paidAt: new Date(),
                    }
                })

                // Backup Inventory Update
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

                // Backup Coupon usage
                if (order.couponCode) {
                    await tx.coupon.update({
                        where: { code: order.couponCode },
                        data: { usageCount: { increment: 1 } }
                    })
                }
            })

            await emailService.sendOrderConfirmation(order)
        }
    }

    return NextResponse.json({ received: true })
}
