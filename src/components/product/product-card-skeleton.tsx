export function ProductCardSkeleton() {
    return (
        <div className="group animate-pulse">
            <div className="aspect-[3/4] bg-gray-100 mb-4" />
            <div className="space-y-3">
                <div className="h-3 bg-gray-100 w-3/4" />
                <div className="h-2 bg-gray-100 w-1/4" />
                <div className="h-4 bg-gray-100 w-1/2 mt-2" />
            </div>
        </div>
    )
}
