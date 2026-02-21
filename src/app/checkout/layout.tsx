import type { ReactNode } from "react"
import Script from "next/script"

// Checkout uses its own minimal layout — no Navbar/Footer to avoid stacking
// context conflicts with Razorpay's fixed-position iframe overlay.
export default function CheckoutLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {/* Load Razorpay before page renders so the SDK is always available */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="beforeInteractive"
            />
            {children}
        </>
    )
}
