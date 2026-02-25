import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Shipping Policy | Luxecho",
    description: "Our shipping and delivery information.",
}

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-12">Shipping Policy</h1>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p>
                        We ship our luxury streetwear worldwide. Below you will find information regarding our shipping methods, times, and costs.
                    </p>
                    <h2 className="text-2xl font-bold mt-8 mb-4">Domestic Shipping</h2>
                    <p>
                        Standard shipping within the country typically takes 3-5 business days. Express shipping options are available at checkout.
                    </p>
                    <h2 className="text-2xl font-bold mt-8 mb-4">International Shipping</h2>
                    <p>
                        International orders are shipped via premium carriers and usually arrive within 7-14 business days, depending on the destination. Customs and import duties may apply.
                    </p>
                </div>
            </div>
        </div>
    )
}
