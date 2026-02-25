import { Metadata } from "next"

export const metadata: Metadata = {
    title: "About Us | Luxecho",
    description: "Learn more about Luxecho.",
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-12">About Us</h1>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p className="lead text-xl mb-6">
                        Luxecho is a premium streetwear and lifestyle brand dedicated to redefining modern fashion through minimalist aesthetics and exceptional quality.
                    </p>
                    <p>
                        Born from a passion for design and a rebellious spirit, our collections blur the lines between high fashion and everyday wear. We source the finest materials and partner with skilled artisans to create timeless pieces that make a statement.
                    </p>
                    <p className="mt-4">
                        Join us on our journey as we continue to push boundaries and craft elevated essentials for the modern lifestyle.
                    </p>
                </div>
            </div>
        </div>
    )
}
