import { Order, CreateOrderRequest, UpdateOrderStatusRequest, OrderStatus } from "@/types/order";
import { createRequestWithEntity } from "@/lib/axios";

// Crear cliente HTTP específico para orders
const orderApi = createRequestWithEntity("orden");

export const OrderService = {  // Obtener todas las órdenes con paginación
  async getAll(
    page: number = 1, 
    limit: number = 10, 
    searchTerm?: string, 
    status?: string
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(status && status !== 'ALL' && { status })
      });
      
      const response = await orderApi.get(`/orders?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  // Obtener orden por ID
  async getById(id: string): Promise<Order> {
    try {
      const response = await orderApi.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  },

  // Obtener órdenes por usuario
  async getByUser(userId: string): Promise<Order[]> {
    try {
      const response = await orderApi.get(`/orders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },

  // Crear orden
  async create(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await orderApi.post("/orders", orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Actualizar orden
  async update(id: string, orderData: Partial<Order>): Promise<Order> {
    try {
      const response = await orderApi.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  },

  // Actualizar estado de orden
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await orderApi.put(`/orders/${id}/status`, { status });
      const updatedOrder = response.data;
      
      // Enviar notificación por WhatsApp si la actualización fue exitosa
      if (updatedOrder && updatedOrder.userId) {
        await this.sendWhatsAppNotification(updatedOrder, status);
      }
      
      return updatedOrder;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Enviar notificación por WhatsApp
  async sendWhatsAppNotification(order: Order, status: OrderStatus): Promise<void> {
    try {
      const user = order.userId;
      if (!user || !user.phone || !user.phoneCountryCode) {
        console.warn("Usuario sin información de teléfono para notificación WhatsApp");
        return;
      }

      const statusMessage = this.getStatusMessage(status);
      const message = `🕯️ *AromaLife* 🕯️\n\nHola ${user.name}!\n\nTu pedido #${order.id} ha cambiado de estado:\n\n📦 *${this.getStatusLabel(status)}*\n\n${statusMessage}\n\n¡Gracias por confiar en nosotros! ✨`;
      
      // Crear URL de WhatsApp con el mensaje
      const phoneNumber = `${user.phoneCountryCode}${user.phone}`.replace(/\D/g, '');
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
      
      // Abrir WhatsApp Web automáticamente en una nueva ventana
      window.open(whatsappUrl, '_blank');
      
      console.log(`📱 WhatsApp abierto para ${user.name} (${phoneNumber}) - Orden ${order.id}: ${this.getStatusLabel(status)}`);
      
    } catch (error) {
      console.error("Error enviando notificación WhatsApp:", error);
      // No lanzamos el error para que no afecte la actualización del estado
    }
  },

  // Obtener mensaje explicativo del estado
  getStatusMessage(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return "Tu pedido está pendiente de confirmación. Te contactaremos pronto para confirmar los detalles.";
      case OrderStatus.PROCESSING:
        return "¡Excelente! Tu pedido está siendo preparado con mucho amor. Nuestros artesanos están trabajando en tus velas personalizadas.";
      case OrderStatus.SHIPPED:
        return "🚚 Tu pedido ya está en camino! En breve recibirás el número de seguimiento para que puedas rastrear tu envío.";
      case OrderStatus.DELIVERED:
        return "🎉 ¡Tu pedido ha sido entregado! Esperamos que disfrutes mucho tus nuevas velas aromáticas. No olvides dejarnos tu reseña.";
      case OrderStatus.CANCELLED:
        return "Tu pedido ha sido cancelado. Si tienes alguna pregunta, no dudes en contactarnos. Estamos aquí para ayudarte.";
      default:
        return "El estado de tu pedido ha sido actualizado.";
    }
  },

  // Eliminar orden
  async delete(id: string): Promise<void> {
    try {
      await orderApi.delete(`/orders/${id}`);
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  },

  // Procesar pago
  async processPayment(id: string, paymentDetails: any): Promise<Order> {
    try {
      const response = await orderApi.post(`/orders/${id}/payment`, paymentDetails);
      return response.data;
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error;
    }
  },

  // Utility methods
  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case OrderStatus.PROCESSING:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case OrderStatus.SHIPPED:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800 border-green-200";
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  },

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return "Pendiente";
      case OrderStatus.PROCESSING:
        return "En Proceso";
      case OrderStatus.SHIPPED:
        return "Enviado";
      case OrderStatus.DELIVERED:
        return "Entregado";
      case OrderStatus.CANCELLED:
        return "Cancelado";
      default:
        return status;
    }
  },

  generateWhatsAppUrl(phoneCountryCode: string, phone: string, orderId: string): string {
    const fullPhone = `${phoneCountryCode}${phone}`.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola! Me comunico desde AromaLife respecto a tu orden #${orderId}. ¿En qué puedo ayudarte?`
    );
    return `https://wa.me/${fullPhone}?text=${message}`;
  },

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }
};
