import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Returns & Exchanges | Luxecho",
    description: "Our returns and exchanges policy.",
}

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-12">Returns & Exchanges</h1>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p>
                        We want you to be completely satisfied with your purchase. If you need to return or exchange an item, please read our policy below.
                    </p>
                    <h2 className="text-2xl font-bold mt-8 mb-4">Return Policy</h2>
                    <p>
                        You have 14 days from the date of delivery to return your item(s) for a full refund or exchange. Items must be unworn, unwashed, and have all original tags attached.
                    </p>
                    <h2 className="text-2xl font-bold mt-8 mb-4">How to Return</h2>
                    <p>
                        To initiate a return, please contact our support team at luxecho2@gmail.com with your order number. We will provide you with a return shipping label.
                    </p>
                </div>
            </div>
        </div>
    )
}
