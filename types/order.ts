export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING', 
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface PaymentDetails {
  method: string;
  transactionId: string;
  status: string;
}

export interface OrderUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  candle?: {
    id: string;
    name: string;
    message?: string;
    aroma?: {
      name: string;
      color: string;
    };
    container?: {
      name: string;
    };
    label: {
      name: string;
      imageUrl: string;
    };
  };
  gift?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  };
}

export interface Order {
  id: string;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  paymentDetails?: PaymentDetails;
  items: OrderItem[];
  userId: OrderUser | null; // Make it nullable to handle cases where user data might not be loaded
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentDetails?: PaymentDetails;
  items: Omit<OrderItem, 'id'>[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
