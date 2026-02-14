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
            await db.$transaction([
                db.order.update({
                    where: { id: order.id },
                    data: {
                        status: "PROCESSING",
                        paymentStatus: "PAID",
                        paidAt: new Date(),
                    }
                }),
                // Inventory is usually handled in verifyPayment, 
                // but this acts as a backup if client fails.
            ])

            await emailService.sendOrderConfirmation(order)
        }
    }

    return NextResponse.json({ received: true })
}
