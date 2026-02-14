"use client"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 space-y-16">
            <header className="space-y-4">
                <h1 className="text-6xl font-black uppercase italic tracking-tighter text-neon-green">PRIVACY PROTOCOL</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">NEURAL DATA SHIELD // ZENZ SYSTEMS</p>
            </header>

            <div className="max-w-3xl space-y-12">
                <section className="space-y-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-2">01. DATA COLLECTION</h2>
                    <p className="text-xs font-bold uppercase tracking-widest leading-loose text-muted-foreground">
                        We collect neural metadata required for order fulfillment and interface optimization. Biometric signatures are encrypted at the source.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-2">02. ARCHIVE SECURITY</h2>
                    <p className="text-xs font-bold uppercase tracking-widest leading-loose text-muted-foreground">
                        All user logs are stored in decentralized deep-grid clusters. Access is restricted to authorized operatives with valid neural keys.
                    </p>
                </section>
            </div>
        </div>
    )
}
