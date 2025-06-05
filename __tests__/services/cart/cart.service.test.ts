import axios from "@/lib/axios";
import { AxiosError } from "axios";
import { CartService } from "@/services/cart/cart.service";
import type { Cart, CartItem, CreateCartRequest, AddCartItemRequest, UpdateCartItemRequest } from "@/types/cart";

// Mock axios
jest.mock("@/lib/axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Mock window.location for processPayment
const originalLocation = window.location;

beforeAll(() => {
  delete (window as any).location;
  (window as any).location = {
    origin: "http://localhost:3000",
  };
});

afterAll(() => {
  window.location = originalLocation;
});

describe("CartService", () => {
  // Mock data
  const mockUser = {
    id: "user1",
    name: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "1234567890",
    phoneCountryCode: "+1",
    city: "New York",
    state: "NY",
    country: "USA",
    address: "123 Main St",
    roles: ["user"],
    isActive: true,
    createdAt: new Date("2023-01-01T00:00:00Z"),
    updatedAt: new Date("2023-01-01T00:00:00Z"),
  };

  const mockCart: Cart = {
    id: "cart1",
    userId: mockUser,
    checkedOut: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    cartItems: [],
  };

  const mockCartItem: CartItem = {
    id: "item1",
    cartId: "cart1",
    candleId: "candle1",
    quantity: 2,
    unitPrice: 25.99,
    totalPrice: 51.98,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    candle: {
        id: "candle1",
        name: "Lavender Candle",
        price: 25.99,
        description: "Calming lavender scent",
        createdAt: "",
        updatedAt: "",
        container: {
            id: "",
            name: "",
            price: 0,
            description: undefined,
            imageUrl: undefined
        },
        aroma: {
            color: "",
            id: "",
            name: "",
            price: 0,
            description: undefined,
            imageUrl: undefined
        }
    },
  };

  const mockCartWithItems: Cart = {
    ...mockCart,
    cartItems: [mockCartItem],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  // Tests for create
  describe("create", () => {
    it("should create cart successfully", async () => {
      const createRequest: CreateCartRequest = {
          userId: "user1",
          checkedOut: false
      };
      mockedAxios.post.mockResolvedValue({ data: mockCart });

      const result = await CartService.create(createRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith("/cart", createRequest);
      expect(result).toEqual(mockCart);
    });

    it("should handle 400 error with invalid user ID", async () => {
      const createRequest: CreateCartRequest = {
          userId: "",
          checkedOut: false
      };
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        status: 400,
        data: { message: "User ID is required" },
        statusText: "Bad Request",
        headers: {},
        config: {} as any,
      };
      mockedAxios.post.mockRejectedValue(axiosError);

      await expect(CartService.create(createRequest)).rejects.toThrow(
        "User ID is required"
      );
    });

    it("should handle 500 error", async () => {
      const createRequest: CreateCartRequest = {
          userId: "user1",
          checkedOut: false
      };
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        status: 500,
        data: { message: "Internal server error" },
        statusText: "Internal Server Error",
        headers: {},
        config: {} as any,
      };
      mockedAxios.post.mockRejectedValue(axiosError);

      await expect(CartService.create(createRequest)).rejects.toThrow(
        "Error interno del servidor. Inténtalo de nuevo más tarde"
      );
    });
  });

  // Tests for getById
  describe("getById", () => {
    it("should get cart by ID successfully", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockCart });

      const result = await CartService.getById("cart1");

      expect(mockedAxios.get).toHaveBeenCalledWith("/cart/cart1");
      expect(result).toEqual(mockCart);
    });

    it("should handle 404 error when cart not found", async () => {
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        status: 404,
        data: { message: "Cart not found" },
        statusText: "Not Found",
        headers: {},
        config: {} as any,
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CartService.getById("cart1")).rejects.toThrow(
        "Carrito no encontrado"
      );
    });
  });

  // Tests for addItem
  describe("addItem", () => {
    it("should add item to cart successfully", async () => {
      const itemRequest: AddCartItemRequest = {
        candleId: "candle1",
        quantity: 2,
        unitPrice: 25.99,
        totalPrice: 51.98,
      };
      mockedAxios.post.mockResolvedValue({ data: mockCartItem });

      const result = await CartService.addItem("cart1", itemRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/cart/cart1/items",
        itemRequest
      );
      expect(result).toEqual(mockCartItem);
    });

    it("should handle 409 error when item already exists", async () => {
      const itemRequest: AddCartItemRequest = {
        candleId: "candle1",
        quantity: 2,
        unitPrice: 25.99,
        totalPrice: 51.98,
      };
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        status: 409,
        data: { message: "Item already exists" },
        statusText: "Conflict",
        headers: {},
        config: {} as any,
      };
      mockedAxios.post.mockRejectedValue(axiosError);

      await expect(CartService.addItem("cart1", itemRequest)).rejects.toThrow(
        "El artículo ya existe en el carrito"
      );
    });
  });

  // Tests for updateItem
  describe("updateItem", () => {
    it("should update item successfully", async () => {
      const updates: UpdateCartItemRequest = {
        quantity: 3,
        unitPrice: 25.99,
        totalPrice: 77.97,
      };
      mockedAxios.patch.mockResolvedValue({ data: { ...mockCartItem, ...updates } });

      const result = await CartService.updateItem("cart1", "item1", updates);

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        "/cart/cart1/items/item1",
        updates
      );
      expect(result.quantity).toBe(3);
      expect(result.totalPrice).toBe(77.97);
    });

    it("should handle 400 error with invalid quantity", async () => {
      const updates: UpdateCartItemRequest = { quantity: -1 };
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        status: 400,
        data: { message: "Invalid quantity" },
        statusText: "Bad Request",
        headers: {},
        config: {} as any,
      };
      mockedAxios.patch.mockRejectedValue(axiosError);

      await expect(
        CartService.updateItem("cart1", "item1", updates)
      ).rejects.toThrow("La cantidad no es válida");
    });
  });

  // Tests for removeItem
  describe("removeItem", () => {
    it("should remove item successfully", async () => {
      mockedAxios.delete.mockResolvedValue({});

      await CartService.removeItem("cart1", "item1");

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "/cart/cart1/items/item1"
      );
    });

    it("should handle 404 error when item not found", async () => {
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        status: 404,
        data: { message: "Item not found" },
        statusText: "Not Found",
        headers: {},
        config: {} as any,
      };
      mockedAxios.delete.mockRejectedValue(axiosError);

      await expect(
        CartService.removeItem("cart1", "item1")
      ).rejects.toThrow("Artículo no encontrado en el carrito");
    });
  });

  // Tests for delete
  describe("delete", () => {
    it("should delete cart successfully", async () => {
      mockedAxios.delete.mockResolvedValue({});

      await CartService.delete("cart1");

      expect(mockedAxios.delete).toHaveBeenCalledWith("/cart/cart1");
    });

    it("should handle 500 error", async () => {
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        status: 500,
        data: { message: "Internal server error" },
        statusText: "Internal Server Error",
        headers: {},
        config: {} as any,
      };
      mockedAxios.delete.mockRejectedValue(axiosError);

      await expect(CartService.delete("cart1")).rejects.toThrow(
        "Error interno del servidor. Inténtalo de nuevo más tarde"
      );
    });
  });
  // Tests for assignUser
  describe("assignUser", () => {
    it("should assign user successfully", async () => {
      const newUser = { ...mockUser, id: "user2" };
      mockedAxios.patch.mockResolvedValue({ data: { ...mockCart, userId: newUser } });

      const result = await CartService.assignUser("cart1", "user2");

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        "/cart/cart1/assign-user/user2"
      );
      expect(result.userId.id).toBe("user2");
    });

    it("should handle 403 error", async () => {
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        status: 403,
        data: { message: "Forbidden" },
        statusText: "Forbidden",
        headers: {},
        config: {} as any,
      };
      mockedAxios.patch.mockRejectedValue(axiosError);

      await expect(
        CartService.assignUser("cart1", "user2")
      ).rejects.toThrow("No tienes permisos para acceder a este recurso");
    });
  });

  // Tests for getByUser
  describe("getByUser", () => {
    it("should get cart by user successfully", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockCart });

      const result = await CartService.getByUser("user1");

      expect(mockedAxios.get).toHaveBeenCalledWith("/cart/user/user1");
      expect(result).toEqual(mockCart);
    });

    it("should handle 404 error when user not found", async () => {
      const axiosError = new AxiosError("Request failed");
      axiosError.response = {
        status: 404,
        data: { message: "User not found" },
        statusText: "Not Found",
        headers: {},
        config: {} as any,
      };
      mockedAxios.get.mockRejectedValue(axiosError);

      await expect(CartService.getByUser("user1")).rejects.toThrow(
        "Recurso no encontrado"
      );
    });
  });

  // Tests for getCartSummary
  describe("getCartSummary", () => {
    it("should calculate cart summary correctly", () => {
      const cart: Cart = {
        ...mockCart,
        cartItems: [
          {
            ...mockCartItem,
            quantity: 2,
            totalPrice: 51.98,
          },
          {
            ...mockCartItem,
            id: "item2",
            giftId: "gift1",
            candleId: undefined,
            quantity: 1,
            unitPrice: 10,
            totalPrice: 10,
          },
        ],
      };

      const summary = CartService.getCartSummary(cart);

      expect(summary.totalItems).toBe(3); // 2 + 1
      expect(summary.totalPrice).toBe(61.98); // 51.98 + 10
      expect(summary.candleCount).toBe(1);
      expect(summary.giftCount).toBe(1);
    });
  });

  // Tests for calculateItemTotal
  describe("calculateItemTotal", () => {
    it("should calculate item total correctly", () => {
      const total = CartService.calculateItemTotal(3, 10.5);
      expect(total).toBe(31.5);
    });
  });

  // Tests for processPayment
  describe("processPayment", () => {
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
    };

    it("should process payment successfully", async () => {
      // Mock cart fetch
      mockedAxios.get.mockResolvedValueOnce({ data: mockCartWithItems });
      
      // Mock payment preference creation
      mockedAxios.post.mockResolvedValueOnce({
        data: { init_point: "https://mercadopago.com/checkout" },
      });

      const result = await CartService.processPayment("cart1", userData);

      // Verify cart fetch
      expect(mockedAxios.get).toHaveBeenCalledWith("/cart/cart1");
      
      // Verify payment preference call
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/payment/create-preference",
        {
          cartId: "cart1",
          items: [
            {
              id: "candle1",
              title: "Lavender Candle",
              quantity: 2,
              unit_price: 25.99,
              currency_id: "COP",
            },
          ],
          payer: {
            name: "John Doe",
            email: "john@example.com",
            phone: { number: "1234567890" },
          },
          back_urls: {
            success: "http://localhost/payment/success",
            failure: "http://localhost/payment/failure",
            pending: "http://localhost/payment/pending",
          },
          auto_return: "approved",
          external_reference: "cart1",
        }
      );
      
      expect(result).toBe("https://mercadopago.com/checkout");
    });

    it("should handle empty cart error", async () => {
      // Mock empty cart
      mockedAxios.get.mockResolvedValueOnce({ data: { ...mockCart, cartItems: [] } });

      await expect(
        CartService.processPayment("cart1", userData)
      ).rejects.toThrow("Error al procesar el pago: Request failed");
    });

    it("should handle cart fetch error", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        CartService.processPayment("cart1", userData)
      ).rejects.toThrow("Error al procesar el pago: Network error");
    });

    it("should handle payment creation error", async () => {
      // Mock cart fetch
      mockedAxios.get.mockResolvedValueOnce({ data: mockCartWithItems });
      
      // Mock payment error
      mockedAxios.post.mockRejectedValueOnce(new Error("Payment failed"));

      await expect(
        CartService.processPayment("cart1", userData)
      ).rejects.toThrow("Error al procesar el pago: Payment failed");
    });
  });

  // Tests for error translation
  describe("Error Translation", () => {
    it("should translate ECONNABORTED to timeout message", async () => {
      const timeoutError = new AxiosError("Request failed");
      timeoutError.code = "ECONNABORTED";
      mockedAxios.get.mockRejectedValue(timeoutError);

      await expect(CartService.getById("cart1")).rejects.toThrow(
        "Error de conexión. Verifica tu conexión a internet"
      );
    });

    it("should translate ENOTFOUND to connection error", async () => {
      const connectionError = new AxiosError("Request failed");
      connectionError.code = "ENOTFOUND";
      mockedAxios.get.mockRejectedValue(connectionError);

      await expect(CartService.getById("cart1")).rejects.toThrow(
        "Error de conexión. Verifica tu conexión a internet"
      );
    });

    it("should handle non-Axios errors", async () => {
      const genericError = new Error("Generic error");
      mockedAxios.get.mockRejectedValue(genericError);

      await expect(CartService.getById("cart1")).rejects.toThrow(
        "Error de conexión. Verifica tu conexión a internet"
      );
    });
  });
});