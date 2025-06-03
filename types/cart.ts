import { Candle } from "./candle"
import { Gift } from "./gift"
import { User } from "./user"

export interface Cart {
  id: string
  userId: User
  checkedOut: boolean
  createdAt: string
  updatedAt: string
  cartItems: CartItem[]
}

export interface CartItem {
  id: string
  cartId: string
  giftId?: string
  candleId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
  updatedAt: string
  gift?: Gift
  candle?: Candle
}

export interface CreateCartRequest {
  userId: string
  checkedOut: boolean
}

export interface AddCartItemRequest {
  giftId?: string
  candleId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface UpdateCartItemRequest {
  quantity?: number
  unitPrice?: number
  totalPrice?: number
}

export interface CartSummary {
  totalItems: number
  totalPrice: number
  candleCount: number
  giftCount: number
}
