import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Terms & Conditions | Luxecho",
    description: "Terms and Conditions of Use.",
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-12">Terms & Conditions</h1>
                <div className="prose prose-lg max-w-none text-gray-600 text-sm">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        These terms and conditions outline the rules and regulations for the use of Luxecho's Website.
                    </p>
                    <h2 className="text-black text-xl font-bold mt-6 mb-2">Acceptance of Terms</h2>
                    <p>
                        By accessing this website we assume you accept these terms and conditions. Do not continue to use Luxecho if you do not agree to take all of the terms and conditions stated on this page.
                    </p>
                    <h2 className="text-black text-xl font-bold mt-6 mb-2">Intellectual Property Rights</h2>
                    <p>
                        Unless otherwise stated, Luxecho and/or its licensors own the intellectual property rights for all material on our Website. All intellectual property rights are reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
