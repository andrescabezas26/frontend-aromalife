import { useAuthStore, AuthUser } from '@/stores/auth-store';
import { AuthService } from '@/services/auth/auth.service';
import { CartService } from '@/services/cart/cart.service';
import { AuthResponse } from '@/types/auth';

// Mock services
jest.mock('@/services/auth/auth.service', () => ({
  AuthService: {
    login: jest.fn(),
  },
}));

jest.mock('@/services/cart/cart.service', () => ({
  CartService: {
    getByUser: jest.fn(),
    create: jest.fn(),
  },
}));

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockCartService = CartService as jest.Mocked<typeof CartService>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock sessionStorage
const mockSessionStorage = {
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

describe('AuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    mockSessionStorage.clear.mockClear();
    
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Mock console methods
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Token Decoding', () => {
    it('should decode a valid JWT token correctly', () => {
      // Create a mock JWT token payload
      const payload = {
        sub: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['USER', 'ADMIN'],
        profilePicture: 'profile.jpg',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      // Create a mock JWT token (header.payload.signature)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const encodedPayload = btoa(JSON.stringify(payload));
      const signature = 'mock-signature';
      const token = `${header}.${encodedPayload}.${signature}`;

      const { setUserFromToken } = useAuthStore.getState();
      setUserFromToken(token);

      const state = useAuthStore.getState();
      expect(state.user).toEqual({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['user', 'admin'], // Should be lowercase
        profilePicture: 'profile.jpg',
      });
      expect(state.token).toBe(token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should handle invalid JWT token gracefully', () => {
      const invalidToken = 'invalid.token.here';
      
      const { setUserFromToken } = useAuthStore.getState();
      setUserFromToken(invalidToken);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Login', () => {
    const mockAuthResponse: AuthResponse = {
      token: 'mock.jwt.token',
      user_id: 'user123',
      roles: ['USER'],
      profilePicture: 'profile.jpg',
    };

    beforeEach(() => {
      // Mock successful token decode
      const payload = {
        sub: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['USER'],
      };
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const encodedPayload = btoa(JSON.stringify(payload));
      mockAuthResponse.token = `${header}.${encodedPayload}.signature`;
    });

    it('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials';
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      const { login } = useAuthStore.getState();
      
      await expect(login('john@example.com', 'wrongpassword')).rejects.toThrow(errorMessage);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });

    it('should initialize cart for new user when cart does not exist', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockCartService.getByUser.mockResolvedValue(null); // No existing cart
      mockCartService.create.mockResolvedValue({
        id: 'new-cart',
        userId: { id: 'user123' },
        cartItems: [],
        checkedOut: false,
      } as any);

      const { login } = useAuthStore.getState();
      await login('john@example.com', 'password123');

      expect(mockCartService.create).toHaveBeenCalledWith({
        userId: 'user123',
        checkedOut: false,
      });
    });

    it('should handle cart initialization error gracefully', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      mockCartService.getByUser.mockRejectedValue(new Error('Cart service error'));

      const { login } = useAuthStore.getState();
      await login('john@example.com', 'password123');

      // Login should still succeed even if cart initialization fails
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(console.error).toHaveBeenCalledWith('❌ Error inicializando carrito:', expect.any(Error));
    });
  });

  describe('Initialize Auth', () => {

    it('should handle missing token during initialization', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { initializeAuth } = useAuthStore.getState();
      initializeAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('Update Profile Picture', () => {
    it('should update user profile picture', () => {
      const user: AuthUser = {
        id: 'user123',
        name: 'John',
        email: 'john@example.com',
        roles: ['user'],
      };

      useAuthStore.setState({ user });

      const { updateProfilePicture } = useAuthStore.getState();
      updateProfilePicture('new-profile.jpg');

      const state = useAuthStore.getState();
      expect(state.user?.profilePicture).toBe('new-profile.jpg');
    });

    it('should not update if no user is present', () => {
      useAuthStore.setState({ user: null });

      const { updateProfilePicture } = useAuthStore.getState();
      updateProfilePicture('new-profile.jpg');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe('Initialize User Cart', () => {
    it('should create cart when user has no existing cart', async () => {
      mockCartService.getByUser.mockResolvedValue(null);
      mockCartService.create.mockResolvedValue({
        id: 'new-cart',
        userId: { id: 'user123' },
        cartItems: [],
        checkedOut: false,
      } as any);

      const { initializeUserCart } = useAuthStore.getState();
      await initializeUserCart('user123');

      expect(mockCartService.getByUser).toHaveBeenCalledWith('user123');
      expect(mockCartService.create).toHaveBeenCalledWith({
        userId: 'user123',
        checkedOut: false,
      });
    });

    it('should not create cart when user already has one', async () => {
      mockCartService.getByUser.mockResolvedValue({
        id: 'existing-cart',
        userId: { id: 'user123' },
        cartItems: [],
        checkedOut: false,
      } as any);

      const { initializeUserCart } = useAuthStore.getState();
      await initializeUserCart('user123');

      expect(mockCartService.getByUser).toHaveBeenCalledWith('user123');
      expect(mockCartService.create).not.toHaveBeenCalled();
    });

    it('should handle cart initialization errors', async () => {
      const error = new Error('Network error');
      mockCartService.getByUser.mockRejectedValue(error);

      const { initializeUserCart } = useAuthStore.getState();
      await initializeUserCart('user123');

      expect(console.error).toHaveBeenCalledWith('❌ Error inicializando carrito:', error);
    });

    it('should handle axios errors with detailed logging', async () => {
      const axiosError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'User not found' },
        },
        config: {
          method: 'GET',
          url: '/api/cart/user/123',
          data: null,
        },
      };

      mockCartService.getByUser.mockRejectedValue(axiosError);

      const { initializeUserCart } = useAuthStore.getState();
      await initializeUserCart('user123');

      expect(console.error).toHaveBeenCalledWith('❌ Error inicializando carrito:', axiosError);
      expect(console.error).toHaveBeenCalledWith('❌ Axios error details:', expect.any(Object));
    });
  });

  describe('Server-side rendering compatibility', () => {
    it('should handle window being undefined', () => {
      // Mock window being undefined (SSR scenario)
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const { initializeAuth } = useAuthStore.getState();
      expect(() => initializeAuth()).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });
});
