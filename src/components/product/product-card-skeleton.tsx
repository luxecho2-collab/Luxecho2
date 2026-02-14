export function ProductCardSkeleton() {
    return (
        <div className="group animate-pulse">
            <div className="aspect-[3/4] bg-charcoal mb-6 border-2 border-transparent" />
            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-grow mr-4">
                        <div className="h-6 bg-charcoal w-3/4" />
                        <div className="h-3 bg-charcoal w-1/4" />
                    </div>
                    <div className="h-6 bg-charcoal w-12" />
                </div>
                <div className="h-1 bg-charcoal w-full" />
            </div>
        </div>
    )
}
