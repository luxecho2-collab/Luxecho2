import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Store Locator | Luxecho",
    description: "Find a Luxecho store near you.",
}

export default function StoresPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-12">Store Locator</h1>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p className="text-xl font-medium mt-12 text-center">
                        We currently do not have any physical locations, but stay tuned! We will have physical stores available in the future.
                    </p>
                </div>
            </div>
        </div>
    )
}
