import axios from "@/lib/axios"
import { AxiosError } from "axios"
import {
  Cart,
  CartItem,
  CreateCartRequest,
  AddCartItemRequest,
  UpdateCartItemRequest,
  CartSummary,
} from "@/types/cart"
import type { CreateOrderRequest } from "@/types/order"
import { OrderService } from "../orders/order.service"

// Interface for server error response
interface ServerErrorResponse {
  message?: string
  error?: string
}

// Function to translate HTTP errors to Spanish messages
const translateError = (error: AxiosError<ServerErrorResponse>): string => {
  const status = error.response?.status
  const serverMessage =
    error.response?.data?.message || error.response?.data?.error

  // Ensure serverMessage is a string before using string methods
  const messageStr = typeof serverMessage === 'string' ? serverMessage : String(serverMessage || '')

  switch (status) {
    case 400:
      if (messageStr) {
        if (messageStr.toLowerCase().includes("quantity")) {
          return "La cantidad no es válida"
        }
        if (messageStr.toLowerCase().includes("price")) {
          return "El precio no es válido"
        }
        if (messageStr.toLowerCase().includes("cart")) {
          return "El carrito no es válido"
        }
        if (messageStr.toLowerCase().includes("item")) {
          return "El artículo no es válido"
        }
        return messageStr
      }
      return "Los datos enviados no son válidos"

    case 401:
      return "No tienes autorización para realizar esta acción"

    case 403:
      return "No tienes permisos para acceder a este recurso"

    case 404:
      if (messageStr.toLowerCase().includes("cart")) {
        return "Carrito no encontrado"
      }
      if (messageStr.toLowerCase().includes("item")) {
        return "Artículo no encontrado en el carrito"
      }
      return "Recurso no encontrado"

    case 409:
      return "El artículo ya existe en el carrito"

    case 500:
      return "Error interno del servidor. Inténtalo de nuevo más tarde"

    default:
      return "Error de conexión. Verifica tu conexión a internet"
  }
}

export class CartService {
  private static readonly BASE_URL = "/cart"

  static async loadUserCart(userId: string) {
    const response = await axios.get(`${this.BASE_URL}/user/${userId}`)
    return response.data
  }

  static async createCart(userId: string) {
    const response = await axios.post(`${this.BASE_URL}`, { userId })
    return response.data
  }

  static async updateCartItem(cartId: string, itemId: string, data: { quantity: number; unitPrice: number }) {
    const response = await axios.put(`${this.BASE_URL}/${cartId}/items/${itemId}`, data)
    return response.data
  }

  static async removeCartItem(cartId: string, itemId: string) {
    const response = await axios.delete(`${this.BASE_URL}/${cartId}/items/${itemId}`)
    return response.data
  }

  static async addItemToCart(cartId: string, data: { giftId?: string; candleId?: string; quantity: number; unitPrice: number }) {
    const response = await axios.post(`${this.BASE_URL}/${cartId}/items`, data)
    return response.data
  }

