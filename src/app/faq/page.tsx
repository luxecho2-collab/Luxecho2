import { Metadata } from "next"

export const metadata: Metadata = {
    title: "FAQ | Luxecho",
    description: "Frequently Asked Questions.",
}

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-12">Frequently Asked Questions</h1>
                <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
                    <div>
                        <h3 className="text-xl font-bold mb-2">How can I track my order?</h3>
                        <p>Once your order has shipped, you will receive an email with tracking information. You can also view the status of your order in your account dashboard.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">Do you ship internationally?</h3>
                        <p>Yes, we ship globally! Shipping fees and delivery times vary depending on the destination.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">What is your return policy?</h3>
                        <p>We accept returns within 14 days of delivery. Items must be in their original condition with tag attached. See our Returns page for more details.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
