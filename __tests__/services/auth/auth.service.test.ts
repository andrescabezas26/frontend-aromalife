import { AxiosError } from "axios";
import {
  LoginRequest,
  RegisterRequest,
  RegisterClientRequest,
  AuthResponse,
} from "@/types/auth";

// Create mock axios instance
const mockAxiosInstance = {
  post: jest.fn(),
};

// Mock the axios request creator
jest.mock("@/lib/axios", () => ({
  createRequestWithEntity: jest.fn(() => mockAxiosInstance),
  translateError: jest.fn(),
}));

describe("AuthService", () => {
  let AuthService: typeof import("@/services/auth/auth.service").AuthService;
  let translateError: typeof import("@/services/auth/auth.service").translateError;

  beforeAll(async () => {
    // Import after mocking
    const authModule = await import("@/services/auth/auth.service");
    AuthService = authModule.AuthService;
    translateError = authModule.translateError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    
    // Reset mock implementation
    mockAxiosInstance.post.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login', () => {
    const mockLoginData: LoginRequest = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockAuthResponse: AuthResponse = {
      user_id: '123',
      name: 'John Doe',
      email: 'test@example.com',
      token: 'mock-token',
      roles: ['cliente'],
      profilePicture: 'profile.jpg',
    };

    it('should login successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await AuthService.login(mockLoginData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', mockLoginData);
      expect(result).toEqual(mockAuthResponse);
      expect(console.log).toHaveBeenCalledWith('Login response:', mockAuthResponse);
    });

    it('should handle translated error from interceptor', async () => {
      const translatedError = {
        name: 'TranslatedAxiosError',
        message: 'Credenciales incorrectas',
      };
      mockAxiosInstance.post.mockRejectedValue(translatedError);

      await expect(AuthService.login(mockLoginData)).rejects.toEqual(translatedError);
      expect(console.log).toHaveBeenCalledWith('Translated error from interceptor:', 'Credenciales incorrectas');
    });

    it('should handle AxiosError with 401 status', async () => {
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: { message: 'Invalid credentials' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.login(mockLoginData)).rejects.toThrow('Credenciales incorrectas. Verifica tu email y contraseña');
      expect(console.error).toHaveBeenCalledWith('Login error:', axiosError);
    });

    it('should handle AxiosError with 400 status and password message', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'Password is too weak' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.login(mockLoginData)).rejects.toThrow('La contraseña no cumple con los requisitos');
    });

    it('should handle error with specific message', async () => {
      const customError = new Error('Custom connection error');
      mockAxiosInstance.post.mockRejectedValue(customError);

      await expect(AuthService.login(mockLoginData)).rejects.toThrow('Custom connection error');
    });

    it('should handle unexpected connection error', async () => {
      mockAxiosInstance.post.mockRejectedValue(null);

      await expect(AuthService.login(mockLoginData)).rejects.toThrow('Error de conexión inesperado');
    });

    it('should handle network error', async () => {
      const networkError = new AxiosError('Network Error');
      networkError.code = 'NETWORK_ERROR';
      mockAxiosInstance.post.mockRejectedValue(networkError);

      await expect(AuthService.login(mockLoginData)).rejects.toThrow();
    });
  });

  describe('registerClient', () => {
    const mockRegisterClientData: RegisterClientRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      roles: ['cliente'],
    };

    const mockAuthResponse: AuthResponse = {
      user_id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      token: 'mock-token',
      roles: ['cliente'],
    };

    it('should register client successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await AuthService.registerClient(mockRegisterClientData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', mockRegisterClientData);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle translated error from interceptor', async () => {
      const translatedError = {
        name: 'TranslatedAxiosError',
        message: 'El email ya está registrado',
      };
      mockAxiosInstance.post.mockRejectedValue(translatedError);

      await expect(AuthService.registerClient(mockRegisterClientData)).rejects.toEqual(translatedError);
    });

    it('should handle AxiosError with validation message', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'lastname is required' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.registerClient(mockRegisterClientData)).rejects.toThrow('El apellido no es válido');
    });

    it('should handle phone validation error', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'phone number is invalid' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.registerClient(mockRegisterClientData)).rejects.toThrow('El número de teléfono no es válido');
    });

    it('should handle unexpected connection error', async () => {
      mockAxiosInstance.post.mockRejectedValue({});

      await expect(AuthService.registerClient(mockRegisterClientData)).rejects.toThrow('Error de conexión inesperado');
    });
  });

  describe('register', () => {
    const mockRegisterData: RegisterRequest = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
    };

    const mockAuthResponse: AuthResponse = {
      user_id: '456',
      name: 'Jane Doe',
      email: 'jane@example.com',
      token: 'mock-token-456',
    };

    it('should register successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await AuthService.register(mockRegisterData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register-client', mockRegisterData);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle translated error from interceptor', async () => {
      const translatedError = {
        name: 'TranslatedAxiosError',
        message: 'Email ya existe',
      };
      mockAxiosInstance.post.mockRejectedValue(translatedError);

      await expect(AuthService.register(mockRegisterData)).rejects.toEqual(translatedError);
    });

    it('should handle AxiosError and log appropriate messages', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'city is required' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.register(mockRegisterData)).rejects.toThrow('La ciudad no es válida');
      expect(console.log).toHaveBeenCalledWith('entre axios');
    });

    it('should handle non-axios error and log appropriate message', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Random error'));

      await expect(AuthService.register(mockRegisterData)).rejects.toThrow('Error de conexión inesperado');
      expect(console.log).toHaveBeenCalledWith('entre aqui');
    });

    it('should handle country validation error', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'Country code is invalid' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.register(mockRegisterData)).rejects.toThrow('El país no es válido');
    });

    it('should handle address validation error', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'Address is required' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.register(mockRegisterData)).rejects.toThrow('La dirección no es válida');
    });
  });

  describe('registerWithFile', () => {
    const mockRegisterData: RegisterRequest = {
      name: 'Alice Smith',
      email: 'alice@example.com',
      password: 'password123',
    };

    const mockFile = new File(['fake content'], 'profile.jpg', { type: 'image/jpeg' });

    const mockAuthResponse: AuthResponse = {
      user_id: '789',
      name: 'Alice Smith',
      email: 'alice@example.com',
      token: 'mock-token-789',
      profilePicture: 'uploaded-profile.jpg',
    };

    it('should register with file successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await AuthService.registerWithFile(mockRegisterData, mockFile);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/register-client-with-file',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockAuthResponse);

      // Verify FormData content
      const formDataCall = mockAxiosInstance.post.mock.calls[0][1] as FormData;
      expect(formDataCall.get('name')).toBe('Alice Smith');
      expect(formDataCall.get('email')).toBe('alice@example.com');
      expect(formDataCall.get('password')).toBe('password123');
      expect(formDataCall.get('profilePicture')).toBe(mockFile);
    });

    it('should register without file successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await AuthService.registerWithFile(mockRegisterData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/register-client-with-file',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockAuthResponse);

      // Verify FormData content without file
      const formDataCall = mockAxiosInstance.post.mock.calls[0][1] as FormData;
      expect(formDataCall.get('name')).toBe('Alice Smith');
      expect(formDataCall.get('profilePicture')).toBeNull();
    });

    it('should handle data with undefined/null/empty values', async () => {
      const dataWithEmptyValues = {
        ...mockRegisterData,
        middleName: '',
        phoneNumber: null,
        address: undefined,
      } as any;
      
      mockAxiosInstance.post.mockResolvedValue({ data: mockAuthResponse });

      await AuthService.registerWithFile(dataWithEmptyValues, mockFile);

      const formDataCall = mockAxiosInstance.post.mock.calls[0][1] as FormData;
      expect(formDataCall.get('name')).toBe('Alice Smith');
      expect(formDataCall.get('middleName')).toBeNull(); // Empty string not added
      expect(formDataCall.get('phoneNumber')).toBeNull(); // Null not added
      expect(formDataCall.get('address')).toBeNull(); // Undefined not added
      expect(formDataCall.get('profilePicture')).toBe(mockFile);
    });

    it('should handle AxiosError', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'phonecountrycode is invalid' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.registerWithFile(mockRegisterData, mockFile))
        .rejects.toThrow('El número de teléfono no es válido');
    });

    it('should handle unexpected connection error', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      await expect(AuthService.registerWithFile(mockRegisterData, mockFile))
        .rejects.toThrow('Error de conexión inesperado');
    });

    it('should handle file size validation error', async () => {
      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'File too large' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.registerWithFile(mockRegisterData, mockFile))
        .rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({});

      await AuthService.logout();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should handle translated error from interceptor', async () => {
      const translatedError = {
        name: 'TranslatedAxiosError',
        message: 'Token inválido',
      };
      mockAxiosInstance.post.mockRejectedValue(translatedError);

      await expect(AuthService.logout()).rejects.toEqual(translatedError);
    });

    it('should handle AxiosError during logout', async () => {
      const axiosError = new AxiosError('Unauthorized');
      axiosError.response = {
        status: 401,
        data: { message: 'Token expired' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.logout()).rejects.toThrow('Email o contraseña incorrectos');
    });

    it('should handle unexpected error during logout', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Network error'));

      await expect(AuthService.logout()).rejects.toThrow('Error al cerrar sesión');
    });

    it('should handle server unavailable error', async () => {
      const axiosError = new AxiosError('Service Unavailable');
      axiosError.response = {
        status: 503,
        data: { message: 'Service temporarily unavailable' },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.logout()).rejects.toThrow('Servicio no disponible temporalmente');
    });
  });

  describe('translateError function', () => {
    it('should translate 401 error with credentials message', () => {
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        data: { message: 'Invalid credentials provided' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('Credenciales incorrectas. Verifica tu email y contraseña');
      expect(console.log).toHaveBeenCalledWith('Error status:', 401);
    });

    it('should translate 401 error without credentials message', () => {
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        data: { message: 'Access denied' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('Email o contraseña incorrectos');
    });

    it('should translate 400 error with password message', () => {
      const error = new AxiosError('Bad Request');
      error.response = {
        status: 400,
        data: { message: 'Password must be at least 8 characters' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('La contraseña no cumple con los requisitos');
    });

    it('should translate 400 error with lastname message', () => {
      const error = new AxiosError('Bad Request');
      error.response = {
        status: 400,
        data: { error: 'Lastname field is required' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('El apellido no es válido');
    });

    it('should translate 429 error (too many requests)', () => {
      const error = new AxiosError('Too Many Requests');
      error.response = {
        status: 429,
        data: { message: 'Rate limit exceeded' },
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('Demasiados intentos. Intenta de nuevo en unos minutos');
    });

    it('should translate 502 error (bad gateway)', () => {
      const error = new AxiosError('Bad Gateway');
      error.response = {
        status: 502,
        data: { message: 'Bad gateway' },
        statusText: 'Bad Gateway',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('Problema de conectividad del servidor. Intenta más tarde');
    });

    it('should translate 503 error (service unavailable)', () => {
      const error = new AxiosError('Service Unavailable');
      error.response = {
        status: 503,
        data: { message: 'Service unavailable' },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('Servicio no disponible temporalmente');
    });

    it('should translate 504 error (gateway timeout)', () => {
      const error = new AxiosError('Gateway Timeout');
      error.response = {
        status: 504,
        data: { message: 'Gateway timeout' },
        statusText: 'Gateway Timeout',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('El servidor tardó demasiado en responder. Intenta de nuevo');
    });

    it('should handle phone country code validation', () => {
      const error = new AxiosError('Bad Request');
      error.response = {
        status: 400,
        data: { message: 'PhoneCountryCode is not valid' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('El número de teléfono no es válido');
    });

    it('should log server message when available', () => {
      const error = new AxiosError('Unauthorized');
      error.response = {
        status: 401,
        data: { message: 'Custom server message' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any,
      };

      translateError(error);
      expect(console.log).toHaveBeenCalledWith('Custom server message');
    });

    it('should prefer message over error in server response', () => {
      const error = new AxiosError('Bad Request');
      error.response = {
        status: 400,
        data: { 
          message: 'Password validation failed',
          error: 'Different error message'
        },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('La contraseña no cumple con los requisitos');
    });

    it('should use error field when message is not available', () => {
      const error = new AxiosError('Bad Request');
      error.response = {
        status: 400,
        data: { 
          error: 'Phone number format is invalid'
        },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };

      const result = translateError(error);
      expect(result).toBe('El número de teléfono no es válido');
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle empty email in login', async () => {
      const invalidLoginData: LoginRequest = {
        email: '',
        password: 'password123',
      };

      const axiosError = new AxiosError('Bad Request');
      axiosError.response = {
        status: 400,
        data: { message: 'Email is required' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.login(invalidLoginData)).rejects.toThrow();
    });

    it('should handle special characters in registration data', async () => {
      const specialCharData: RegisterRequest = {
        name: 'José María Ñoño',
        email: 'jose.maria@example.com',
        password: 'contraseña123!@#',
      };

      const mockResponse: AuthResponse = {
        user_id: '999',
        name: 'José María Ñoño',
        email: 'jose.maria@example.com',
        token: 'special-token',
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await AuthService.register(specialCharData);
      expect(result.name).toBe('José María Ñoño');
    });

    it('should handle large file upload attempt', async () => {
      const largeFileBuffer = new ArrayBuffer(10 * 1024 * 1024); // 10MB
      const largeFile = new File([largeFileBuffer], 'large-image.jpg', { type: 'image/jpeg' });

      const axiosError = new AxiosError('Payload Too Large');
      axiosError.response = {
        status: 413,
        data: { message: 'File too large' },
        statusText: 'Payload Too Large',
        headers: {},
        config: {} as any,
      };
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      await expect(AuthService.registerWithFile({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }, largeFile)).rejects.toThrow();
    });

    it('should handle malformed response data', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: null });

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBeNull();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new AxiosError('Timeout');
      timeoutError.code = 'ECONNABORTED';
      mockAxiosInstance.post.mockRejectedValue(timeoutError);

      await expect(AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      })).rejects.toThrow();
    });
  });
});
