import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Careers | Luxecho",
    description: "Join the Luxecho team.",
}

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl font-black uppercase tracking-widest mb-12">Careers</h1>
                <div className="prose prose-lg max-w-none text-gray-600">
                    <p>
                        We are continually looking for passionate, driven individuals to join our growing team.
                    </p>
                    <p>
                        While we do not have any open positions at the moment, we encourage you to send your resume and a cover letter to luxecho2@gmail.com. We will keep your information on file for future opportunities.
                    </p>
                </div>
            </div>
        </div>
    )
}
