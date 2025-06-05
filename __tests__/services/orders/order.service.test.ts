import {
  Order,
  CreateOrderRequest,
  OrderStatus,
  OrderUser,
  ShippingAddress,
  OrderItem,
  PaymentDetails,
} from "@/types/order";

// Mock del módulo axios
jest.mock("@/lib/axios", () => ({
  createRequestWithEntity: jest.fn(),
}));

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

let OrderService: typeof import("@/services/orders/order.service").OrderService;

// Mock de window.open para WhatsApp
const mockWindowOpen = jest.fn();
Object.defineProperty(window, "open", {
  value: mockWindowOpen,
  writable: true,
});

beforeAll(() => {
  const { createRequestWithEntity } = require("@/lib/axios");
  (createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);

  OrderService = require("@/services/orders/order.service").OrderService;
});

describe("OrderService", () => {
  const mockUser: OrderUser = {
    id: "user-1",
    name: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    phone: "3001234567",
    phoneCountryCode: "+57",
  };

  const mockShippingAddress: ShippingAddress = {
    street: "Calle 123 #45-67",
    city: "Bogotá",
    state: "Cundinamarca",
    country: "Colombia",
    zipCode: "110111",
  };

  const mockPaymentDetails: PaymentDetails = {
    method: "credit_card",
    transactionId: "txn_123456789",
    status: "completed",
  };

  const mockOrderItem: OrderItem = {
    id: "item-1",
    quantity: 2,
    unitPrice: 45000,
    totalPrice: 90000,
    candle: {
      id: "candle-1",
      name: "Vela Relajante",
      message: "Para mi amor",
      aroma: {
        name: "Lavanda",
        color: "#9333EA",
      },
      container: {
        name: "Vidrio Clásico",
      },
      label: {
        name: "Etiqueta Romántica",
        imageUrl: "https://example.com/label.jpg",
      },
    },
  };

  const mockOrder: Order = {
    id: "order-1",
    totalAmount: 95000,
    shippingAddress: mockShippingAddress,
    status: OrderStatus.PENDING,
    paymentDetails: mockPaymentDetails,
    items: [mockOrderItem],
    userId: mockUser,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  const mockOrders: Order[] = [
    mockOrder,
    {
      ...mockOrder,
      id: "order-2",
      totalAmount: 120000,
      status: OrderStatus.PROCESSING,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockWindowOpen.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getAll", () => {
    it("should return all orders", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockOrders });

      const result = await OrderService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/orders?page=1&limit=10");
      expect(result).toEqual(mockOrders);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no orders exist", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await OrderService.getAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should handle orders with different statuses", async () => {
      const diverseOrders = [
        { ...mockOrder, status: OrderStatus.PENDING },
        { ...mockOrder, id: "order-2", status: OrderStatus.PROCESSING },
        { ...mockOrder, id: "order-3", status: OrderStatus.SHIPPED },
        { ...mockOrder, id: "order-4", status: OrderStatus.DELIVERED },
        { ...mockOrder, id: "order-5", status: OrderStatus.CANCELLED },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: diverseOrders });

      const result = await OrderService.getAll();

      expect(result).toHaveLength(5);
      expect(result[0].status).toBe(OrderStatus.PENDING);
      expect(result[1].status).toBe(OrderStatus.PROCESSING);
      expect(result[2].status).toBe(OrderStatus.SHIPPED);
      expect(result[3].status).toBe(OrderStatus.DELIVERED);
      expect(result[4].status).toBe(OrderStatus.CANCELLED);
    });

    it("should log error and rethrow on API failure", async () => {
      const error = new Error("Network error");
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getAll()).rejects.toThrow("Network error");
      expect(console.error).toHaveBeenCalledWith("Error fetching orders:", error);
    });

    it("should handle 401 unauthorized error", async () => {
      const error = { response: { status: 401, data: { message: "Unauthorized" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getAll()).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error fetching orders:", error);
    });

    it("should handle 403 forbidden error", async () => {
      const error = { response: { status: 403, data: { message: "Forbidden" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getAll()).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error fetching orders:", error);
    });

    it("should handle 500 server error", async () => {
      const error = { response: { status: 500, data: { message: "Internal server error" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getAll()).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error fetching orders:", error);
    });
  });

  describe("getById", () => {
    const testId = "test-order-id";

    it("should return order by id", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockOrder });

      const result = await OrderService.getById(testId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/orders/${testId}`);
      expect(result).toEqual(mockOrder);
    });

    it("should handle order with all fields populated", async () => {
      const completeOrder = {
        ...mockOrder,
        id: testId,
        paymentDetails: mockPaymentDetails,
        items: [mockOrderItem],
      };
      mockAxiosInstance.get.mockResolvedValue({ data: completeOrder });

      const result = await OrderService.getById(testId);

      expect(result).toEqual(completeOrder);
      expect(result.paymentDetails).toBeDefined();
      expect(result.items).toHaveLength(1);
    });

    it("should handle order without optional fields", async () => {
      const minimalOrder = {
        ...mockOrder,
        id: testId,
        paymentDetails: undefined,
      };
      mockAxiosInstance.get.mockResolvedValue({ data: minimalOrder });

      const result = await OrderService.getById(testId);

      expect(result.paymentDetails).toBeUndefined();
    });

    it("should handle UUID format id", async () => {
      const uuidId = "550e8400-e29b-41d4-a716-446655440000";
      mockAxiosInstance.get.mockResolvedValue({ data: { ...mockOrder, id: uuidId } });

      const result = await OrderService.getById(uuidId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/orders/${uuidId}`);
      expect(result.id).toBe(uuidId);
    });

    it("should log error and rethrow on API failure", async () => {
      const error = new Error("Not found");
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getById(testId)).rejects.toThrow("Not found");
      expect(console.error).toHaveBeenCalledWith("Error fetching order:", error);
    });

    it("should handle 404 not found error", async () => {
      const error = { response: { status: 404, data: { message: "Order not found" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getById(testId)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error fetching order:", error);
    });
  });

  describe("getByUser", () => {
    const userId = "user-123";

    it("should return orders by user id", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockOrders });

      const result = await OrderService.getByUser(userId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/orders/user/${userId}`);
      expect(result).toEqual(mockOrders);
    });

    it("should return empty array when user has no orders", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await OrderService.getByUser(userId);

      expect(result).toEqual([]);
    });

    it("should handle multiple orders for same user", async () => {
      const userOrders = [
        { ...mockOrder, id: "order-1" },
        { ...mockOrder, id: "order-2" },
        { ...mockOrder, id: "order-3" },
      ];
      mockAxiosInstance.get.mockResolvedValue({ data: userOrders });

      const result = await OrderService.getByUser(userId);

      expect(result).toHaveLength(3);
      expect(result.every(order => order.userId?.id === mockUser.id)).toBeTruthy();
    });

    it("should log error and rethrow on API failure", async () => {
      const error = new Error("User not found");
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getByUser(userId)).rejects.toThrow("User not found");
      expect(console.error).toHaveBeenCalledWith("Error fetching user orders:", error);
    });

    it("should handle invalid user id", async () => {
      const error = { response: { status: 400, data: { message: "Invalid user ID" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getByUser("invalid-id")).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error fetching user orders:", error);
    });
  });

  describe("create", () => {
    const createOrderRequest: CreateOrderRequest = {
      totalAmount: 95000,
      shippingAddress: mockShippingAddress,
      paymentDetails: mockPaymentDetails,
      items: [
        {
          quantity: 2,
          unitPrice: 45000,
          totalPrice: 90000,
          candle: mockOrderItem.candle,
        },
      ],
    };

    it("should create a new order", async () => {
      const createdOrder = {
        ...mockOrder,
        id: "new-order-id",
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdOrder });

      const result = await OrderService.create(createOrderRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/orders", createOrderRequest);
      expect(result).toEqual(createdOrder);
      expect(result.id).toBe("new-order-id");
    });

    it("should create order without payment details", async () => {
      const requestWithoutPayment = {
        ...createOrderRequest,
        paymentDetails: undefined,
      };
      const createdOrder = {
        ...mockOrder,
        paymentDetails: undefined,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdOrder });

      const result = await OrderService.create(requestWithoutPayment);

      expect(result.paymentDetails).toBeUndefined();
    });

    it("should create order with multiple items", async () => {
      const multiItemRequest = {
        ...createOrderRequest,
        totalAmount: 150000,
        items: [
          mockOrderItem,
          {
            quantity: 1,
            unitPrice: 60000,
            totalPrice: 60000,
            gift: {
              id: "gift-1",
              name: "Gift Box Premium",
              price: 60000,
              description: "Elegant gift box",
            },
          },
        ],
      };
      const createdOrder = {
        ...mockOrder,
        totalAmount: 150000,
        items: multiItemRequest.items,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdOrder });

      const result = await OrderService.create(multiItemRequest);

      expect(result.items).toHaveLength(2);
      expect(result.totalAmount).toBe(150000);
    });

    it("should log error and rethrow on API failure", async () => {
      const error = new Error("Creation failed");
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(OrderService.create(createOrderRequest)).rejects.toThrow("Creation failed");
      expect(console.error).toHaveBeenCalledWith("Error creating order:", error);
    });

    it("should handle 400 validation error", async () => {
      const error = {
        response: {
          status: 400,
          data: { message: "Invalid order data", errors: { totalAmount: ["Total amount is required"] } },
        },
      };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(OrderService.create(createOrderRequest)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error creating order:", error);
    });
  });

  describe("update", () => {
    const testId = "update-order-id";
    const updateData: Partial<Order> = {
      totalAmount: 100000,
      status: OrderStatus.PROCESSING,
    };

    it("should update order", async () => {
      const updatedOrder = { ...mockOrder, ...updateData, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedOrder });

      const result = await OrderService.update(testId, updateData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/orders/${testId}`, updateData);
      expect(result).toEqual(updatedOrder);
      expect(result.totalAmount).toBe(100000);
    });

    it("should update shipping address", async () => {
      const newAddress: ShippingAddress = {
        street: "Nueva Calle 456",
        city: "Medellín",
        state: "Antioquia",
        country: "Colombia",
        zipCode: "050001",
      };
      const addressUpdate = { shippingAddress: newAddress };
      const updatedOrder = { ...mockOrder, ...addressUpdate, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedOrder });

      const result = await OrderService.update(testId, addressUpdate);

      expect(result.shippingAddress.city).toBe("Medellín");
      expect(result.shippingAddress.state).toBe("Antioquia");
    });

    it("should log error and rethrow on API failure", async () => {
      const error = new Error("Update failed");
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(OrderService.update(testId, updateData)).rejects.toThrow("Update failed");
      expect(console.error).toHaveBeenCalledWith("Error updating order:", error);
    });

    it("should handle 404 not found error", async () => {
      const error = { response: { status: 404, data: { message: "Order not found" } } };
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(OrderService.update(testId, updateData)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error updating order:", error);
    });
  });

  describe("updateStatus", () => {
    const testId = "status-update-order-id";

    it("should update order status and send WhatsApp notification", async () => {
      const updatedOrder = { ...mockOrder, status: OrderStatus.PROCESSING, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedOrder });

      const result = await OrderService.updateStatus(testId, OrderStatus.PROCESSING);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/orders/${testId}/status`, {
        status: OrderStatus.PROCESSING,
      });
      expect(result).toEqual(updatedOrder);
      expect(mockWindowOpen).toHaveBeenCalled();
    });

    it("should update status without WhatsApp notification if no user phone", async () => {
      const orderWithoutPhone = {
        ...mockOrder,
        userId: { ...mockUser, phone: "", phoneCountryCode: "" },
        status: OrderStatus.SHIPPED,
        id: testId,
      };
      mockAxiosInstance.put.mockResolvedValue({ data: orderWithoutPhone });

      const result = await OrderService.updateStatus(testId, OrderStatus.SHIPPED);

      expect(result.status).toBe(OrderStatus.SHIPPED);
      expect(console.warn).toHaveBeenCalledWith("Usuario sin información de teléfono para notificación WhatsApp");
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it("should handle WhatsApp notification error gracefully", async () => {
      const updatedOrder = { ...mockOrder, status: OrderStatus.DELIVERED, id: testId };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedOrder });
      mockWindowOpen.mockImplementation(() => {
        throw new Error("WhatsApp error");
      });

      const result = await OrderService.updateStatus(testId, OrderStatus.DELIVERED);

      expect(result).toEqual(updatedOrder);
      expect(console.error).toHaveBeenCalledWith(
        "Error enviando notificación WhatsApp:",
        expect.any(Error)
      );
    });

    it("should log error and rethrow on status update failure", async () => {
      const error = new Error("Status update failed");
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(OrderService.updateStatus(testId, OrderStatus.CANCELLED)).rejects.toThrow(
        "Status update failed"
      );
      expect(console.error).toHaveBeenCalledWith("Error updating order status:", error);
    });
  });

  describe("sendWhatsAppNotification", () => {
    it("should open WhatsApp with correct URL and message", async () => {
      await OrderService.sendWhatsAppNotification(mockOrder, OrderStatus.PROCESSING);

      const expectedPhone = "573001234567";
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining(`/api.whatsapp.com/send?phone=${expectedPhone}`),
        "_blank"
      );
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining("En%20Proceso"),
        "_blank"
      );
    });

    it("should warn and return early if user has no phone", async () => {
      const orderWithoutPhone = {
        ...mockOrder,
        userId: { ...mockUser, phone: "", phoneCountryCode: "" },
      };

      await OrderService.sendWhatsAppNotification(orderWithoutPhone, OrderStatus.PROCESSING);

      expect(console.warn).toHaveBeenCalledWith("Usuario sin información de teléfono para notificación WhatsApp");
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it("should handle null user", async () => {
      const orderWithoutUser = { ...mockOrder, userId: null };

      await OrderService.sendWhatsAppNotification(orderWithoutUser, OrderStatus.PROCESSING);

      expect(console.warn).toHaveBeenCalledWith("Usuario sin información de teléfono para notificación WhatsApp");
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it("should clean phone number format", async () => {
      const orderWithSpecialPhone = {
        ...mockOrder,
        userId: { ...mockUser, phone: "(300) 123-4567", phoneCountryCode: "+57" },
      };

      await OrderService.sendWhatsAppNotification(orderWithSpecialPhone, OrderStatus.DELIVERED);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining("/api.whatsapp.com/send?phone="),
        "_blank"
      );
    });
  });

  describe("delete", () => {
    const testId = "delete-order-id";

    it("should delete order", async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await OrderService.delete(testId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/orders/${testId}`);
    });

    it("should log error and rethrow on API failure", async () => {
      const error = new Error("Deletion failed");
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(OrderService.delete(testId)).rejects.toThrow("Deletion failed");
      expect(console.error).toHaveBeenCalledWith("Error deleting order:", error);
    });

    it("should handle 404 not found error", async () => {
      const error = { response: { status: 404, data: { message: "Order not found" } } };
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(OrderService.delete(testId)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error deleting order:", error);
    });

    it("should handle 403 forbidden error", async () => {
      const error = { response: { status: 403, data: { message: "Cannot delete order" } } };
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(OrderService.delete(testId)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error deleting order:", error);
    });
  });

  describe("processPayment", () => {
    const testId = "payment-order-id";
    const paymentDetails = {
      method: "credit_card",
      amount: 95000,
      token: "card_token_123",
    };

    it("should process payment successfully", async () => {
      const paidOrder = {
        ...mockOrder,
        paymentDetails: { ...mockPaymentDetails, status: "completed" },
        id: testId,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: paidOrder });

      const result = await OrderService.processPayment(testId, paymentDetails);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/orders/${testId}/payment`, paymentDetails);
      expect(result).toEqual(paidOrder);
      expect(result.paymentDetails?.status).toBe("completed");
    });

    it("should handle payment processing with different methods", async () => {
      const psePaymentDetails = {
        method: "pse",
        amount: 95000,
        bank: "bancolombia",
      };
      const paidOrder = {
        ...mockOrder,
        paymentDetails: { ...mockPaymentDetails, method: "pse" },
        id: testId,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: paidOrder });

      const result = await OrderService.processPayment(testId, psePaymentDetails);

      expect(result.paymentDetails?.method).toBe("pse");
    });

    it("should log error and rethrow on payment failure", async () => {
      const error = new Error("Payment processing failed");
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(OrderService.processPayment(testId, paymentDetails)).rejects.toThrow(
        "Payment processing failed"
      );
      expect(console.error).toHaveBeenCalledWith("Error processing payment:", error);
    });

    it("should handle 402 payment required error", async () => {
      const error = { response: { status: 402, data: { message: "Payment failed" } } };
      mockAxiosInstance.post.mockRejectedValue(error);

      await expect(OrderService.processPayment(testId, paymentDetails)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error processing payment:", error);
    });
  });

  describe("Utility Methods", () => {
    describe("getStatusMessage", () => {
      it("should return correct message for PENDING status", () => {
        const message = OrderService.getStatusMessage(OrderStatus.PENDING);
        expect(message).toContain("pendiente de confirmación");
      });

      it("should return correct message for PROCESSING status", () => {
        const message = OrderService.getStatusMessage(OrderStatus.PROCESSING);
        expect(message).toContain("siendo preparado");
      });

      it("should return correct message for SHIPPED status", () => {
        const message = OrderService.getStatusMessage(OrderStatus.SHIPPED);
        expect(message).toContain("en camino");
      });

      it("should return correct message for DELIVERED status", () => {
        const message = OrderService.getStatusMessage(OrderStatus.DELIVERED);
        expect(message).toContain("ha sido entregado");
      });

      it("should return correct message for CANCELLED status", () => {
        const message = OrderService.getStatusMessage(OrderStatus.CANCELLED);
        expect(message).toContain("ha sido cancelado");
      });

      it("should return default message for unknown status", () => {
        const message = OrderService.getStatusMessage("UNKNOWN" as OrderStatus);
        expect(message).toBe("El estado de tu pedido ha sido actualizado.");
      });
    });

    describe("getStatusColor", () => {
      it("should return correct color classes for each status", () => {
        expect(OrderService.getStatusColor(OrderStatus.PENDING)).toContain("yellow");
        expect(OrderService.getStatusColor(OrderStatus.PROCESSING)).toContain("blue");
        expect(OrderService.getStatusColor(OrderStatus.SHIPPED)).toContain("purple");
        expect(OrderService.getStatusColor(OrderStatus.DELIVERED)).toContain("green");
        expect(OrderService.getStatusColor(OrderStatus.CANCELLED)).toContain("red");
      });

      it("should return default gray color for unknown status", () => {
        const color = OrderService.getStatusColor("UNKNOWN" as OrderStatus);
        expect(color).toContain("gray");
      });
    });

    describe("getStatusLabel", () => {
      it("should return correct Spanish labels for each status", () => {
        expect(OrderService.getStatusLabel(OrderStatus.PENDING)).toBe("Pendiente");
        expect(OrderService.getStatusLabel(OrderStatus.PROCESSING)).toBe("En Proceso");
        expect(OrderService.getStatusLabel(OrderStatus.SHIPPED)).toBe("Enviado");
        expect(OrderService.getStatusLabel(OrderStatus.DELIVERED)).toBe("Entregado");
        expect(OrderService.getStatusLabel(OrderStatus.CANCELLED)).toBe("Cancelado");
      });

      it("should return the status itself for unknown status", () => {
        const unknownStatus = "UNKNOWN" as OrderStatus;
        expect(OrderService.getStatusLabel(unknownStatus)).toBe(unknownStatus);
      });
    });

    describe("generateWhatsAppUrl", () => {
      it("should generate correct WhatsApp URL", () => {
        const url = OrderService.generateWhatsAppUrl("+57", "3001234567", "order-123");
        
        expect(url).toContain("wa.me/573001234567");
        expect(url).toContain("order-123");
        expect(url).toContain("AromaLife");
      });

      it("should clean phone number from special characters", () => {
        const url = OrderService.generateWhatsAppUrl("+57", "(300) 123-4567", "order-123");
        
        expect(url).toContain("wa.me/573001234567");
      });

      it("should encode message properly", () => {
        const url = OrderService.generateWhatsAppUrl("+57", "3001234567", "order-123");
        
        expect(url).toContain("Hola!");
        expect(url).not.toContain(" "); // Spaces should be encoded
      });
    });

    describe("formatPrice", () => {
      it("should format price in Colombian pesos", () => {
        const formatted = OrderService.formatPrice(95000);
        
        expect(formatted).toContain("$");
        expect(formatted).toContain("95.000");// minimumFractionDigits: 0
      });

      it("should handle zero price", () => {
        const formatted = OrderService.formatPrice(0);
        
        expect(formatted).toContain("$");
        expect(formatted).toContain("0");
      });

      it("should handle large numbers", () => {
        const formatted = OrderService.formatPrice(1500000);
        
        expect(formatted).toContain("$");
        expect(formatted).toContain("1.500.000");
      });

      it("should handle decimal values", () => {
        const formatted = OrderService.formatPrice(95750.50);
        
        expect(formatted).toContain("$");
        expect(formatted).toContain("95.750,5"); // Rounded due to minimumFractionDigits: 0
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle network timeout", async () => {
      const error = { code: "ECONNABORTED", message: "timeout of 5000ms exceeded" };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getAll()).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error fetching orders:", error);
    });

    it("should handle service unavailable error", async () => {
      const error = { response: { status: 503, data: { message: "Service unavailable" } } };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(OrderService.getAll()).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith("Error fetching orders:", error);
    });

    it("should handle malformed response data", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: null });

      const result = await OrderService.getAll();

      expect(result).toBeNull();
    });

    it("should handle very large order amounts", async () => {
      const largeOrder = { ...mockOrder, totalAmount: 999999999 };
      mockAxiosInstance.get.mockResolvedValue({ data: largeOrder });

      const result = await OrderService.getById("large-order");

      expect(result.totalAmount).toBe(999999999);
    });

    it("should handle orders with many items", async () => {
      const manyItems = Array.from({ length: 50 }, (_, index) => ({
        ...mockOrderItem,
        id: `item-${index}`,
      }));
      const orderWithManyItems = { ...mockOrder, items: manyItems };
      mockAxiosInstance.get.mockResolvedValue({ data: orderWithManyItems });

      const result = await OrderService.getById("many-items-order");

      expect(result.items).toHaveLength(50);
    });

    it("should handle special characters in shipping address", async () => {
      const specialAddress: ShippingAddress = {
        street: "Carrera 7 #123-45 Apto 301 – Edificio María José",
        city: "Bogotá D.C.",
        state: "Cundinamarca",
        country: "Colombia",
        zipCode: "110111",
      };
      const orderWithSpecialAddress = { ...mockOrder, shippingAddress: specialAddress };
      mockAxiosInstance.get.mockResolvedValue({ data: orderWithSpecialAddress });

      const result = await OrderService.getById("special-address-order");

      expect(result.shippingAddress.street).toContain("María José");
      expect(result.shippingAddress.city).toBe("Bogotá D.C.");
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete order lifecycle", async () => {
      // Create order
      const createRequest: CreateOrderRequest = {
        totalAmount: 95000,
        shippingAddress: mockShippingAddress,
        items: [mockOrderItem],
      };
      const createdOrder = { ...mockOrder, status: OrderStatus.PENDING };
      mockAxiosInstance.post.mockResolvedValue({ data: createdOrder });

      const created = await OrderService.create(createRequest);
      expect(created.status).toBe(OrderStatus.PENDING);

      // Update status to processing
      const processingOrder = { ...createdOrder, status: OrderStatus.PROCESSING };
      mockAxiosInstance.put.mockResolvedValue({ data: processingOrder });

      const processing = await OrderService.updateStatus(created.id, OrderStatus.PROCESSING);
      expect(processing.status).toBe(OrderStatus.PROCESSING);

      // Process payment
      const paidOrder = { ...processingOrder, paymentDetails: mockPaymentDetails };
      mockAxiosInstance.post.mockResolvedValue({ data: paidOrder });

      const paid = await OrderService.processPayment(created.id, mockPaymentDetails);
      expect(paid.paymentDetails).toBeDefined();

      // Update to shipped
      const shippedOrder = { ...paidOrder, status: OrderStatus.SHIPPED };
      mockAxiosInstance.put.mockResolvedValue({ data: shippedOrder });

      const shipped = await OrderService.updateStatus(created.id, OrderStatus.SHIPPED);
      expect(shipped.status).toBe(OrderStatus.SHIPPED);

      // Final delivery
      const deliveredOrder = { ...shippedOrder, status: OrderStatus.DELIVERED };
      mockAxiosInstance.put.mockResolvedValue({ data: deliveredOrder });

      const delivered = await OrderService.updateStatus(created.id, OrderStatus.DELIVERED);
      expect(delivered.status).toBe(OrderStatus.DELIVERED);
    });

    it("should handle order cancellation flow", async () => {
      const orderToCancel = { ...mockOrder, status: OrderStatus.PENDING };
      mockAxiosInstance.put.mockResolvedValue({ data: { ...orderToCancel, status: OrderStatus.CANCELLED } });

      const cancelled = await OrderService.updateStatus(orderToCancel.id, OrderStatus.CANCELLED);

      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
      expect(mockWindowOpen).toHaveBeenCalled(); // Should still send notification
    });
  });
});