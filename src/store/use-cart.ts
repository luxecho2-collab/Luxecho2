import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    productId: string
    variantId?: string
    name: string
    slug: string
    price: number
    image: string
    quantity: number
    options?: Record<string, string>
}

interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string, variantId?: string) => void
    updateQuantity: (id: string, quantity: number, variantId?: string) => void
    clearCart: () => void
    getTotalItems: () => number
    getTotalPrice: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
                const { items } = get()
                const existingItem = items.find(
                    (item) => item.id === newItem.id && item.variantId === newItem.variantId
                )

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === newItem.id && item.variantId === newItem.variantId
                                ? { ...item, quantity: item.quantity + newItem.quantity }
                                : item
                        ),
                    })
                } else {
                    set({ items: [...items, newItem] })
                }
            },
            removeItem: (id, variantId) => {
                set({
                    items: get().items.filter(
                        (item) => !(item.id === id && item.variantId === variantId)
                    ),
                })
            },
            updateQuantity: (id, quantity, variantId) => {
                set({
                    items: get().items.map((item) =>
                        item.id === id && item.variantId === variantId
                            ? { ...item, quantity: Math.max(1, quantity) }
                            : item
                    ),
                })
            },
            clearCart: () => set({ items: [] }),
            getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
            getTotalPrice: () =>
                get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        {
            name: 'funky-cart-storage',
        }
    )
)
