import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Privacy Policy | Luxecho",
    description: "Our Privacy Policy.",
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-12">Privacy Policy</h1>
                <div className="prose prose-lg max-w-none text-gray-600 text-sm">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        At Luxecho, we respect your privacy and are committed to protecting it through our compliance with this policy.
                    </p>
                    <h2 className="text-black text-xl font-bold mt-6 mb-2">Information We Collect</h2>
                    <p>
                        We collect personal information that you provide to us, such as name, address, contact information, passwords and security data, and payment information.
                    </p>
                    <h2 className="text-black text-xl font-bold mt-6 mb-2">How We Use Your Information</h2>
                    <p>
                        We use personal information collected via our Website for a variety of business purposes described below, such as to facilitate account creation and login process, and to manage user accounts.
                    </p>
                </div>
            </div>
        </div>
    )
}
