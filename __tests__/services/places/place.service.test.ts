import { AxiosError } from 'axios';
import { createRequestWithEntity } from '@/lib/axios';
import { Place } from '@/types/place';

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
let PlaceService: typeof import('@/services/places/place.service').PlaceService;

beforeAll(() => {
  (require('@/lib/axios').createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);
  PlaceService = require('@/services/places/place.service').PlaceService;
});

describe('PlaceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getCount', () => {
    it('should successfully get places count', async () => {
      // Arrange
      const mockCount = 25;
      const mockResponse = { data: { count: mockCount } };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getCount();

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/places/count/number');
      expect(result).toBe(mockCount);
    });

    it('should handle zero count', async () => {
      // Arrange
      const mockResponse = { data: { count: 0 } };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getCount();

      // Assert
      expect(result).toBe(0);
    });

    it('should handle large count numbers', async () => {
      // Arrange
      const mockCount = 999999;
      const mockResponse = { data: { count: mockCount } };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getCount();

      // Assert
      expect(result).toBe(mockCount);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const errorMessage = 'Network error';
      mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(PlaceService.getCount()).rejects.toThrow(errorMessage);
      expect(console.error).toHaveBeenCalledWith(
        'Error al obtener el conteo de lugares:',
        expect.any(Error)
      );
    });

    it('should handle HTTP error responses', async () => {
      // Arrange
      const axiosError = new AxiosError('Request failed', '500', undefined, {}, {
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'Server error' },
        headers: {},
        config: {} as any
      });
      mockAxiosInstance.get.mockRejectedValueOnce(axiosError);

      // Act & Assert
      await expect(PlaceService.getCount()).rejects.toThrow(axiosError);
    });

    it('should handle malformed response data', async () => {
      // Arrange
      const mockResponse = { data: {} }; // Missing count property
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getCount();

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    const mockPlaces: Place[] = [
      {
        id: '1',
        name: 'Sala de estar',
        icon: 'home',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Dormitorio',
        icon: 'bed',
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z'
      },
      {
        id: '3',
        name: 'Cocina',
        icon: 'kitchen',
        createdAt: '2023-01-03T00:00:00Z',
        updatedAt: '2023-01-03T00:00:00Z'
      }
    ];

    it('should successfully get all places', async () => {
      // Arrange
      const mockResponse = { data: mockPlaces };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getAll();

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/places');
      expect(result).toEqual(mockPlaces);
      expect(result).toHaveLength(3);
    });

    it('should handle empty places array', async () => {
      // Arrange
      const mockResponse = { data: [] };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle single place in array', async () => {
      // Arrange
      const singlePlace = [mockPlaces[0]];
      const mockResponse = { data: singlePlace };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getAll();

      // Assert
      expect(result).toEqual(singlePlace);
      expect(result).toHaveLength(1);
    });

    it('should handle places with minimal data', async () => {
      // Arrange
      const minimalPlaces: Place[] = [
        { name: 'Test Place', icon: 'test' }
      ];
      const mockResponse = { data: minimalPlaces };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getAll();

      // Assert
      expect(result).toEqual(minimalPlaces);
    });

    it('should handle places with special characters', async () => {
      // Arrange
      const specialPlaces: Place[] = [
        {
          id: '1',
          name: 'Baño & Aseo',
          icon: 'bath-tub',
          createdAt: '2023-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Estudio/Oficina',
          icon: 'office',
          createdAt: '2023-01-02T00:00:00Z'
        }
      ];
      const mockResponse = { data: specialPlaces };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getAll();

      // Assert
      expect(result).toEqual(specialPlaces);
    });

    it('should handle large number of places', async () => {
      // Arrange
      const largePlacesList = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Place ${i + 1}`,
        icon: `icon-${i + 1}`,
        createdAt: '2023-01-01T00:00:00Z'
      }));
      const mockResponse = { data: largePlacesList };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getAll();

      // Assert
      expect(result).toHaveLength(100);
      expect(result[0]).toEqual(largePlacesList[0]);
      expect(result[99]).toEqual(largePlacesList[99]);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const errorMessage = 'Network error';
      mockAxiosInstance.get.mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(PlaceService.getAll()).rejects.toThrow(errorMessage);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching places:',
        expect.any(Error)
      );
    });

    it('should handle 404 error', async () => {
      // Arrange
      const axiosError = new AxiosError('Not Found', '404');
      mockAxiosInstance.get.mockRejectedValueOnce(axiosError);

      // Act & Assert
      await expect(PlaceService.getAll()).rejects.toThrow(axiosError);
    });

    it('should handle network timeout', async () => {
      // Arrange
      const timeoutError = new AxiosError('timeout of 5000ms exceeded', 'ECONNABORTED');
      mockAxiosInstance.get.mockRejectedValueOnce(timeoutError);

      // Act & Assert
      await expect(PlaceService.getAll()).rejects.toThrow(timeoutError);
    });
  });

  describe('getById', () => {
    const mockPlace: Place = {
      id: '1',
      name: 'Sala de estar',
      icon: 'home',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    it('should successfully get place by ID', async () => {
      // Arrange
      const placeId = '1';
      const mockResponse = { data: mockPlace };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getById(placeId);

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/places/${placeId}`);
      expect(result).toEqual(mockPlace);
    });

    it('should handle place with minimal data', async () => {
      // Arrange
      const minimalPlace: Place = { name: 'Test Place', icon: 'test' };
      const mockResponse = { data: minimalPlace };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getById('1');

      // Assert
      expect(result).toEqual(minimalPlace);
    });

    it('should handle UUID format ID', async () => {
      // Arrange
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      const mockResponse = { data: mockPlace };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      await PlaceService.getById(uuidId);

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/places/${uuidId}`);
    });

    it('should handle numeric string ID', async () => {
      // Arrange
      const numericId = '12345';
      const mockResponse = { data: mockPlace };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      await PlaceService.getById(numericId);

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/places/${numericId}`);
    });

    it('should handle place with special characters in name', async () => {
      // Arrange
      const specialPlace: Place = {
        id: '1',
        name: 'Baño & Aseo (Principal)',
        icon: 'bath-special',
        createdAt: '2023-01-01T00:00:00Z'
      };
      const mockResponse = { data: specialPlace };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.getById('1');

      // Assert
      expect(result).toEqual(specialPlace);
    });

    it('should throw error when place not found', async () => {
      // Arrange
      const axiosError = new AxiosError('Place not found', '404');
      mockAxiosInstance.get.mockRejectedValueOnce(axiosError);

      // Act & Assert
      await expect(PlaceService.getById('999')).rejects.toThrow(axiosError);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching place:',
        expect.any(Error)
      );
    });

    it('should handle server error', async () => {
      // Arrange
      const serverError = new AxiosError('Internal Server Error', '500');
      mockAxiosInstance.get.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(PlaceService.getById('1')).rejects.toThrow(serverError);
    });

    it('should handle network error', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(PlaceService.getById('1')).rejects.toThrow(networkError);
    });
  });

  describe('create', () => {
    const newPlace: Place = {
      name: 'Nueva Habitación',
      icon: 'room',
    };

    const createdPlace: Place = {
      id: '1',
      name: 'Nueva Habitación',
      icon: 'room',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    it('should successfully create a place', async () => {
      // Arrange
      const mockResponse = { data: createdPlace };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.create(newPlace);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/places', newPlace);
      expect(result).toEqual(createdPlace);
    });

    it('should create place with minimal required data', async () => {
      // Arrange
      const minimalPlace: Place = {
        name: 'Test',
        icon: 'test'
      };
      const mockResponse = { data: { ...minimalPlace, id: '1' } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.create(minimalPlace);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/places', minimalPlace);
      expect(result.id).toBeDefined();
      expect(result.name).toBe(minimalPlace.name);
      expect(result.icon).toBe(minimalPlace.icon);
    });

    it('should handle place with special characters', async () => {
      // Arrange
      const specialPlace: Place = {
        name: 'Baño & Aseo (Principal)',
        icon: 'bath-special'
      };
      const mockResponse = { 
        data: { 
          ...specialPlace, 
          id: '1',
          createdAt: '2023-01-01T00:00:00Z'
        } 
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.create(specialPlace);

      // Assert
      expect(result.name).toBe(specialPlace.name);
      expect(result.icon).toBe(specialPlace.icon);
    });

    it('should handle place with long name', async () => {
      // Arrange
      const longNamePlace: Place = {
        name: 'Este es un nombre muy largo para una habitación que podría tener muchos caracteres',
        icon: 'long-room'
      };
      const mockResponse = { 
        data: { 
          ...longNamePlace, 
          id: '1',
          createdAt: '2023-01-01T00:00:00Z'
        } 
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.create(longNamePlace);

      // Assert
      expect(result.name).toBe(longNamePlace.name);
    });

    it('should handle place with unicode characters', async () => {
      // Arrange
      const unicodePlace: Place = {
        name: '🏠 Casa Principal 🏡',
        icon: 'house-emoji'
      };
      const mockResponse = { 
        data: { 
          ...unicodePlace, 
          id: '1',
          createdAt: '2023-01-01T00:00:00Z'
        } 
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.create(unicodePlace);

      // Assert
      expect(result.name).toBe(unicodePlace.name);
    });

    it('should throw error when creation fails due to validation', async () => {
      // Arrange
      const validationError = new AxiosError('Validation failed', '400', undefined, {}, {
        status: 400,
        statusText: 'Bad Request',
        data: { message: 'Name is required' },
        headers: {},
        config: {} as any
      });
      mockAxiosInstance.post.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(PlaceService.create(newPlace)).rejects.toThrow(validationError);
      expect(console.error).toHaveBeenCalledWith(
        'Error creating place:',
        expect.any(Error)
      );
    });

    it('should handle duplicate name error', async () => {
      // Arrange
      const duplicateError = new AxiosError('Duplicate entry', '409');
      mockAxiosInstance.post.mockRejectedValueOnce(duplicateError);

      // Act & Assert
      await expect(PlaceService.create(newPlace)).rejects.toThrow(duplicateError);
    });

    it('should handle server error during creation', async () => {
      // Arrange
      const serverError = new AxiosError('Internal Server Error', '500');
      mockAxiosInstance.post.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(PlaceService.create(newPlace)).rejects.toThrow(serverError);
    });

    it('should handle network timeout during creation', async () => {
      // Arrange
      const timeoutError = new AxiosError('timeout of 5000ms exceeded', 'ECONNABORTED');
      mockAxiosInstance.post.mockRejectedValueOnce(timeoutError);

      // Act & Assert
      await expect(PlaceService.create(newPlace)).rejects.toThrow(timeoutError);
    });
  });

  describe('update', () => {
    const placeId = '1';
    const updatedPlace: Place = {
      id: placeId,
      name: 'Habitación Actualizada',
      icon: 'updated-room',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    };

    it('should successfully update a place', async () => {
      // Arrange
      const mockResponse = { data: updatedPlace };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.update(placeId, updatedPlace);

      // Assert
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/places/${placeId}`, updatedPlace);
      expect(result).toEqual(updatedPlace);
    });

    it('should update place with partial data', async () => {
      // Arrange
      const partialUpdate: Place = {
        name: 'Nuevo Nombre',
        icon: 'new-icon'
      };
      const mockResponse = { 
        data: { 
          ...updatedPlace, 
          ...partialUpdate,
          updatedAt: '2023-01-03T00:00:00Z'
        } 
      };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.update(placeId, partialUpdate);

      // Assert
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/places/${placeId}`, partialUpdate);
      expect(result.name).toBe(partialUpdate.name);
      expect(result.icon).toBe(partialUpdate.icon);
    });

    it('should handle UUID format ID for update', async () => {
      // Arrange
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      const mockResponse = { data: updatedPlace };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      // Act
      await PlaceService.update(uuidId, updatedPlace);

      // Assert
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/places/${uuidId}`, updatedPlace);
    });

    it('should update place with special characters', async () => {
      // Arrange
      const specialUpdate: Place = {
        name: 'Baño & Aseo (Renovado)',
        icon: 'bath-renovated'
      };
      const mockResponse = { 
        data: { 
          ...updatedPlace, 
          ...specialUpdate 
        } 
      };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.update(placeId, specialUpdate);

      // Assert
      expect(result.name).toBe(specialUpdate.name);
    });

    it('should handle updating to empty string name (if allowed)', async () => {
      // Arrange
      const emptyNameUpdate: Place = {
        name: '',
        icon: 'empty'
      };
      const mockResponse = { 
        data: { 
          ...updatedPlace, 
          ...emptyNameUpdate 
        } 
      };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await PlaceService.update(placeId, emptyNameUpdate);

      // Assert
      expect(result.name).toBe('');
    });

    it('should throw error when place not found for update', async () => {
      // Arrange
      const notFoundError = new AxiosError('Place not found', '404');
      mockAxiosInstance.put.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(PlaceService.update('999', updatedPlace)).rejects.toThrow(notFoundError);
      expect(console.error).toHaveBeenCalledWith(
        'Error updating place:',
        expect.any(Error)
      );
    });

    it('should handle validation error during update', async () => {
      // Arrange
      const validationError = new AxiosError('Validation failed', '400');
      mockAxiosInstance.put.mockRejectedValueOnce(validationError);

      // Act & Assert
      await expect(PlaceService.update(placeId, updatedPlace)).rejects.toThrow(validationError);
    });

    it('should handle unauthorized access', async () => {
      // Arrange
      const unauthorizedError = new AxiosError('Unauthorized', '401');
      mockAxiosInstance.put.mockRejectedValueOnce(unauthorizedError);

      // Act & Assert
      await expect(PlaceService.update(placeId, updatedPlace)).rejects.toThrow(unauthorizedError);
    });

    it('should handle server error during update', async () => {
      // Arrange
      const serverError = new AxiosError('Internal Server Error', '500');
      mockAxiosInstance.put.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(PlaceService.update(placeId, updatedPlace)).rejects.toThrow(serverError);
    });
  });

  describe('delete', () => {
    const placeId = '1';

    it('should successfully delete a place', async () => {
      // Arrange
      mockAxiosInstance.delete.mockResolvedValueOnce({});

      // Act
      await PlaceService.delete(placeId);

      // Assert
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/places/${placeId}`);
    });

    it('should handle UUID format ID for deletion', async () => {
      // Arrange
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      mockAxiosInstance.delete.mockResolvedValueOnce({});

      // Act
      await PlaceService.delete(uuidId);

      // Assert
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/places/${uuidId}`);
    });

    it('should handle numeric string ID', async () => {
      // Arrange
      const numericId = '12345';
      mockAxiosInstance.delete.mockResolvedValueOnce({});

      // Act
      await PlaceService.delete(numericId);

      // Assert
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/places/${numericId}`);
    });

    it('should return void on successful deletion', async () => {
      // Arrange
      mockAxiosInstance.delete.mockResolvedValueOnce({});

      // Act
      const result = await PlaceService.delete(placeId);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should throw error when place not found for deletion', async () => {
      // Arrange
      const notFoundError = new AxiosError('Place not found', '404');
      mockAxiosInstance.delete.mockRejectedValueOnce(notFoundError);

      // Act & Assert
      await expect(PlaceService.delete('999')).rejects.toThrow(notFoundError);
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting place:',
        expect.any(Error)
      );
    });

    it('should handle unauthorized deletion', async () => {
      // Arrange
      const unauthorizedError = new AxiosError('Unauthorized', '401');
      mockAxiosInstance.delete.mockRejectedValueOnce(unauthorizedError);

      // Act & Assert
      await expect(PlaceService.delete(placeId)).rejects.toThrow(unauthorizedError);
    });

    it('should handle forbidden deletion (place in use)', async () => {
      // Arrange
      const forbiddenError = new AxiosError('Place is in use', '403');
      mockAxiosInstance.delete.mockRejectedValueOnce(forbiddenError);

      // Act & Assert
      await expect(PlaceService.delete(placeId)).rejects.toThrow(forbiddenError);
    });

    it('should handle conflict during deletion (constraints)', async () => {
      // Arrange
      const conflictError = new AxiosError('Cannot delete place due to constraints', '409');
      mockAxiosInstance.delete.mockRejectedValueOnce(conflictError);

      // Act & Assert
      await expect(PlaceService.delete(placeId)).rejects.toThrow(conflictError);
    });

    it('should handle server error during deletion', async () => {
      // Arrange
      const serverError = new AxiosError('Internal Server Error', '500');
      mockAxiosInstance.delete.mockRejectedValueOnce(serverError);

      // Act & Assert
      await expect(PlaceService.delete(placeId)).rejects.toThrow(serverError);
    });

    it('should handle network error during deletion', async () => {
      // Arrange
      const networkError = new Error('Network Error');
      mockAxiosInstance.delete.mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(PlaceService.delete(placeId)).rejects.toThrow(networkError);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete CRUD lifecycle', async () => {
      // Create
      const newPlace: Place = {
        name: 'Test Room',
        icon: 'test'
      };
      const createdPlace: Place = {
        id: '1',
        ...newPlace,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z'
      };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: createdPlace });

      const created = await PlaceService.create(newPlace);
      expect(created.id).toBe('1');

      // Read
      mockAxiosInstance.get.mockResolvedValueOnce({ data: createdPlace });
      const fetched = await PlaceService.getById('1');
      expect(fetched).toEqual(createdPlace);

      // Update
      const updatedPlace = {
        ...createdPlace,
        name: 'Updated Room',
        updatedAt: '2023-01-02T00:00:00Z'
      };
      mockAxiosInstance.put.mockResolvedValueOnce({ data: updatedPlace });
      const updated = await PlaceService.update('1', updatedPlace);
      expect(updated.name).toBe('Updated Room');

      // Delete
      mockAxiosInstance.delete.mockResolvedValueOnce({});
      await PlaceService.delete('1');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/places/1');
    });

    it('should handle batch operations simulation', async () => {
      // Simulate getting all places
      const places: Place[] = [
        { id: '1', name: 'Room 1', icon: 'room1' },
        { id: '2', name: 'Room 2', icon: 'room2' },
        { id: '3', name: 'Room 3', icon: 'room3' }
      ];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: places });

      const allPlaces = await PlaceService.getAll();
      expect(allPlaces).toHaveLength(3);

      // Simulate updating multiple places
      for (let i = 0; i < places.length; i++) {
        const updatedPlace = {
          ...places[i],
          name: `Updated ${places[i].name}`,
          updatedAt: '2023-01-02T00:00:00Z'
        };
        mockAxiosInstance.put.mockResolvedValueOnce({ data: updatedPlace });
        
        const result = await PlaceService.update(places[i].id!, updatedPlace);
        expect(result.name).toBe(`Updated ${places[i].name}`);
      }
    });

    it('should handle mixed success and failure scenarios', async () => {
      // Success case
      const validPlace: Place = {
        name: 'Valid Room',
        icon: 'valid'
      };
      mockAxiosInstance.post.mockResolvedValueOnce({ 
        data: { ...validPlace, id: '1' } 
      });

      const created = await PlaceService.create(validPlace);
      expect(created.id).toBe('1');

      // Failure case
      const invalidPlace: Place = {
        name: '',
        icon: ''
      };
      const validationError = new AxiosError('Validation failed', '400');
      mockAxiosInstance.post.mockRejectedValueOnce(validationError);

      await expect(PlaceService.create(invalidPlace)).rejects.toThrow(validationError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long place names', async () => {
      const longName = 'a'.repeat(1000);
      const longNamePlace: Place = {
        name: longName,
        icon: 'long'
      };
      const mockResponse = { 
        data: { 
          ...longNamePlace, 
          id: '1' 
        } 
      };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await PlaceService.create(longNamePlace);
      expect(result.name).toBe(longName);
    });

    it('should handle places with null/undefined optional fields', async () => {
      const placeWithNulls: Place = {
        name: 'Test Room',
        icon: 'test',
        createdAt: undefined,
        updatedAt: undefined
      };
      const mockResponse = { data: placeWithNulls };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await PlaceService.create(placeWithNulls);
      expect(result.name).toBe('Test Room');
    });

    it('should handle concurrent requests', async () => {
      // Simulate multiple concurrent getById requests
      const placeIds = ['1', '2', '3'];
      const mockPlaces = placeIds.map(id => ({
        id,
        name: `Place ${id}`,
        icon: `icon${id}`
      }));

      placeIds.forEach((id, index) => {
        mockAxiosInstance.get.mockResolvedValueOnce({ data: mockPlaces[index] });
      });

      const promises = placeIds.map(id => PlaceService.getById(id));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.id).toBe(placeIds[index]);
      });
    });

    it('should handle malformed API responses gracefully', async () => {
      // Response with unexpected structure
      const malformedResponse = { data: null };
      mockAxiosInstance.get.mockResolvedValueOnce(malformedResponse);

      const result = await PlaceService.getById('1');
      expect(result).toBeNull();
    });

    it('should handle API responses with extra fields', async () => {
      const placeWithExtraFields = {
        id: '1',
        name: 'Test Room',
        icon: 'test',
        extraField: 'should be ignored',
        anotherField: 123,
        createdAt: '2023-01-01T00:00:00Z'
      };
      const mockResponse = { data: placeWithExtraFields };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await PlaceService.getById('1');
      expect(result).toEqual(placeWithExtraFields); // Should include extra fields
    });
  });

  describe('Error Boundary Tests', () => {
    it('should handle axios network error without response', async () => {
      const networkError = new Error('Network Error');
      (networkError as any).code = 'NETWORK_ERROR';
      mockAxiosInstance.get.mockRejectedValueOnce(networkError);

      await expect(PlaceService.getAll()).rejects.toThrow('Network Error');
    });

    it('should handle axios timeout error', async () => {
      const timeoutError = new AxiosError('timeout of 5000ms exceeded', 'ECONNABORTED');
      mockAxiosInstance.get.mockRejectedValueOnce(timeoutError);

      await expect(PlaceService.getAll()).rejects.toThrow(timeoutError);
    });

    it('should handle axios request cancellation', async () => {
      const cancelError = new AxiosError('Request canceled', 'ERR_CANCELED');
      mockAxiosInstance.get.mockRejectedValueOnce(cancelError);

      await expect(PlaceService.getAll()).rejects.toThrow(cancelError);
    });

    it('should handle unexpected error types', async () => {
      const stringError = 'String error';
      mockAxiosInstance.get.mockRejectedValueOnce(stringError);

      await expect(PlaceService.getAll()).rejects.toBe(stringError);
    });

    it('should handle promise rejection with no error', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(undefined);

      await expect(PlaceService.getAll()).rejects.toBeUndefined();
    });
  });
});