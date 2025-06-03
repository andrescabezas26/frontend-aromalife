import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Cart, CartItem, CartSummary } from "@/types/cart"
import { CartService } from "@/services/cart/cart.service"

interface CartStore {
  // State
  cart: Cart | null
  loading: boolean
  error: string | null

  // Actions
  setCart: (cart: Cart | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
    // Cart operations
  loadCart: (cartId: string) => Promise<void>
  loadUserCart: (userId: string) => Promise<void>
  createCart: (userId: string) => Promise<void>
  addItemToCart: (cartId: string, item: {
    candleId?: string
    giftId?: string
    quantity: number
    unitPrice: number
  }) => Promise<void>
  updateCartItem: (cartId: string, itemId: string, updates: {
    quantity?: number
    unitPrice?: number
    totalPrice?: number
  }) => Promise<void>
  removeCartItem: (cartId: string, itemId: string) => Promise<void>
  clearCart: () => void
  
  // Computed values
  getCartSummary: () => CartSummary
  getItemCount: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      loading: false,
      error: null,

      // Basic setters
      setCart: (cart) => set({ cart }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Load existing cart
      loadCart: async (cartId: string) => {
        set({ loading: true, error: null })
        try {
          const cart = await CartService.getById(cartId)
          set({ cart, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Error al cargar el carrito",
            loading: false 
          })
        }
      },

      // Load user's active cart
      loadUserCart: async (userId: string) => {
        set({ loading: true, error: null })
        try {
          const cart = await CartService.getByUser(userId)
          set({ cart, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Error al cargar el carrito del usuario",
            loading: false 
          })
        }
      },

      // Create new cart
      createCart: async (userId: string) => {
        set({ loading: true, error: null })
        try {
          const cart = await CartService.create({
            userId,
            checkedOut: false
          })
          set({ cart, loading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Error al crear el carrito",
            loading: false 
          })
        }
      },      // Add item to cart
      addItemToCart: async (cartId: string, item) => {
        set({ loading: true, error: null })
        try {
          const unitPrice = Number(item.unitPrice)
          const totalPrice = CartService.calculateItemTotal(item.quantity, unitPrice)
          
          await CartService.addItem(cartId, {
            ...item,
            unitPrice,
            totalPrice
          })
          
          // Reload cart to get updated data with all relations
          const cartData = get().cart
          if (cartData?.userId?.id) {
            const updatedCart = await CartService.getByUser(cartData.userId.id)
            set({ cart: updatedCart, loading: false })
          } else {
            const updatedCart = await CartService.getById(cartId)
            set({ cart: updatedCart, loading: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Error al agregar artículo al carrito",
            loading: false 
          })
        }
      },// Update cart item
      updateCartItem: async (cartId: string, itemId: string, updates) => {
        set({ loading: true, error: null })
        try {
          // If quantity is being updated, recalculate total price
          const cartState = get().cart
          const item = cartState?.cartItems.find(item => item.id === itemId)
          
          let updateData = { ...updates }
          
          // Ensure prices are numbers
          if (updateData.unitPrice !== undefined) {
            updateData.unitPrice = Number(updateData.unitPrice)
          }
          
          if (updates.quantity && item) {
            const unitPrice = Number(updates.unitPrice || item.unitPrice)
            updateData.totalPrice = CartService.calculateItemTotal(
              updates.quantity, 
              unitPrice
            )
          }          await CartService.updateItem(cartId, itemId, updateData)
          
          // Reload cart to get updated data with all relations
          const updatedCartState = get().cart
          if (updatedCartState?.userId?.id) {
            const updatedCart = await CartService.getByUser(updatedCartState.userId.id)
            set({ cart: updatedCart, loading: false })
          } else {
            const updatedCart = await CartService.getById(cartId)
            set({ cart: updatedCart, loading: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Error al actualizar artículo",
            loading: false 
          })
        }
      },      // Remove cart item
      removeCartItem: async (cartId: string, itemId: string) => {
        set({ loading: true, error: null })
        try {
          await CartService.removeItem(cartId, itemId)
          
          // Reload cart to get updated data with all relations
          const cartData = get().cart
          if (cartData?.userId?.id) {
            const updatedCart = await CartService.getByUser(cartData.userId.id)
            set({ cart: updatedCart, loading: false })
          } else {
            const updatedCart = await CartService.getById(cartId)
            set({ cart: updatedCart, loading: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Error al eliminar artículo",
            loading: false 
          })
        }
      },

      // Clear cart
      clearCart: () => set({ cart: null, error: null }),

      // Get cart summary
      getCartSummary: () => {
        const { cart } = get()
        if (!cart) {
          return {
            totalItems: 0,
            totalPrice: 0,
            candleCount: 0,
            giftCount: 0
          }
        }
        return CartService.getCartSummary(cart)
      },

      // Get total item count
      getItemCount: () => {
        const { cart } = get()
        if (!cart) return 0
        return cart.cartItems.reduce((sum, item) => sum + item.quantity, 0)
      },      // Get total price
      getTotalPrice: () => {
        const { cart } = get()
        if (!cart) return 0
        return cart.cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
      }
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        cart: state.cart
      })
    }
  )
)
