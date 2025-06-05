import { useCartStore } from '@/stores/cart-store';
import { CartService } from '@/services/cart/cart.service';
import { Cart, CartItem, CartSummary } from '@/types/cart';

// Mock CartService
jest.mock('@/services/cart/cart.service', () => ({
  CartService: {
    getById: jest.fn(),
    getByUser: jest.fn(),
    create: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    calculateItemTotal: jest.fn(),
    getCartSummary: jest.fn(),
  },
}));

const mockCartService = CartService as jest.Mocked<typeof CartService>;

// Mock cart data
const mockCartItem: CartItem = {
    id: 'item1',
    candleId: 'candle1',
    giftId: undefined,
    quantity: 2,
    unitPrice: 25.99,
    totalPrice: 51.98,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cartId: 'cart1'
};

const mockCart: Cart = {
  id: 'cart1',
  userId: {
      id: 'user1', name: 'John Doe',
      email: '',
      lastName: '',
      phone: '',
      phoneCountryCode: '',
      city: '',
      country: '',
      address: '',
      roles: []
  },
  cartItems: [mockCartItem],
  checkedOut: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockCartSummary: CartSummary = {
  totalItems: 2,
  totalPrice: 51.98,
  candleCount: 2,
  giftCount: 0,
};

describe('CartStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset store state
    useCartStore.setState({
      cart: null,
      loading: false,
      error: null,
    });

    // Setup default mock implementations
    mockCartService.calculateItemTotal.mockImplementation((quantity, unitPrice) => quantity * unitPrice);
    mockCartService.getCartSummary.mockReturnValue(mockCartSummary);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useCartStore.getState();
      
      expect(state.cart).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Basic Setters', () => {
    it('should set cart', () => {
      const { setCart } = useCartStore.getState();
      setCart(mockCart);

      const state = useCartStore.getState();
      expect(state.cart).toEqual(mockCart);
    });

    it('should set loading state', () => {
      const { setLoading } = useCartStore.getState();
      setLoading(true);

      const state = useCartStore.getState();
      expect(state.loading).toBe(true);
    });

    it('should set error state', () => {
      const { setError } = useCartStore.getState();
      setError('Test error');

      const state = useCartStore.getState();
      expect(state.error).toBe('Test error');
    });
  });

  describe('Load Cart', () => {
    it('should load cart by ID successfully', async () => {
      mockCartService.getById.mockResolvedValue(mockCart);

      const { loadCart } = useCartStore.getState();
      await loadCart('cart1');

      const state = useCartStore.getState();
      expect(state.cart).toEqual(mockCart);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockCartService.getById).toHaveBeenCalledWith('cart1');
    });

    it('should handle load cart error', async () => {
      const errorMessage = 'Cart not found';
      mockCartService.getById.mockRejectedValue(new Error(errorMessage));

      const { loadCart } = useCartStore.getState();
      await loadCart('invalid-cart');

      const state = useCartStore.getState();
      expect(state.cart).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle non-Error rejection', async () => {
      mockCartService.getById.mockRejectedValue('String error');

      const { loadCart } = useCartStore.getState();
      await loadCart('cart1');

      const state = useCartStore.getState();
      expect(state.error).toBe('Error al cargar el carrito');
    });
  });

  describe('Load User Cart', () => {
    it('should load user cart successfully', async () => {
      mockCartService.getByUser.mockResolvedValue(mockCart);

      const { loadUserCart } = useCartStore.getState();
      await loadUserCart('user1');

      const state = useCartStore.getState();
      expect(state.cart).toEqual(mockCart);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockCartService.getByUser).toHaveBeenCalledWith('user1');
    });

    it('should handle load user cart error', async () => {
      const errorMessage = 'User not found';
      mockCartService.getByUser.mockRejectedValue(new Error(errorMessage));

      const { loadUserCart } = useCartStore.getState();
      await loadUserCart('invalid-user');

      const state = useCartStore.getState();
      expect(state.cart).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('Create Cart', () => {
    it('should create cart successfully', async () => {
      const newCart = { ...mockCart, id: 'new-cart' };
      mockCartService.create.mockResolvedValue(newCart);

      const { createCart } = useCartStore.getState();
      await createCart('user1');

      const state = useCartStore.getState();
      expect(state.cart).toEqual(newCart);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockCartService.create).toHaveBeenCalledWith({
        userId: 'user1',
        checkedOut: false,
      });
    });

    it('should handle create cart error', async () => {
      const errorMessage = 'Failed to create cart';
      mockCartService.create.mockRejectedValue(new Error(errorMessage));

      const { createCart } = useCartStore.getState();
      await createCart('user1');

      const state = useCartStore.getState();
      expect(state.cart).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('Add Item to Cart', () => {
    const itemToAdd = {
      candleId: 'candle2',
      quantity: 1,
      unitPrice: 29.99,
    };

    beforeEach(() => {
      useCartStore.setState({ cart: mockCart });
    });

    it('should add item to cart successfully and reload by user ID', async () => {
      const updatedCart = {
        ...mockCart,
        cartItems: [...mockCart.cartItems, { ...mockCartItem, id: 'item2' }],
      };

      mockCartService.addItem.mockResolvedValue({ ...mockCartItem, id: 'item2' });
      mockCartService.getByUser.mockResolvedValue(updatedCart);

      const { addItemToCart } = useCartStore.getState();
      await addItemToCart('cart1', itemToAdd);

      const state = useCartStore.getState();
      expect(state.cart).toEqual(updatedCart);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      expect(mockCartService.calculateItemTotal).toHaveBeenCalledWith(1, 29.99);
      expect(mockCartService.addItem).toHaveBeenCalledWith('cart1', {
        ...itemToAdd,
        unitPrice: 29.99,
        totalPrice: 29.99,
      });
      expect(mockCartService.getByUser).toHaveBeenCalledWith('user1');
    });

    it('should handle add item error', async () => {
      const errorMessage = 'Failed to add item';
      mockCartService.addItem.mockRejectedValue(new Error(errorMessage));

      const { addItemToCart } = useCartStore.getState();
      await addItemToCart('cart1', itemToAdd);

      const state = useCartStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle string unit price conversion', async () => {
      const itemWithStringPrice = {
        ...itemToAdd,
        unitPrice: '29.99' as any,
      };

      mockCartService.addItem.mockResolvedValue(mockCartItem);
      mockCartService.getByUser.mockResolvedValue(mockCart);

      const { addItemToCart } = useCartStore.getState();
      await addItemToCart('cart1', itemWithStringPrice);

      expect(mockCartService.calculateItemTotal).toHaveBeenCalledWith(1, 29.99);
      expect(mockCartService.addItem).toHaveBeenCalledWith('cart1', {
        ...itemWithStringPrice,
        unitPrice: 29.99,
        totalPrice: 29.99,
      });
    });
  });

  describe('Update Cart Item', () => {
    beforeEach(() => {
      useCartStore.setState({ cart: mockCart });
    });

    it('should update cart item with quantity change', async () => {
      const updates = { quantity: 3, unitPrice: 25.99 };
      const updatedCart = { ...mockCart };

      mockCartService.updateItem.mockResolvedValue(undefined);
      mockCartService.getByUser.mockResolvedValue(updatedCart);

      const { updateCartItem } = useCartStore.getState();
      await updateCartItem('cart1', 'item1', updates);

      expect(mockCartService.calculateItemTotal).toHaveBeenCalledWith(3, 25.99);
      expect(mockCartService.updateItem).toHaveBeenCalledWith('cart1', 'item1', {
        quantity: 3,
        unitPrice: 25.99,
        totalPrice: 77.97,
      });
      expect(mockCartService.getByUser).toHaveBeenCalledWith('user1');
    });

    it('should update cart item without quantity change', async () => {
      const updates = { unitPrice: 30.99 };
      const updatedCart = { ...mockCart };

      mockCartService.updateItem.mockResolvedValue(undefined);
      mockCartService.getByUser.mockResolvedValue(updatedCart);

      const { updateCartItem } = useCartStore.getState();
      await updateCartItem('cart1', 'item1', updates);

      expect(mockCartService.updateItem).toHaveBeenCalledWith('cart1', 'item1', {
        unitPrice: 30.99,
      });
      expect(mockCartService.calculateItemTotal).not.toHaveBeenCalled();
    });

    it('should handle string unit price in updates', async () => {
      const updates = { unitPrice: '30.99' as any };

      mockCartService.updateItem.mockResolvedValue(undefined);
      mockCartService.getByUser.mockResolvedValue(mockCart);

      const { updateCartItem } = useCartStore.getState();
      await updateCartItem('cart1', 'item1', updates);

      expect(mockCartService.updateItem).toHaveBeenCalledWith('cart1', 'item1', {
        unitPrice: 30.99,
      });
    });

    it('should reload by cart ID when no user ID', async () => {
      const cartWithoutUser = { ...mockCart, userId: null };
      useCartStore.setState({ cart: cartWithoutUser });

      mockCartService.updateItem.mockResolvedValue(undefined);
      mockCartService.getById.mockResolvedValue(cartWithoutUser);

      const { updateCartItem } = useCartStore.getState();
      await updateCartItem('cart1', 'item1', { quantity: 3 });

      expect(mockCartService.getById).toHaveBeenCalledWith('cart1');
      expect(mockCartService.getByUser).not.toHaveBeenCalled();
    });

    it('should handle update item error', async () => {
      const errorMessage = 'Failed to update item';
      mockCartService.updateItem.mockRejectedValue(new Error(errorMessage));

      const { updateCartItem } = useCartStore.getState();
      await updateCartItem('cart1', 'item1', { quantity: 3 });

      const state = useCartStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('Remove Cart Item', () => {
    beforeEach(() => {
      useCartStore.setState({ cart: mockCart });
    });

    it('should remove cart item successfully', async () => {
      const updatedCart = { ...mockCart, cartItems: [] };

      mockCartService.removeItem.mockResolvedValue(undefined);
      mockCartService.getByUser.mockResolvedValue(updatedCart);

      const { removeCartItem } = useCartStore.getState();
      await removeCartItem('cart1', 'item1');

      const state = useCartStore.getState();
      expect(state.cart).toEqual(updatedCart);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();

      expect(mockCartService.removeItem).toHaveBeenCalledWith('cart1', 'item1');
      expect(mockCartService.getByUser).toHaveBeenCalledWith('user1');
    });

    it('should reload by cart ID when no user ID', async () => {
      const cartWithoutUser = { ...mockCart, userId: null };
      useCartStore.setState({ cart: cartWithoutUser });

      mockCartService.removeItem.mockResolvedValue(undefined);
      mockCartService.getById.mockResolvedValue(cartWithoutUser);

      const { removeCartItem } = useCartStore.getState();
      await removeCartItem('cart1', 'item1');

      expect(mockCartService.getById).toHaveBeenCalledWith('cart1');
      expect(mockCartService.getByUser).not.toHaveBeenCalled();
    });

    it('should handle remove item error', async () => {
      const errorMessage = 'Failed to remove item';
      mockCartService.removeItem.mockRejectedValue(new Error(errorMessage));

      const { removeCartItem } = useCartStore.getState();
      await removeCartItem('cart1', 'item1');

      const state = useCartStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('Clear Cart', () => {
    it('should clear cart and error', () => {
      useCartStore.setState({
        cart: mockCart,
        error: 'Some error',
      });

      const { clearCart } = useCartStore.getState();
      clearCart();

      const state = useCartStore.getState();
      expect(state.cart).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('Computed Values', () => {
    it('should get cart summary when cart exists', () => {
      useCartStore.setState({ cart: mockCart });

      const { getCartSummary } = useCartStore.getState();
      const summary = getCartSummary();

      expect(summary).toEqual(mockCartSummary);
      expect(mockCartService.getCartSummary).toHaveBeenCalledWith(mockCart);
    });

    it('should get default cart summary when no cart', () => {
      useCartStore.setState({ cart: null });

      const { getCartSummary } = useCartStore.getState();
      const summary = getCartSummary();

      expect(summary).toEqual({
        totalItems: 0,
        totalPrice: 0,
        candleCount: 0,
        giftCount: 0,
      });
      expect(mockCartService.getCartSummary).not.toHaveBeenCalled();
    });

    it('should get item count when cart exists', () => {
      useCartStore.setState({ cart: mockCart });

      const { getItemCount } = useCartStore.getState();
      const count = getItemCount();

      expect(count).toBe(2); // mockCartItem has quantity 2
    });

    it('should get zero item count when no cart', () => {
      useCartStore.setState({ cart: null });

      const { getItemCount } = useCartStore.getState();
      const count = getItemCount();

      expect(count).toBe(0);
    });

    it('should get total price when cart exists', () => {
      useCartStore.setState({ cart: mockCart });

      const { getTotalPrice } = useCartStore.getState();
      const total = getTotalPrice();

      expect(total).toBe(51.98); // mockCartItem has totalPrice 51.98
    });

    it('should get zero total price when no cart', () => {
      useCartStore.setState({ cart: null });

      const { getTotalPrice } = useCartStore.getState();
      const total = getTotalPrice();

      expect(total).toBe(0);
    });

    it('should handle multiple items in cart', () => {
      const cartWithMultipleItems = {
        ...mockCart,
        cartItems: [
          { ...mockCartItem, id: 'item1', quantity: 2, totalPrice: 51.98 },
          { ...mockCartItem, id: 'item2', quantity: 1, totalPrice: 25.99 },
        ],
      };
      
      useCartStore.setState({ cart: cartWithMultipleItems });

      const { getItemCount, getTotalPrice } = useCartStore.getState();
      
      expect(getItemCount()).toBe(3); // 2 + 1
      expect(getTotalPrice()).toBe(77.97); // 51.98 + 25.99
    });
  });

  describe('Persistence', () => {
    it('should persist cart state', () => {
      // The store is configured with persist middleware
      // This test verifies the configuration exists
      const storeConfig = useCartStore.persist;
      expect(storeConfig).toBeDefined();
    });
  });  describe('Error Handling', () => {
    it('should handle loadCart errors', async () => {
      useCartStore.setState({ cart: null, loading: false, error: null });
      mockCartService.getById.mockRejectedValue(new Error('loadCart failed'));

      const { loadCart } = useCartStore.getState();
      await loadCart('cart1');

      const state = useCartStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toContain('failed');
    });

    it('should handle loadUserCart errors', async () => {
      useCartStore.setState({ cart: null, loading: false, error: null });
      mockCartService.getByUser.mockRejectedValue(new Error('loadUserCart failed'));

      const { loadUserCart } = useCartStore.getState();
      await loadUserCart('user1');

      const state = useCartStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toContain('failed');
    });

    it('should handle createCart errors', async () => {
      useCartStore.setState({ cart: null, loading: false, error: null });
      mockCartService.create.mockRejectedValue(new Error('createCart failed'));

      const { createCart } = useCartStore.getState();
      await createCart('user1');

      const state = useCartStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toContain('failed');
    });it('should handle addItemToCart errors', async () => {
      useCartStore.setState({ cart: mockCart, loading: false, error: null });
      mockCartService.addItem.mockRejectedValue(new Error('addItemToCart failed'));

      const { addItemToCart } = useCartStore.getState();
      await addItemToCart('cart1', { candleId: 'candle1', quantity: 1, unitPrice: 25.99 });

      const state = useCartStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toContain('failed');
    });

    it('should handle updateCartItem errors', async () => {
      useCartStore.setState({ cart: mockCart, loading: false, error: null });
      mockCartService.updateItem.mockRejectedValue(new Error('updateCartItem failed'));

      const { updateCartItem } = useCartStore.getState();
      await updateCartItem('cart1', 'item1', { quantity: 2 });

      const state = useCartStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toContain('failed');
    });

    it('should handle removeCartItem errors', async () => {
      useCartStore.setState({ cart: mockCart, loading: false, error: null });
      mockCartService.removeItem.mockRejectedValue(new Error('removeCartItem failed'));

      const { removeCartItem } = useCartStore.getState();
      await removeCartItem('cart1', 'item1');

      const state = useCartStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toContain('failed');
    });
  });
});
