"use client"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 space-y-16">
            <header className="space-y-4">
                <h1 className="text-6xl font-black uppercase italic tracking-tighter text-neon-green">TERMS OF SERVICE</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">PROTOCOL VERSION 1.0.4 // ZENZ SYSTEMS</p>
            </header>

            <div className="max-w-3xl space-y-12">
                <section className="space-y-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-2">01. NEURAL ACCEPTANCE</h2>
                    <p className="text-xs font-bold uppercase tracking-widest leading-loose text-muted-foreground">
                        By accessing the Zenz network, you agree to comply with all deployment protocols. Any unauthorized decryption of neural streams is strictly prohibited.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-2">02. GEAR ACQUISITION</h2>
                    <p className="text-xs font-bold uppercase tracking-widest leading-loose text-muted-foreground">
                        Hardware acquisitions are final once the neural link is established. Physical extractions follow standard regional laws.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-2">03. DATA INTEGRITY</h2>
                    <p className="text-xs font-bold uppercase tracking-widest leading-loose text-muted-foreground">
                        User archives are protected under the Neural Privacy Act. Any corruption of stored biometric data is the responsibility of the operative.
                    </p>
                </section>
            </div>
        </div>
    )
}
