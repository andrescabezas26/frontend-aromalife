import { createRequestWithEntity } from '@/lib/axios';
import { User } from '@/types/user';

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
let UserService: typeof import('@/services/users/user.service').UserService;

beforeAll(() => {
  (require('@/lib/axios').createRequestWithEntity as jest.Mock).mockReturnValue(mockAxiosInstance);
  UserService = require('@/services/users/user.service').UserService;
});

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all users successfully', async () => {
      const mockUsers: User[] = [        {
          id: '1',
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          roles: ['USER'],
          isActive: true,
          phoneCountryCode: '+1',
          phone: '1234567890',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          profilePicture: undefined,
          imageUrl: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockUsers });

      const result = await UserService.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/users');
      expect(result).toEqual(mockUsers);
    });

    it('should throw error when API fails', async () => {
      const error = new Error('API Error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(UserService.getAll()).rejects.toThrow('API Error');
    });
  });

  describe('getCount', () => {
    it('should fetch user count successfully', async () => {
      const mockCount = { count: 5 };
      mockAxiosInstance.get.mockResolvedValue({ data: mockCount });

      const result = await UserService.getCount();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/users/count/number');
      expect(result).toBe(5);
    });

    it('should handle error when fetching count fails', async () => {
      const error = new Error('Count fetch failed');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(UserService.getCount()).rejects.toThrow('Count fetch failed');
    });
  });

  describe('getById', () => {
    it('should fetch user by ID successfully', async () => {
      const mockUser: User = {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        roles: ['USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockUser });

      const result = await UserService.getById('1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/users/1');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      const error = new Error('User not found');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(UserService.getById('999')).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userData = { name: 'Jane', lastName: 'Smith' };
      const mockUpdatedUser: User = {
        id: '1',
        name: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        roles: ['USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAxiosInstance.put.mockResolvedValue({ data: mockUpdatedUser });

      const result = await UserService.update('1', userData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/auth/users/1', userData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw error when update fails', async () => {
      const error = new Error('Update failed');
      mockAxiosInstance.put.mockRejectedValue(error);

      await expect(UserService.update('1', { name: 'Jane' })).rejects.toThrow('Update failed');
    });
  });

  describe('updateRoles', () => {
    it('should update user roles successfully', async () => {
      const roles = ['ADMIN', 'USER'];
      const mockUpdatedUser: User = {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        roles: ['ADMIN', 'USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAxiosInstance.put.mockResolvedValue({ data: mockUpdatedUser });

      const result = await UserService.updateRoles('1', roles);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/auth/users/1/roles', { roles });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});

      await UserService.delete('1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/auth/users/1/remove');
    });

    it('should throw error when delete fails', async () => {
      const error = new Error('Delete failed');
      mockAxiosInstance.delete.mockRejectedValue(error);

      await expect(UserService.delete('1')).rejects.toThrow('Delete failed');
    });
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture successfully', async () => {
      const file = new File([''], 'profile.jpg', { type: 'image/jpeg' });
      const mockUpdatedUser: User = {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        roles: ['USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: 'http://example.com/profile.jpg',
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAxiosInstance.put.mockResolvedValue({ data: mockUpdatedUser });

      const result = await UserService.uploadProfilePicture('1', file);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        '/auth/users/1/profile-picture',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('removeProfilePicture', () => {
    it('should remove profile picture successfully', async () => {
      const mockUpdatedUser: User = {
        id: '1',
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        roles: ['USER'],
        isActive: true,
        phoneCountryCode: '+1',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        profilePicture: undefined,
        imageUrl: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAxiosInstance.delete.mockResolvedValue({ data: mockUpdatedUser });

      const result = await UserService.removeProfilePicture('1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/auth/users/1/profile-picture');
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('getAdminPhone', () => {
    it('should fetch admin phone successfully', async () => {
      const mockPhoneData = {
        phoneCountryCode: '+1',
        phone: '1234567890',
        fullPhone: '+11234567890',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockPhoneData });

      const result = await UserService.getAdminPhone();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/admin/phone');
      expect(result).toEqual(mockPhoneData);
    });
  });
});
