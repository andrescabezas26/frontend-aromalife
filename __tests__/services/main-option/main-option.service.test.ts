import { AxiosError } from 'axios';
import { createRequestWithEntity } from '@/lib/axios';
import { MainOption } from '@/types/main-option';

// Mock del módulo axios
jest.mock('@/lib/axios', () => ({
  createRequestWithEntity: jest.fn(),
}));

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

(createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);

// IMPORTAR DESPUÉS de haber mockeado
let MainOptionService: typeof import('@/services/main-option/main-option.service').MainOptionService;

beforeAll(() => {
  (require('@/lib/axios').createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);
  MainOptionService = require('@/services/main-option/main-option.service').MainOptionService;
});

describe('MainOptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });

  // Mock data
  const mockMainOption: MainOption = {
    id: 'main-option-1',
    name: 'Relaxation',
    description: 'Options for relaxation and stress relief',
    emoji: '🧘‍♀️',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockMainOptionWithoutOptionals: MainOption = {
    id: 'main-option-2',
    name: 'Energy',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockMainOptionMinimal: MainOption = {
    name: 'Focus'
  };

  describe('getCount', () => {
    it('should fetch main options count successfully', async () => {
      const mockCount = 12;
      mockAxiosInstance.get.mockResolvedValue({ data: { count: mockCount } });

      const result = await MainOptionService.getCount();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/main-options/count/number');
      expect(result).toBe(mockCount);
    });

    it('should handle server error when fetching count', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(MainOptionService.getCount()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener el conteo de opciones principales:',
        axiosError
      );
    });

    it('should handle network error when fetching count', async () => {
      const networkError = new AxiosError('Request failed');
      networkError.code = 'ENOTFOUND';
      
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(MainOptionService.getCount()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener el conteo de opciones principales:',
        networkError
      );
    });

    it('should handle unexpected response format', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { total: 5 } }); // Wrong property name

      const result = await MainOptionService.getCount();
      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should fetch all main options successfully', async () => {
      const mockMainOptions = [mockMainOption, mockMainOptionWithoutOptionals];
      mockAxiosInstance.get.mockResolvedValue({ data: mockMainOptions });

      const result = await MainOptionService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/main-options');
      expect(result).toEqual(mockMainOptions);
      expect(result).toHaveLength(2);
    });

    it('should handle empty response', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await MainOptionService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/main-options');
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle API error when fetching all main options', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 503,
        data: { message: 'Service unavailable' },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(MainOptionService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener las opciones principales:',
        axiosError
      );
    });

    it('should handle timeout error', async () => {
      const timeoutError = new AxiosError('Request failed');
      timeoutError.code = 'ECONNABORTED';
      
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(MainOptionService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener las opciones principales:',
        timeoutError
      );
    });
  });

  describe('getById', () => {
    it('should fetch main option by ID successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockMainOption });

      const result = await MainOptionService.getById('main-option-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/main-options/main-option-1');
      expect(result).toEqual(mockMainOption);
      expect(result.id).toBe('main-option-1');
    });

    it('should handle main option not found error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Main option not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(MainOptionService.getById('nonexistent')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener la opción principal con id nonexistent:',
        axiosError
      );
    });

    it('should handle unauthorized access error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 401,
        data: { message: 'Unauthorized' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(MainOptionService.getById('main-option-1')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener la opción principal con id main-option-1:',
        axiosError
      );
    });

    it('should handle malformed ID parameter', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid ID format' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(MainOptionService.getById('')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener la opción principal con id :',
        axiosError
      );
    });
  });

  describe('create', () => {
    it('should create main option successfully with all fields', async () => {
      const createRequest: Omit<MainOption, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'New Option',
        description: 'A brand new main option',
        emoji: '✨'
      };

      const createdOption = { 
        ...createRequest, 
        id: 'new-option-id',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdOption });

      const result = await MainOptionService.create(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/main-options', createRequest);
      expect(result).toEqual(createdOption);
      expect(result.id).toBe('new-option-id');
    });

    it('should create main option successfully with minimal fields', async () => {
      const createRequest: Omit<MainOption, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Minimal Option'
      };

      const createdOption = { 
        ...createRequest, 
        id: 'minimal-option-id',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdOption });

      const result = await MainOptionService.create(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/main-options', createRequest);
      expect(result).toEqual(createdOption);
      expect(result.description).toBeUndefined();
      expect(result.emoji).toBeUndefined();
    });

    it('should handle validation error for invalid name', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Name is required and must be at least 3 characters' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const invalidRequest: Omit<MainOption, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Ab' // Too short
      };

      await expect(MainOptionService.create(invalidRequest)).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al crear la opción principal:',
        axiosError
      );
    });

    it('should handle conflict error for duplicate name', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 409,
        data: { message: 'Main option with this name already exists' },
        statusText: 'Conflict',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const duplicateRequest: Omit<MainOption, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Existing Option Name'
      };

      await expect(MainOptionService.create(duplicateRequest)).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al crear la opción principal:',
        axiosError
      );
    });

    it('should handle server error during creation', async () => {
      const serverError = new AxiosError('Request failed');
      serverError.response = {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.post.mockRejectedValue(serverError);

      const createRequest: Omit<MainOption, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Valid Option'
      };

      await expect(MainOptionService.create(createRequest)).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al crear la opción principal:',
        serverError
      );
    });
  });

  describe('update', () => {
    it('should update main option successfully with all fields', async () => {
      const updateRequest: Partial<MainOption> = {
        name: 'Updated Option Name',
        description: 'Updated description',
        emoji: '🔄'
      };

      const updatedOption = { ...mockMainOption, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedOption });

      const result = await MainOptionService.update('main-option-1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/main-options/main-option-1', updateRequest);
      expect(result).toEqual(updatedOption);
      expect(result.name).toBe('Updated Option Name');
    });

    it('should update main option with partial data', async () => {
      const updateRequest: Partial<MainOption> = {
        description: 'Only updating description'
      };

      const updatedOption = { ...mockMainOption, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedOption });

      const result = await MainOptionService.update('main-option-1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/main-options/main-option-1', updateRequest);
      expect(result.description).toBe('Only updating description');
      expect(result.name).toBe(mockMainOption.name); // Should remain unchanged
    });

    it('should update only emoji', async () => {
      const updateRequest: Partial<MainOption> = {
        emoji: '🎯'
      };

      const updatedOption = { ...mockMainOption, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedOption });

      const result = await MainOptionService.update('main-option-1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/main-options/main-option-1', updateRequest);
      expect(result.emoji).toBe('🎯');
    });

    it('should handle main option not found error during update', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Main option not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.put.mockRejectedValue(axiosError);

      const updateRequest: Partial<MainOption> = { name: 'New Name' };

      await expect(MainOptionService.update('nonexistent', updateRequest)).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al actualizar la opción principal con id nonexistent:',
        axiosError
      );
    });

    it('should handle forbidden update error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 403,
        data: { message: 'Forbidden' },
        statusText: 'Forbidden',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.put.mockRejectedValue(axiosError);

      const updateRequest: Partial<MainOption> = { name: 'New Name' };

      await expect(MainOptionService.update('main-option-1', updateRequest)).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al actualizar la opción principal con id main-option-1:',
        axiosError
      );
    });

    it('should handle validation error during update', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Name cannot be empty' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.put.mockRejectedValue(axiosError);

      const updateRequest: Partial<MainOption> = { name: '' };

      await expect(MainOptionService.update('main-option-1', updateRequest)).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al actualizar la opción principal con id main-option-1:',
        axiosError
      );
    });
  });

  describe('delete', () => {
    it('should delete main option successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await MainOptionService.delete('main-option-1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/main-options/main-option-1');
    });

    it('should handle main option not found error during delete', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Main option not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(MainOptionService.delete('nonexistent')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al eliminar la opción principal con id nonexistent:',
        axiosError
      );
    });

    it('should handle conflict error when deleting main option in use', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 409,
        data: { message: 'Cannot delete main option that is being used by intended impacts' },
        statusText: 'Conflict',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(MainOptionService.delete('main-option-1')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al eliminar la opción principal con id main-option-1:',
        axiosError
      );
    });

    it('should handle unauthorized delete error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 401,
        data: { message: 'Unauthorized' },
        statusText: 'Unauthorized',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(MainOptionService.delete('main-option-1')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al eliminar la opción principal con id main-option-1:',
        axiosError
      );
    });

    it('should handle forbidden delete error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 403,
        data: { message: 'Forbidden - Admin access required' },
        statusText: 'Forbidden',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(MainOptionService.delete('main-option-1')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al eliminar la opción principal con id main-option-1:',
        axiosError
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout error', async () => {
      const timeoutError = new AxiosError('Request failed');
      timeoutError.code = 'ECONNABORTED';
      
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(MainOptionService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener las opciones principales:',
        timeoutError
      );
    });

    it('should handle connection error', async () => {
      const connectionError = new AxiosError('Request failed');
      connectionError.code = 'ENOTFOUND';
      
      mockAxiosInstance.get.mockRejectedValue(connectionError);

      await expect(MainOptionService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener las opciones principales:',
        connectionError
      );
    });

    it('should handle gateway timeout error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 504,
        data: { message: 'Gateway timeout' },
        statusText: 'Gateway Timeout',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(MainOptionService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener las opciones principales:',
        axiosError
      );
    });

    it('should handle bad gateway error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 502,
        data: { message: 'Bad gateway' },
        statusText: 'Bad Gateway',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(MainOptionService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener las opciones principales:',
        axiosError
      );
    });

    it('should handle unexpected response format', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: null });

      const result = await MainOptionService.getAll();
      expect(result).toBeNull();
    });

    it('should handle malformed response data', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: 'invalid-json' });

      const result = await MainOptionService.getAll();
      expect(result).toBe('invalid-json');
    });
  });

  describe('Service Configuration', () => {

    it('should pass through errors from interceptor', async () => {
      const customError = new Error('Custom interceptor error');
      mockAxiosInstance.get.mockRejectedValue(customError);

      await expect(MainOptionService.getAll()).rejects.toThrow('Custom interceptor error');
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener las opciones principales:',
        customError
      );
    });
  });

  describe('Data Processing', () => {
    it('should handle main option with all optional fields', async () => {
      const fullOption: MainOption = {
        id: 'option-full',
        name: 'Full Option',
        description: 'Complete main option with all fields',
        emoji: '🌟',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      mockAxiosInstance.get.mockResolvedValue({ data: fullOption });

      const result = await MainOptionService.getById('option-full');

      expect(result).toEqual(fullOption);
      expect(result.description).toBeDefined();
      expect(result.emoji).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should handle main option with minimal fields', async () => {
      const minimalOption: MainOption = {
        id: 'option-minimal',
        name: 'Minimal Option'
      };

      mockAxiosInstance.get.mockResolvedValue({ data: minimalOption });

      const result = await MainOptionService.getById('option-minimal');

      expect(result).toEqual(minimalOption);
      expect(result.description).toBeUndefined();
      expect(result.emoji).toBeUndefined();
      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });

    it('should handle main option without ID (for creation)', () => {
      const optionWithoutId: MainOption = {
        name: 'New Option',
        description: 'Option without ID',
        emoji: '✨'
      };

      expect(optionWithoutId.id).toBeUndefined();
      expect(optionWithoutId.name).toBe('New Option');
    });

    it('should handle empty strings and undefined values properly', async () => {
      const optionWithEmptyValues: MainOption = {
        id: 'option-empty',
        name: 'Option with Empty Values',
        description: '', // Empty string
        emoji: undefined
      };

      mockAxiosInstance.get.mockResolvedValue({ data: optionWithEmptyValues });

      const result = await MainOptionService.getById('option-empty');

      expect(result.description).toBe('');
      expect(result.emoji).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in names', async () => {
      const specialCharOption: MainOption = {
        id: 'option-special',
        name: 'Opción Especial & Única #1',
        description: 'Descripción con caracteres especiales: áéíóú ñ',
        emoji: '🌟💫✨'
      };

      mockAxiosInstance.get.mockResolvedValue({ data: specialCharOption });

      const result = await MainOptionService.getById('option-special');

      expect(result.name).toBe('Opción Especial & Única #1');
      expect(result.description).toContain('áéíóú ñ');
      expect(result.emoji).toBe('🌟💫✨');
    });

    it('should handle very long text fields', async () => {
      const longTextOption: MainOption = {
        id: 'option-long',
        name: 'A'.repeat(255), // Very long name
        description: 'B'.repeat(1000), // Very long description
        emoji: '🌟'
      };

      mockAxiosInstance.post.mockResolvedValue({ data: longTextOption });

      const createRequest: Omit<MainOption, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'A'.repeat(255),
        description: 'B'.repeat(1000),
        emoji: '🌟'
      };

      const result = await MainOptionService.create(createRequest);

      expect(result.name).toHaveLength(255);
      expect(result.description).toHaveLength(1000);
    });

    it('should handle network interruption during request', async () => {
      const networkError = new AxiosError('Request failed');
      networkError.code = 'ECONNRESET';
      
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(MainOptionService.getById('option-1')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener la opción principal con id option-1:',
        networkError
      );
    });

    it('should handle rate limiting error', async () => {
      const rateLimitError = new AxiosError('Request failed');
      rateLimitError.response = {
        status: 429,
        data: { message: 'Too many requests' },
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(rateLimitError);

      await expect(MainOptionService.getAll()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener las opciones principales:',
        rateLimitError
      );
    });
  });

  describe('Console Logging', () => {
    it('should log errors with proper context in getCount', async () => {
      const error = new Error('Test error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(MainOptionService.getCount()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener el conteo de opciones principales:',
        error
      );
    });

    it('should log errors with proper context in getById', async () => {
      const error = new Error('Test error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(MainOptionService.getById('test-id')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener la opción principal con id test-id:',
        error
      );
    });

    it('should log errors with proper context in create', async () => {
      const error = new Error('Test error');
      mockAxiosInstance.post.mockRejectedValue(error);

      const createRequest: Omit<MainOption, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Option'
      };

      await expect(MainOptionService.create(createRequest)).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al crear la opción principal:',
        error
      );
    });

    it('should log errors with proper context in update', async () => {
      const error = new Error('Test error');
      mockAxiosInstance.put.mockRejectedValue(error);

      const updateRequest: Partial<MainOption> = { name: 'Updated Name' };

      await expect(MainOptionService.update('test-id', updateRequest)).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al actualizar la opción principal con id test-id:',
        error
      );
    });

    it('should log errors with proper context in delete', async () => {
      const error = new Error('Test error');
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(MainOptionService.delete('test-id')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error al eliminar la opción principal con id test-id:',
        error
      );
    });
  });
});
