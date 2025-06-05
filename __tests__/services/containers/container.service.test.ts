import { AxiosError } from 'axios';
import { createRequestWithEntity } from '@/lib/axios';
import { Container } from '@/types/container';

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
let ContainerService: typeof import('@/services/containers/container.service').ContainerService;

beforeAll(() => {
  (require('@/lib/axios').createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);
  ContainerService = require('@/services/containers/container.service').ContainerService;
});

describe('ContainerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock data
  const mockContainer: Container = {
    id: 'container1',
    name: 'Glass Jar',
    description: 'Beautiful transparent glass jar for candles',
    basePrice: 15.99,
    imageUrl: 'https://example.com/glass-jar.jpg',
    dimensions: {
      height: 10,
      width: 8,
      depth: 8
    },
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z')
  };

  const mockContainerWithoutOptionals: Container = {
    id: 'container2',
    name: 'Simple Container',
    basePrice: 12.50
  };

  describe('getCount', () => {
    it('should fetch container count successfully', async () => {
      const mockCount = 25;
      mockAxiosInstance.get.mockResolvedValue({ data: { count: mockCount } });

      const result = await ContainerService.getCount();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/containers/count/number');
      expect(result).toBe(mockCount);
    });

    it('should handle error when fetching count', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(ContainerService.getCount()).rejects.toThrow();
    });

    it('should handle network error when fetching count', async () => {
      const networkError = new AxiosError('Request failed');
      networkError.code = 'ENOTFOUND';

      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(ContainerService.getCount()).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('should fetch all containers successfully', async () => {
      const mockContainers = [mockContainer, mockContainerWithoutOptionals];
      mockAxiosInstance.get.mockResolvedValue({ data: mockContainers });

      const result = await ContainerService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/containers');
      expect(result).toEqual(mockContainers);
      expect(result).toHaveLength(2);
    });

    it('should handle empty response', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      const result = await ContainerService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/containers');
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle API error when fetching all containers', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 503,
        data: { message: 'Service unavailable' },
        statusText: 'Service Unavailable',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(ContainerService.getAll()).rejects.toThrow();
    });

    it('should handle timeout error', async () => {
      const timeoutError = new AxiosError('Request failed');
      timeoutError.code = 'ECONNABORTED';

      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(ContainerService.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch container by ID successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: mockContainer });

      const result = await ContainerService.getById('container1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/containers/container1');
      expect(result).toEqual(mockContainer);
      expect(result.id).toBe('container1');
    });

    it('should handle container not found error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Container not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(ContainerService.getById('nonexistent')).rejects.toThrow();
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

      await expect(ContainerService.getById('container1')).rejects.toThrow();
    });

    it('should handle invalid ID format error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid container ID format' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(ContainerService.getById('invalid-id')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create container successfully', async () => {
      const createRequest: Omit<Container, 'id'> = {
        name: 'New Container',
        description: 'A brand new container',
        basePrice: 20.99,
        imageUrl: 'https://example.com/new-container.jpg',
        dimensions: {
          height: 12,
          width: 10,
          depth: 10
        }
      };

      const createdContainer = { ...createRequest, id: 'new-container-id' };
      mockAxiosInstance.post.mockResolvedValue({ data: createdContainer });

      const result = await ContainerService.create(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/containers', createRequest);
      expect(result).toEqual(createdContainer);
      expect(result.id).toBe('new-container-id');
    });

    it('should create container with minimal data', async () => {
      const createRequest: Omit<Container, 'id'> = {
        name: 'Basic Container',
        basePrice: 10.00
      };

      const createdContainer = { ...createRequest, id: 'basic-container-id' };
      mockAxiosInstance.post.mockResolvedValue({ data: createdContainer });

      const result = await ContainerService.create(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/containers', createRequest);
      expect(result).toEqual(createdContainer);
      expect(result.name).toBe('Basic Container');
      expect(result.basePrice).toBe(10.00);
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

      const invalidRequest: Omit<Container, 'id'> = {
        name: 'Ab',
        basePrice: 10.00
      };

      await expect(ContainerService.create(invalidRequest)).rejects.toThrow();
    });

    it('should handle validation error for invalid price', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Base price must be a positive number' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const invalidRequest: Omit<Container, 'id'> = {
        name: 'Valid Name',
        basePrice: -5.00
      };

      await expect(ContainerService.create(invalidRequest)).rejects.toThrow();
    });

    it('should handle conflict error for duplicate name', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 409,
        data: { message: 'Container with this name already exists' },
        statusText: 'Conflict',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const duplicateRequest: Omit<Container, 'id'> = {
        name: 'Existing Container Name',
        basePrice: 15.00
      };

      await expect(ContainerService.create(duplicateRequest)).rejects.toThrow();
    });

    it('should handle server error during creation', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const validRequest: Omit<Container, 'id'> = {
        name: 'Valid Container',
        basePrice: 15.00
      };

      await expect(ContainerService.create(validRequest)).rejects.toThrow();
    });
  });

  describe('createWithFile', () => {
    it('should create container with file successfully', async () => {
      const createRequest: Omit<Container, 'id'> = {
        name: 'Container with Image',
        description: 'Container with uploaded image',
        basePrice: 25.99,
        dimensions: {
          height: 15,
          width: 12,
          depth: 12
        }
      };

      const mockFile = new File(['fake image'], 'container.jpg', { type: 'image/jpeg' });
      const createdContainer = { 
        ...createRequest, 
        id: 'container-with-file-id',
        imageUrl: 'https://example.com/uploaded-container.jpg'
      };

      mockAxiosInstance.post.mockResolvedValue({ data: createdContainer });

      const result = await ContainerService.createWithFile(createRequest, mockFile);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/containers',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(createdContainer);
      expect(result.imageUrl).toBe('https://example.com/uploaded-container.jpg');
    });

    it('should create container without file', async () => {
      const createRequest: Omit<Container, 'id'> = {
        name: 'Container without Image',
        basePrice: 20.00
      };

      const createdContainer = { ...createRequest, id: 'container-no-file-id' };
      mockAxiosInstance.post.mockResolvedValue({ data: createdContainer });

      const result = await ContainerService.createWithFile(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/containers',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(createdContainer);
    });

    it('should handle file upload error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 413,
        data: { message: 'File too large' },
        statusText: 'Payload Too Large',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const createRequest: Omit<Container, 'id'> = {
        name: 'Large File Container',
        basePrice: 15.00
      };

      const largeMockFile = new File(['very large file content'], 'large-container.jpg', { 
        type: 'image/jpeg' 
      });

      await expect(ContainerService.createWithFile(createRequest, largeMockFile)).rejects.toThrow();
    });

    it('should handle invalid file type error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid file type. Only images are allowed' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.post.mockRejectedValue(axiosError);

      const createRequest: Omit<Container, 'id'> = {
        name: 'Invalid File Container',
        basePrice: 15.00
      };

      const invalidFile = new File(['text content'], 'container.txt', { 
        type: 'text/plain' 
      });

      await expect(ContainerService.createWithFile(createRequest, invalidFile)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update container successfully', async () => {
      const updateRequest: Partial<Container> = {
        name: 'Updated Container Name',
        description: 'Updated description',
        basePrice: 18.99
      };

      const updatedContainer = { ...mockContainer, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedContainer });

      const result = await ContainerService.update('container1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/containers/container1', updateRequest);
      expect(result).toEqual(updatedContainer);
      expect(result.name).toBe('Updated Container Name');
      expect(result.basePrice).toBe(18.99);
    });

    it('should update only specific fields', async () => {
      const updateRequest: Partial<Container> = {
        basePrice: 22.50
      };

      const updatedContainer = { ...mockContainer, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedContainer });

      const result = await ContainerService.update('container1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/containers/container1', updateRequest);
      expect(result.basePrice).toBe(22.50);
      expect(result.name).toBe(mockContainer.name); // Should remain unchanged
    });

    it('should update dimensions', async () => {
      const updateRequest: Partial<Container> = {
        dimensions: {
          height: 15,
          width: 12,
          depth: 12
        }
      };

      const updatedContainer = { ...mockContainer, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedContainer });

      const result = await ContainerService.update('container1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/containers/container1', updateRequest);
      expect(result.dimensions).toEqual(updateRequest.dimensions);
    });

    it('should handle container not found error during update', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Container not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.put.mockRejectedValue(axiosError);

      const updateRequest: Partial<Container> = { name: 'New Name' };

      await expect(ContainerService.update('nonexistent', updateRequest)).rejects.toThrow();
    });

    it('should handle validation error during update', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 400,
        data: { message: 'Invalid price value' },
        statusText: 'Bad Request',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.put.mockRejectedValue(axiosError);

      const invalidUpdateRequest: Partial<Container> = { basePrice: -10 };

      await expect(ContainerService.update('container1', invalidUpdateRequest)).rejects.toThrow();
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

      const updateRequest: Partial<Container> = { name: 'New Name' };

      await expect(ContainerService.update('container1', updateRequest)).rejects.toThrow();
    });
  });

  describe('updateWithFile', () => {
    it('should update container with new file successfully', async () => {
      const updateRequest: Partial<Container> = {
        name: 'Updated Container with New Image',
        basePrice: 30.00
      };

      const mockFile = new File(['new image'], 'new-container.jpg', { type: 'image/jpeg' });
      const updatedContainer = { 
        ...mockContainer, 
        ...updateRequest,
        imageUrl: 'https://example.com/new-uploaded-container.jpg'
      };

      mockAxiosInstance.put.mockResolvedValue({ data: updatedContainer });

      const result = await ContainerService.updateWithFile('container1', updateRequest, mockFile);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/containers/container1',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(updatedContainer);
      expect(result.imageUrl).toBe('https://example.com/new-uploaded-container.jpg');
    });

    it('should update container without file', async () => {
      const updateRequest: Partial<Container> = {
        description: 'Updated description only'
      };

      const updatedContainer = { ...mockContainer, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValue({ data: updatedContainer });

      const result = await ContainerService.updateWithFile('container1', updateRequest);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/containers/container1',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(updatedContainer);
    });

    it('should handle file size error during update', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 413,
        data: { message: 'File too large' },
        statusText: 'Payload Too Large',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.put.mockRejectedValue(axiosError);

      const updateRequest: Partial<Container> = {
        name: 'Container with Large File'
      };

      const largeMockFile = new File(['very large file'], 'large-update.jpg', { 
        type: 'image/jpeg' 
      });

      await expect(ContainerService.updateWithFile('container1', updateRequest, largeMockFile))
        .rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete container successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await ContainerService.delete('container1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/containers/container1');
    });

    it('should handle container not found error during delete', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 404,
        data: { message: 'Container not found' },
        statusText: 'Not Found',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(ContainerService.delete('nonexistent')).rejects.toThrow();
    });

    it('should handle conflict error when deleting container in use', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 409,
        data: { message: 'Cannot delete container that is being used in candles' },
        statusText: 'Conflict',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(ContainerService.delete('container1')).rejects.toThrow();
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

      await expect(ContainerService.delete('container1')).rejects.toThrow();
    });

    it('should handle forbidden delete error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 403,
        data: { message: 'Insufficient permissions' },
        statusText: 'Forbidden',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(ContainerService.delete('container1')).rejects.toThrow();
    });

    it('should handle server error during delete', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 500,
        data: { message: 'Internal server error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.delete.mockRejectedValue(axiosError);

      await expect(ContainerService.delete('container1')).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout error', async () => {
      const timeoutError = new AxiosError('Request failed');
      timeoutError.code = 'ECONNABORTED';

      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(ContainerService.getAll()).rejects.toThrow();
    });

    it('should handle connection error', async () => {
      const connectionError = new AxiosError('Request failed');
      connectionError.code = 'ENOTFOUND';

      mockAxiosInstance.get.mockRejectedValue(connectionError);

      await expect(ContainerService.getAll()).rejects.toThrow();
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

      await expect(ContainerService.getAll()).rejects.toThrow();
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

      await expect(ContainerService.getAll()).rejects.toThrow();
    });

    it('should handle rate limit error', async () => {
      const axiosError = new AxiosError('Request failed');
      axiosError.response = {
        status: 429,
        data: { message: 'Too many requests' },
        statusText: 'Too Many Requests',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.get.mockRejectedValue(axiosError);

      await expect(ContainerService.getAll()).rejects.toThrow();
    });

    it('should handle malformed response error', async () => {
      const malformedError = new AxiosError('Request failed');
      malformedError.response = {
        status: 200,
        data: null,
        statusText: 'OK',
        headers: {},
        config: {} as any
      };

      mockAxiosInstance.get.mockRejectedValue(malformedError);

      await expect(ContainerService.getById('container1')).rejects.toThrow();
    });
  });

  describe('FormData Handling', () => {
    it('should properly format FormData for complex objects', async () => {
      const createRequest: Omit<Container, 'id'> = {
        name: 'Complex Container',
        description: 'Container with complex dimensions',
        basePrice: 25.99,
        dimensions: {
          height: 15,
          width: 12,
          depth: 10
        }
      };

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const createdContainer = { ...createRequest, id: 'complex-container-id' };

      mockAxiosInstance.post.mockResolvedValue({ data: createdContainer });

      await ContainerService.createWithFile(createRequest, mockFile);

      // Verify FormData was used
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/containers',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    it('should skip empty or null values in FormData', async () => {
      const createRequest: Omit<Container, 'id'> = {
        name: 'Container with Nulls',
        description: '',
        basePrice: 15.00,
        imageUrl: null as any,
        dimensions: undefined
      };

      const createdContainer = { ...createRequest, id: 'clean-container-id' };
      mockAxiosInstance.post.mockResolvedValue({ data: createdContainer });

      await ContainerService.createWithFile(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/containers',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    it('should handle empty objects in FormData', async () => {
      const createRequest: Omit<Container, 'id'> = {
        name: 'Container with Empty Object',
        basePrice: 15.00,
        dimensions: {}
      };

      const createdContainer = { ...createRequest, id: 'empty-obj-container-id' };
      mockAxiosInstance.post.mockResolvedValue({ data: createdContainer });

      await ContainerService.createWithFile(createRequest);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/containers',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle full CRUD workflow', async () => {
      // Create
      const createRequest: Omit<Container, 'id'> = {
        name: 'Workflow Container',
        basePrice: 20.00
      };
      const createdContainer = { ...createRequest, id: 'workflow-id' };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: createdContainer });

      const created = await ContainerService.create(createRequest);
      expect(created.id).toBe('workflow-id');

      // Read
      mockAxiosInstance.get.mockResolvedValueOnce({ data: createdContainer });
      const fetched = await ContainerService.getById('workflow-id');
      expect(fetched).toEqual(createdContainer);

      // Update
      const updateRequest = { basePrice: 25.00 };
      const updatedContainer = { ...createdContainer, ...updateRequest };
      mockAxiosInstance.put.mockResolvedValueOnce({ data: updatedContainer });

      const updated = await ContainerService.update('workflow-id', updateRequest);
      expect(updated.basePrice).toBe(25.00);

      // Delete
      mockAxiosInstance.delete.mockResolvedValueOnce({});
      await ContainerService.delete('workflow-id');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/containers/workflow-id');
    });

    it('should handle concurrent operations', async () => {
      const containers = [
        { ...mockContainer, id: 'concurrent1' },
        { ...mockContainer, id: 'concurrent2' },
        { ...mockContainer, id: 'concurrent3' }
      ];

      // Mock multiple simultaneous reads
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: containers[0] })
        .mockResolvedValueOnce({ data: containers[1] })
        .mockResolvedValueOnce({ data: containers[2] });

      const promises = [
        ContainerService.getById('concurrent1'),
        ContainerService.getById('concurrent2'),
        ContainerService.getById('concurrent3')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe('concurrent1');
      expect(results[1].id).toBe('concurrent2');
      expect(results[2].id).toBe('concurrent3');
    });
  });
});
