import { AxiosError } from 'axios';
import { createRequestWithEntity } from '@/lib/axios';
import { IntendedImpact, IntendedImpactTableView, MainOption } from '@/types/intended-impact';

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
let IntendedImpactService: typeof import('@/services/intended-impacts/intended-impact.service').IntendedImpactService;

beforeAll(() => {
  (require('@/lib/axios').createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);
  IntendedImpactService = require('@/services/intended-impacts/intended-impact.service').IntendedImpactService;
});

describe('IntendedImpactService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock data
  const mockMainOption: MainOption = {
    id: 'main-option-1',
    name: 'Relaxation',
    description: 'Options for relaxation and stress relief',
    emoji: '🧘‍♀️'
  };

  const mockIntendedImpact: IntendedImpact = {
    id: 'impact-1',
    name: 'Deep Relaxation',
    icon: '🌙',
    description: 'Promotes deep relaxation and peaceful sleep',
    mainOptionId: 'main-option-1',
    mainOption: mockMainOption,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockIntendedImpactWithoutRelations: IntendedImpact = {
    id: 'impact-2',
    name: 'Energy Boost',
    icon: '⚡',
    description: 'Provides energy and mental clarity',
    mainOptionId: 'main-option-2',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };

  const mockIntendedImpactTableView: IntendedImpactTableView = {
    id: 'impact-1',
    name: 'Deep Relaxation',
    description: 'Promotes deep relaxation and peaceful sleep',
    icon: '🌙',
    mainOptionName: 'Relaxation',
    mainOptionEmoji: '🧘‍♀️'
  };

  describe('getCount', () => {
    it('should fetch intended impacts count successfully', async () => {
      const mockCount = 15;
      mockAxiosInstance.get.mockResolvedValue({ data: { count: mockCount } });

      const result = await IntendedImpactService.getCount();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/intended-impacts/count/number');
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

      await expect(IntendedImpactService.getCount()).rejects.toThrow();
    });

    it('should handle network error when fetching count', async () => {
      const networkError = new AxiosError('Request failed');
      networkError.code = 'ENOTFOUND';
      
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(IntendedImpactService.getCount()).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('should fetch all intended impacts successfully', async () => {
      const mockIntendedImpacts = [mockIntendedImpact, mockIntendedImpactWithoutRelations];
      mockAxiosInstance.get.mockResolvedValue({ data: mockIntendedImpacts });

      const result = await IntendedImpactService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/intended-impacts');
      expect(result).toEqual(mockIntendedImpacts);
      expect(result).toHaveLength(2);
    });

    it('should handle empty response', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await IntendedImpactService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/intended-impacts');
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle API error when fetching all intended impacts', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 503,
        data: { message: 'Service unavailable' },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(IntendedImpactService.getAll()).rejects.toThrow();
    });
  });

  describe('getAllWithMainOptions', () => {
    it('should fetch all intended impacts with main options successfully', async () => {
      const mockTableViewData = [mockIntendedImpactTableView];
      mockAxiosInstance.get.mockResolvedValue({ data: mockTableViewData });

      const result = await IntendedImpactService.getAllWithMainOptions();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/intended-impacts/with-main-option');
      expect(result).toEqual(mockTableViewData);
      expect(result[0].mainOptionName).toBeDefined();
      expect(result[0].mainOptionEmoji).toBeDefined();
    });

    it('should handle error when fetching intended impacts with main options', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid query parameters' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(IntendedImpactService.getAllWithMainOptions()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch intended impact by ID successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockIntendedImpact });

      const result = await IntendedImpactService.getById('impact-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/intended-impacts/impact-1?relations=mainOption');
      expect(result).toEqual(mockIntendedImpact);
      expect(result.id).toBe('impact-1');
      expect(result.mainOption).toBeDefined();
    });

    it('should handle intended impact not found error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Intended impact not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(IntendedImpactService.getById('nonexistent')).rejects.toThrow();
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

      await expect(IntendedImpactService.getById('impact-1')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create intended impact successfully', async () => {
      const createRequest: Omit<IntendedImpact, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'New Impact',
        icon: '✨',
        description: 'A brand new intended impact',
        mainOptionId: 'main-option-1'
      };

      const createdImpact = { 
        ...createRequest, 
        id: 'new-impact-id',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };
      mockAxiosInstance.post.mockResolvedValue({ data: createdImpact });

      const result = await IntendedImpactService.create(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/intended-impacts', {
        name: 'New Impact',
        icon: '✨',
        description: 'A brand new intended impact',
        mainOptionId: 'main-option-1'
      });
      expect(result).toEqual(createdImpact);
      expect(result.id).toBe('new-impact-id');
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

      const invalidRequest: Omit<IntendedImpact, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Ab',
        icon: '✨',
        description: 'Too short name',
        mainOptionId: 'main-option-1'
      };

      await expect(IntendedImpactService.create(invalidRequest)).rejects.toThrow();
    });

    it('should handle validation error for invalid main option', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Main option not found' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const invalidRequest: Omit<IntendedImpact, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Valid Name',
        icon: '✨',
        description: 'Valid description',
        mainOptionId: 'nonexistent-main-option'
      };

      await expect(IntendedImpactService.create(invalidRequest)).rejects.toThrow();
    });

    it('should handle conflict error for duplicate name', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 409,
        data: { message: 'Intended impact with this name already exists' },
        statusText: 'Conflict',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const duplicateRequest: Omit<IntendedImpact, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Existing Impact Name',
        icon: '✨',
        description: 'Description',
        mainOptionId: 'main-option-1'
      };

      await expect(IntendedImpactService.create(duplicateRequest)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update intended impact successfully', async () => {
      const updateRequest: Partial<IntendedImpact> = {
        name: 'Updated Impact Name',
        description: 'Updated description',
        icon: '🔄'
      };

      const updatedImpact = { ...mockIntendedImpact, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedImpact });

      const result = await IntendedImpactService.update('impact-1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/intended-impacts/impact-1', {
        name: 'Updated Impact Name',
        description: 'Updated description',
        icon: '🔄'
      });
      expect(result).toEqual(updatedImpact);
      expect(result.name).toBe('Updated Impact Name');
    });

    it('should update only main option', async () => {
      const updateRequest: Partial<IntendedImpact> = {
        mainOptionId: 'main-option-2'
      };

      const updatedImpact = { ...mockIntendedImpact, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedImpact });

      const result = await IntendedImpactService.update('impact-1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/intended-impacts/impact-1', {
        mainOptionId: 'main-option-2'
      });
      expect(result.mainOptionId).toBe('main-option-2');
    });

    it('should filter out undefined values', async () => {
      const updateRequest: Partial<IntendedImpact> = {
        name: 'Updated Name',
        description: undefined,
        icon: '🔄',
        mainOptionId: undefined
      };

      const updatedImpact = { ...mockIntendedImpact, name: 'Updated Name', icon: '🔄' };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedImpact });

      const result = await IntendedImpactService.update('impact-1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/intended-impacts/impact-1', {
        name: 'Updated Name',
        icon: '🔄'
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should handle intended impact not found error during update', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Intended impact not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.put.mockRejectedValue(axiosError);

      const updateRequest: Partial<IntendedImpact> = { name: 'New Name' };

      await expect(IntendedImpactService.update('nonexistent', updateRequest)).rejects.toThrow();
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

      const updateRequest: Partial<IntendedImpact> = { name: 'New Name' };

      await expect(IntendedImpactService.update('impact-1', updateRequest)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete intended impact successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await IntendedImpactService.delete('impact-1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/intended-impacts/impact-1');
    });

    it('should handle intended impact not found error during delete', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Intended impact not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(IntendedImpactService.delete('nonexistent')).rejects.toThrow();
    });

    it('should handle conflict error when deleting intended impact in use', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 409,
        data: { message: 'Cannot delete intended impact that is being used by aromas' },
        statusText: 'Conflict',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(IntendedImpactService.delete('impact-1')).rejects.toThrow();
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

      await expect(IntendedImpactService.delete('impact-1')).rejects.toThrow();
    });
  });

  describe('getByMainOption', () => {
    it('should fetch intended impacts by main option without place filter', async () => {
      const mockImpacts = [mockIntendedImpact];
      mockAxiosInstance.get.mockResolvedValue({ data: mockImpacts });

      const result = await IntendedImpactService.getByMainOption('main-option-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/intended-impacts/by-main-option/main-option-1',
        { params: {} }
      );
      expect(result).toEqual(mockImpacts);
    });

    it('should fetch intended impacts by main option with place filter', async () => {
      const mockImpacts = [mockIntendedImpact];
      mockAxiosInstance.get.mockResolvedValue({ data: mockImpacts });

      const result = await IntendedImpactService.getByMainOption('main-option-1', 'place-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/intended-impacts/by-main-option/main-option-1',
        { params: { placeId: 'place-1' } }
      );
      expect(result).toEqual(mockImpacts);
    });

    it('should handle empty result for main option', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await IntendedImpactService.getByMainOption('main-option-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/intended-impacts/by-main-option/main-option-1',
        { params: {} }
      );
      expect(result).toEqual([]);
    });

    it('should handle error when fetching intended impacts by main option', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Main option not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(IntendedImpactService.getByMainOption('nonexistent')).rejects.toThrow();
    });

    it('should handle invalid place ID error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid place ID format' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(IntendedImpactService.getByMainOption('main-option-1', 'invalid-place')).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout error', async () => {
      const timeoutError = new AxiosError('Request failed');
      timeoutError.code = 'ECONNABORTED';
      
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(IntendedImpactService.getAll()).rejects.toThrow();
    });

    it('should handle connection error', async () => {
      const connectionError = new AxiosError('Request failed');
      connectionError.code = 'ENOTFOUND';
      
      mockAxiosInstance.get.mockRejectedValue(connectionError);

      await expect(IntendedImpactService.getAll()).rejects.toThrow();
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

      await expect(IntendedImpactService.getAll()).rejects.toThrow();
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

      await expect(IntendedImpactService.getAll()).rejects.toThrow();
    });

    it('should handle unexpected response format', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: null });

      // This should still work as the service doesn't validate response format
      const result = await IntendedImpactService.getAll();
      expect(result).toBeNull();
    });

    it('should handle malformed response data', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: 'invalid-json' });

      const result = await IntendedImpactService.getAll();
      expect(result).toBe('invalid-json');
    });
  });

  describe('Service Configuration', () => {
    
    it('should pass through errors from interceptor', async () => {
      const customError = new Error('Custom interceptor error');
      mockAxiosInstance.get.mockRejectedValue(customError);

      await expect(IntendedImpactService.getAll()).rejects.toThrow('Custom interceptor error');
    });
  });

  describe('Data Processing', () => {
    it('should handle intended impact with all optional fields', async () => {
      const fullImpact: IntendedImpact = {
        id: 'impact-full',
        name: 'Full Impact',
        icon: '🌟',
        description: 'Complete intended impact with all fields',
        mainOptionId: 'main-option-1',
        mainOption: mockMainOption,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };

      mockAxiosInstance.get.mockResolvedValue({ data: fullImpact });

      const result = await IntendedImpactService.getById('impact-full');

      expect(result).toEqual(fullImpact);
      expect(result.mainOption).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should handle intended impact with minimal fields', async () => {
      const minimalImpact: IntendedImpact = {
        id: 'impact-minimal',
        name: 'Minimal Impact',
        icon: '⭐',
        description: 'Minimal intended impact',
        mainOptionId: 'main-option-1'
      };

      mockAxiosInstance.get.mockResolvedValue({ data: minimalImpact });

      const result = await IntendedImpactService.getById('impact-minimal');

      expect(result).toEqual(minimalImpact);
      expect(result.mainOption).toBeUndefined();
      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });

    it('should handle table view with null main option fields', async () => {
      const tableViewWithNulls: IntendedImpactTableView = {
        id: 'impact-1',
        name: 'Impact without main option',
        description: 'Description',
        icon: '❓',
        mainOptionName: null,
        mainOptionEmoji: null
      };

      mockAxiosInstance.get.mockResolvedValue({ data: [tableViewWithNulls] });

      const result = await IntendedImpactService.getAllWithMainOptions();

      expect(result[0].mainOptionName).toBeNull();
      expect(result[0].mainOptionEmoji).toBeNull();
    });
  });
});
