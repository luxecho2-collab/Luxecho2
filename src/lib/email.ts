import nodemailer from "nodemailer"

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true" || process.env.EMAIL_SERVER_SECURE === "true" || false,
    auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_SERVER_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD,
    },
})

export const sendEmail = async ({
    to,
    subject,
    html,
    text,
}: {
    to: string
    subject: string
    html: string
    text?: string
}) => {
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD
    const emailFrom = process.env.EMAIL_FROM || `"Luxecho Orders" <${smtpUser}>`

    try {
        if (!smtpUser || !smtpPass) {
            console.warn("Email attempted to send but SMTP credentials are missing.")
            return false
        }

        const info = await transporter.sendMail({
            from: emailFrom,
            to,
            subject,
            text: text || "HTML is required to view this email.",
            html,
        })

        console.log("Message sent: %s", info.messageId)
        return true
    } catch (error) {
        console.error("Error sending email:", error)
        return false
    }
}

export const emailService = {
    sendEmail,
    sendOrderConfirmation: async (order: any) => {
        const subject = `Order Confirmation #${order.orderNumber}`
        const html = `
            <h1>Thank you for your order!</h1>
            <p>Order Number: ${order.orderNumber}</p>
            <p>Total: $${order.total}</p>
            <ul>
                ${order.items.map((item: any) => `
                    <li>${item.product.name} x ${item.quantity} - $${item.price}</li>
                `).join('')}
            </ul>
        `
        return sendEmail({
            to: order.email,
            subject,
            html,
        })
    }
}
