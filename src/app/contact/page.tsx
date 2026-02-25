import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Contact Us | Luxecho",
    description: "Get in touch with the Luxecho team.",
}

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-12">Contact Us</h1>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p>
                        Our customer service team is available Monday through Friday, 9am - 5pm EST. We strive to respond to all inquiries within 24-48 hours.
                    </p>
                    <div className="mt-8 space-y-4">
                        <p><strong>Email:</strong> luxecho2@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
