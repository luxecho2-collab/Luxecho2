export interface EmailOptions {
    to: string;
    subject: string;
    body: string;
}

export const emailService = {
    sendOrderConfirmation: async (order: any) => {
        console.log(`[EMAIL_SENT] Order Confirmation: ${order.orderNumber} to ${order.email}`)
        // Integration point for Resend / SendGrid / Amazon SES
        return { success: true }
    },

    sendStockAlert: async (product: any) => {
        console.log(`[EMAIL_SENT] Low Stock Alert: ${product.name} (Qty: ${product.quantity})`)
        return { success: true }
    },

    sendWelcomeEmail: async (user: any) => {
        console.log(`[EMAIL_SENT] Welcome Operative: ${user.name || user.email}`)
        return { success: true }
    }
}