  static async processPayment(cartId: string, userData: any) {
    try {
      // 1. Obtener el carrito actual
      console.log("Fetching cart with ID:", cartId);
      const cartResponse = await axios.get(`${this.BASE_URL}/${cartId}`);
      const cart = cartResponse.data;
      
      if (!cart) {
        throw new Error("No se pudo obtener el carrito");
      }
      
      console.log("Cart data:", cart);
      
      if (!cart.cartItems || !Array.isArray(cart.cartItems)) {
        throw new Error("El carrito no tiene items válidos");
      }

      // 2. Crear la preferencia de pago en el backend
      console.log("Creating payment preference for cart:", cartId);
      const response = await axios.post(`/payment/create-preference`, {
        cartId,
        items: cart.cartItems.map((item: CartItem) => ({
          id: item.candleId || item.giftId,
          title: item.candle?.name || item.gift?.name,
          quantity: item.quantity,
          unit_price: Number(item.unitPrice),
          currency_id: "COP"
        })),
        payer: {
          name: userData.name,
          email: userData.email,
          phone: {
            number: userData.phone
          }
        },
        back_urls: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`
        },
        auto_return: "approved",
        external_reference: cartId
      });

      const { init_point } = response.data;

      // 3. Retornar el punto de inicio para redirección
      return init_point;
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error instanceof Error) {
        throw new Error(`Error al procesar el pago: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create a new cart for a user
   */
  static async create(data: CreateCartRequest): Promise<Cart> {
    try {
      const response = await axios.post<Cart>(this.BASE_URL, data)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      throw new Error(translateError(axiosError))
    }
  }

  /**
   * Get a cart by ID with all its items
   */
  static async getById(cartId: string): Promise<Cart> {
    try {
      const response = await axios.get<Cart>(`${this.BASE_URL}/${cartId}`)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      throw new Error(translateError(axiosError))
    }
  }

  /**
   * Add an item to the cart
   */
  static async addItem(cartId: string, item: AddCartItemRequest): Promise<CartItem> {
    try {
      // Ensure numeric values are properly converted
      const itemData = {
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice)
      }
      
      const response = await axios.post<CartItem>(
        `${this.BASE_URL}/${cartId}/items`,
        itemData
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      throw new Error(translateError(axiosError))
    }
  }

  /**
   * Update an item in the cart
   */
  static async updateItem(
    cartId: string,
    itemId: string,
    updates: UpdateCartItemRequest
  ): Promise<CartItem> {
    try {
      // Ensure numeric values are properly converted
      const updateData: any = {}
      
      if (updates.quantity !== undefined) {
        updateData.quantity = Number(updates.quantity)
      }
      
      if (updates.unitPrice !== undefined) {
        updateData.unitPrice = Number(updates.unitPrice)
      }
      
      if (updates.totalPrice !== undefined) {
        updateData.totalPrice = Number(updates.totalPrice)
      }
      
      const response = await axios.patch<CartItem>(
        `${this.BASE_URL}/${cartId}/items/${itemId}`,
        updateData
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      throw new Error(translateError(axiosError))
    }
  }

  /**
   * Remove an item from the cart
   */
  static async removeItem(cartId: string, itemId: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${cartId}/items/${itemId}`)
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      throw new Error(translateError(axiosError))
    }
  }

  /**
   * Delete a cart
   */
  static async delete(cartId: string): Promise<void> {
    try {
      await axios.delete(`${this.BASE_URL}/${cartId}`)
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      throw new Error(translateError(axiosError))
    }
  }

  /**
   * Assign a user to a cart
   */
  static async assignUser(cartId: string, userId: string): Promise<Cart> {
    try {
      const response = await axios.patch<Cart>(
        `${this.BASE_URL}/${cartId}/assign-user/${userId}`
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      throw new Error(translateError(axiosError))
    }
  }  /**
   * Get user's active cart
   */
  static async getByUser(userId: string): Promise<Cart | null> {
    try {
      const response = await axios.get<Cart>(`${this.BASE_URL}/user/${userId}`)
      if (response.data?.cartItems) {
        response.data.cartItems.forEach((item, index) => {
          console.log(`Item ${index}:`, {
            id: item.id,
            candleId: item.candleId,
            giftId: item.giftId,
            hasCandle: !!item.candle,
            hasGift: !!item.gift,
            candle: item.candle,
            gift: item.gift
          })
        })
      }
      console.log("=========================")
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      throw new Error(translateError(axiosError))
    }
  }

  /**
   * Get cart summary with totals
   */
  static getCartSummary(cart: Cart): CartSummary {
    const totalItems = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cart.cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0)
    const candleCount = cart.cartItems.filter(item => item.candleId).length
    const giftCount = cart.cartItems.filter(item => item.giftId).length

    return {
      totalItems,
      totalPrice,
      candleCount,
      giftCount,
    }
  }

  /**
   * Helper method to calculate total price for an item
   */
  static calculateItemTotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice
  }
}
