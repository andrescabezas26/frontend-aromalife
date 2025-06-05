// filepath: c:\Universidad\Semestre VII\Compunet III\AromaLife\frontend-aromalife-adn\__tests__\services\aromas\aroma.service.test.ts
import { AxiosError } from 'axios';
import { createRequestWithEntity } from '@/lib/axios';
import { Aroma } from '@/types/aroma';
import { IntendedImpact } from '@/types/intended-impact';

// Mock del módulo axios
jest.mock('@/lib/axios', () => ({
  createRequestWithEntity: jest.fn(),
}));

const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

(createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);

// IMPORTAR DESPUÉS de haber mockeado
let AromaService: typeof import('@/services/aromas/aroma.service').AromaService;

beforeAll(() => {
  (require('@/lib/axios').createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);
  AromaService = require('@/services/aromas/aroma.service').AromaService;
});

describe('AromaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // Mock data
  const mockIntendedImpact: IntendedImpact = {
    id: 'impact1',
    name: 'Relaxation',
    description: 'Promotes relaxation and stress relief',
    icon: '🧘‍♀️',
    mainOptionId: 'main-option-1'
  };

  const mockAroma: Aroma = {
    id: 'aroma1',
    name: 'Lavender Dreams',
    description: 'A calming lavender scent perfect for relaxation',
    imageUrl: 'https://example.com/lavender.jpg',
    color: '#9B59B6',
    olfativePyramid: {
      salida: 'Fresh citrus, bergamot',
      corazon: 'Lavender, chamomile',
      fondo: 'Vanilla, sandalwood'
    },
    intendedImpacts: [mockIntendedImpact],
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z')
  };

  const mockAromaWithoutRelations: Aroma = {
    id: 'aroma2',
    name: 'Energizing Citrus',
    description: 'An invigorating citrus blend',
    imageUrl: 'https://example.com/citrus.jpg',
    color: '#FFA500',
    olfativePyramid: {
      salida: 'Lemon, orange zest',
      corazon: 'Grapefruit, lime',
      fondo: 'Cedar, musk'
    }
  };

  describe('getCount', () => {
    it('should fetch aroma count successfully', async () => {
      const mockCount = { count: 25 };
      mockAxiosInstance.get.mockResolvedValue({ data: mockCount });

      const result = await AromaService.getCount();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas/count/number');
      expect(result).toBe(25);
    });

    it('should handle API error when fetching count', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(AromaService.getCount()).rejects.toThrow();
    });

    it('should handle network error when fetching count', async () => {
      const networkError = new Error('Network Error');
      (networkError as any).code = 'NETWORK_ERROR';
      
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(AromaService.getCount()).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('should fetch all aromas successfully', async () => {
      const mockAromas = [mockAroma, mockAromaWithoutRelations];
      mockAxiosInstance.get.mockResolvedValue({ data: mockAromas });

      const result = await AromaService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas');
      expect(result).toEqual(mockAromas);
      expect(result).toHaveLength(2);
    });

    it('should handle empty response', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await AromaService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas');
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle API error when fetching all aromas', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 503,
        data: { message: 'Service unavailable' },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(AromaService.getAll()).rejects.toThrow();
    });
  });

  describe('getAllWithRelations', () => {
    it('should fetch all aromas with intended impacts successfully', async () => {
      const mockAromasWithRelations = [mockAroma];
      mockAxiosInstance.get.mockResolvedValue({ data: mockAromasWithRelations });

      const result = await AromaService.getAllWithRelations();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas?relations=intendedImpacts');
      expect(result).toEqual(mockAromasWithRelations);
      expect(result[0].intendedImpacts).toBeDefined();
      expect(result[0].intendedImpacts).toHaveLength(1);
    });

    it('should handle error when fetching aromas with relations', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid query parameters' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(AromaService.getAllWithRelations()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch aroma by ID successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockAroma });

      const result = await AromaService.getById('aroma1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas/aroma1');
      expect(result).toEqual(mockAroma);
      expect(result.id).toBe('aroma1');
    });

    it('should handle aroma not found error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Aroma not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(AromaService.getById('nonexistent')).rejects.toThrow();
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

      await expect(AromaService.getById('aroma1')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create aroma successfully', async () => {
      const createRequest: Omit<Aroma, 'id'> = {
        name: 'New Aroma',
        description: 'A brand new aroma',
        imageUrl: 'https://example.com/new-aroma.jpg',
        color: '#FF6B6B',
        olfativePyramid: {
          salida: 'Fresh mint',
          corazon: 'Rose petals',
          fondo: 'Amber'
        }
      };

      const createdAroma = { ...createRequest, id: 'new-aroma-id' };
      mockAxiosInstance.post.mockResolvedValue({ data: createdAroma });

      const result = await AromaService.create(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/aromas', createRequest);
      expect(result).toEqual(createdAroma);
      expect(result.id).toBe('new-aroma-id');
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

      const invalidRequest: Omit<Aroma, 'id'> = {
        name: 'Ab',
        description: 'Too short name',
        imageUrl: 'https://example.com/test.jpg',
        color: '#FF0000',
        olfativePyramid: {
          salida: 'Test',
          corazon: 'Test',
          fondo: 'Test'
        }
      };

      await expect(AromaService.create(invalidRequest)).rejects.toThrow();
    });

    it('should handle validation error for invalid color format', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Color must be a valid hex color' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const invalidRequest: Omit<Aroma, 'id'> = {
        name: 'Valid Name',
        description: 'Valid description',
        imageUrl: 'https://example.com/test.jpg',
        color: 'invalid-color',
        olfativePyramid: {
          salida: 'Test',
          corazon: 'Test',
          fondo: 'Test'
        }
      };

      await expect(AromaService.create(invalidRequest)).rejects.toThrow();
    });

    it('should handle conflict error for duplicate name', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 409,
        data: { message: 'Aroma with this name already exists' },
        statusText: 'Conflict',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const duplicateRequest: Omit<Aroma, 'id'> = {
        name: 'Existing Aroma Name',
        description: 'Description',
        imageUrl: 'https://example.com/test.jpg',
        color: '#FF0000',
        olfativePyramid: {
          salida: 'Test',
          corazon: 'Test',
          fondo: 'Test'
        }
      };

      await expect(AromaService.create(duplicateRequest)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update aroma successfully', async () => {
      const updateRequest: Partial<Aroma> = {
        name: 'Updated Aroma Name',
        description: 'Updated description',
        color: '#00FF00'
      };

      const updatedAroma = { ...mockAroma, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedAroma });

      const result = await AromaService.update('aroma1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/aromas/aroma1', updateRequest);
      expect(result).toEqual(updatedAroma);
      expect(result.name).toBe('Updated Aroma Name');
    });

    it('should update only olfactive pyramid', async () => {
      const updateRequest: Partial<Aroma> = {
        olfativePyramid: {
          salida: 'New top notes',
          corazon: 'New heart notes',
          fondo: 'New base notes'
        }
      };

      const updatedAroma = { ...mockAroma, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedAroma });

      const result = await AromaService.update('aroma1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/aromas/aroma1', updateRequest);
      expect(result.olfativePyramid).toEqual(updateRequest.olfativePyramid);
    });

    it('should handle aroma not found error during update', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Aroma not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.put.mockRejectedValue(axiosError);

      const updateRequest: Partial<Aroma> = { name: 'New Name' };

      await expect(AromaService.update('nonexistent', updateRequest)).rejects.toThrow();
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

      const updateRequest: Partial<Aroma> = { name: 'New Name' };

      await expect(AromaService.update('aroma1', updateRequest)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete aroma successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await AromaService.delete('aroma1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/aromas/aroma1');
    });

    it('should handle aroma not found error during delete', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Aroma not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(AromaService.delete('nonexistent')).rejects.toThrow();
    });

    it('should handle conflict error when deleting aroma in use', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 409,
        data: { message: 'Cannot delete aroma that is being used in candles' },
        statusText: 'Conflict',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(AromaService.delete('aroma1')).rejects.toThrow();
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

      await expect(AromaService.delete('aroma1')).rejects.toThrow();
    });
  });

  describe('getAromasByMainOption', () => {
    it('should fetch aromas by main option without place filter', async () => {
      const mockAromas = [mockAroma];
      mockAxiosInstance.get.mockResolvedValue({ data: mockAromas });

      const result = await AromaService.getAromasByMainOption('main-option-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas/by-main-option/main-option-1');
      expect(result).toEqual(mockAromas);
    });

    it('should fetch aromas by main option with place filter', async () => {
      const mockAromas = [mockAroma];
      mockAxiosInstance.get.mockResolvedValue({ data: mockAromas });

      const result = await AromaService.getAromasByMainOption('main-option-1', 'place-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas/by-main-option/main-option-1?placeId=place-1');
      expect(result).toEqual(mockAromas);
    });

    it('should handle error when fetching aromas by main option', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid main option ID' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(AromaService.getAromasByMainOption('invalid-id')).rejects.toThrow();
    });
  });

  describe('getAromasByIntendedImpact', () => {
    it('should fetch aromas by intended impact successfully', async () => {
      const mockAromas = [mockAroma];
      mockAxiosInstance.get.mockResolvedValue({ data: mockAromas });

      const result = await AromaService.getAromasByIntendedImpact('impact-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas/by-intended-impact/impact-1');
      expect(result).toEqual(mockAromas);
    });

    it('should handle empty result for intended impact', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await AromaService.getAromasByIntendedImpact('impact-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas/by-intended-impact/impact-1');
      expect(result).toEqual([]);
    });

    it('should handle error when fetching aromas by intended impact', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Intended impact not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(AromaService.getAromasByIntendedImpact('nonexistent')).rejects.toThrow();
    });
  });

  describe('getAromasByCompleteTestResults', () => {
    it('should fetch aromas by complete test results with all parameters', async () => {
      const mockAromas = [mockAroma];
      mockAxiosInstance.get.mockResolvedValue({ data: mockAromas });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await AromaService.getAromasByCompleteTestResults('impact-1', 'main-option-1', 'place-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas/by-test-results/impact-1?mainOptionId=main-option-1&placeId=place-1');
      expect(result).toEqual(mockAromas);
      expect(consoleSpy).toHaveBeenCalledWith('getAromasByCompleteTestResults response', mockAromas);

      consoleSpy.mockRestore();
    });

    it('should fetch aromas by complete test results with only intended impact', async () => {
      const mockAromas = [mockAroma];
      mockAxiosInstance.get.mockResolvedValue({ data: mockAromas });

      const result = await AromaService.getAromasByCompleteTestResults('impact-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas/by-test-results/impact-1');
      expect(result).toEqual(mockAromas);
    });

    it('should fetch aromas by complete test results with partial parameters', async () => {
      const mockAromas = [mockAroma];
      mockAxiosInstance.get.mockResolvedValue({ data: mockAromas });

      const result = await AromaService.getAromasByCompleteTestResults('impact-1', 'main-option-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/aromas/by-test-results/impact-1?mainOptionId=main-option-1');
      expect(result).toEqual(mockAromas);
    });

    it('should handle error and log it when fetching aromas by complete test results', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.get.mockRejectedValue(axiosError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(AromaService.getAromasByCompleteTestResults('impact-1')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching aromas by complete test results:', axiosError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('assignIntendedImpact', () => {
    it('should assign intended impact to aroma successfully', async () => {      const updatedAroma = {
        ...mockAroma,
        intendedImpacts: [mockIntendedImpact, { id: 'impact2', name: 'Energy', description: 'Energizing impact', icon: '⚡', mainOptionId: 'main-option-2' }]
      };
      mockAxiosInstance.patch.mockResolvedValue({ data: updatedAroma });

      const result = await AromaService.assignIntendedImpact('aroma1', 'impact2');

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/aromas/aroma1/assign-intended-impact/impact2');
      expect(result).toEqual(updatedAroma);
      expect(result.intendedImpacts).toHaveLength(2);
    });

    it('should handle error when assigning intended impact', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Intended impact already assigned to this aroma' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(AromaService.assignIntendedImpact('aroma1', 'impact1')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error assigning intended impact to aroma: alpin', axiosError);

      consoleErrorSpy.mockRestore();
    });

    it('should handle aroma not found error during assign', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Aroma not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      await expect(AromaService.assignIntendedImpact('nonexistent', 'impact1')).rejects.toThrow();
    });

    it('should handle intended impact not found error during assign', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Intended impact not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      await expect(AromaService.assignIntendedImpact('aroma1', 'nonexistent')).rejects.toThrow();
    });
  });

  describe('removeIntendedImpact', () => {
    it('should remove intended impact from aroma successfully', async () => {
      const updatedAroma = {
        ...mockAroma,
        intendedImpacts: []
      };
      mockAxiosInstance.patch.mockResolvedValue({ data: updatedAroma });

      const result = await AromaService.removeIntendedImpact('aroma1', 'impact1');

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/aromas/aroma1/remove-intended-impact/impact1');
      expect(result).toEqual(updatedAroma);
      expect(result.intendedImpacts).toHaveLength(0);
    });

    it('should handle error when removing intended impact', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Intended impact not assigned to this aroma' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(AromaService.removeIntendedImpact('aroma1', 'impact2')).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error removing intended impact from aroma:', axiosError);

      consoleErrorSpy.mockRestore();
    });

    it('should handle aroma not found error during remove', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Aroma not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      await expect(AromaService.removeIntendedImpact('nonexistent', 'impact1')).rejects.toThrow();
    });

    it('should handle intended impact not found error during remove', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Intended impact not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };
      
      mockAxiosInstance.patch.mockRejectedValue(axiosError);

      await expect(AromaService.removeIntendedImpact('aroma1', 'nonexistent')).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout error', async () => {
      const timeoutError = new AxiosError('Request failed');
      timeoutError.code = 'ECONNABORTED';
      
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(AromaService.getAll()).rejects.toThrow();
    });

    it('should handle connection error', async () => {
      const connectionError = new AxiosError('Request failed');
      connectionError.code = 'ENOTFOUND';
      
      mockAxiosInstance.get.mockRejectedValue(connectionError);

      await expect(AromaService.getAll()).rejects.toThrow();
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

      await expect(AromaService.getAll()).rejects.toThrow();
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

      await expect(AromaService.getAll()).rejects.toThrow();
    });

    it('should handle non-AxiosError exceptions', async () => {
      const genericError = new Error('Generic error');
      
      mockAxiosInstance.get.mockRejectedValue(genericError);

      await expect(AromaService.getAll()).rejects.toThrow('Generic error');
    });
  });
});
