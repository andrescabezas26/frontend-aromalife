import { useAdminUsersStore, useUserProfileStore } from '@/stores/users-store';
import { UserService } from '@/services/users/user.service';
import { useAuthStore } from '@/stores/auth-store';
import { User } from '@/types/user';

// Mock del UserService
jest.mock('@/services/users/user.service', () => ({
  UserService: {
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    updateRoles: jest.fn(),
    delete: jest.fn(),
    uploadProfilePicture: jest.fn(),
    removeProfilePicture: jest.fn(),
  },
}));

// Mock del AuthStore
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockAuthStore = useAuthStore as jest.Mocked<typeof useAuthStore>;

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

describe('AdminUsersStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAdminUsersStore.setState({ users: [], loading: false });
  });

  describe('fetchUsers', () => {
    it('should fetch and set users successfully', async () => {
      const mockUsers = [mockUser];
      mockUserService.getAll.mockResolvedValue(mockUsers);

      await useAdminUsersStore.getState().fetchUsers();

      const state = useAdminUsersStore.getState();
      expect(state.users).toEqual(mockUsers);
      expect(state.loading).toBe(false);
      expect(mockUserService.getAll).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch users error', async () => {
      const error = new Error('Fetch failed');
      mockUserService.getAll.mockRejectedValue(error);

      await expect(useAdminUsersStore.getState().fetchUsers()).rejects.toThrow('Fetch failed');

      const state = useAdminUsersStore.getState();
      expect(state.loading).toBe(false);
    });

    it('should set loading to true during fetch', async () => {
      mockUserService.getAll.mockImplementation(() => {
        const state = useAdminUsersStore.getState();
        expect(state.loading).toBe(true);
        return Promise.resolve([]);
      });

      await useAdminUsersStore.getState().fetchUsers();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const initialUsers = [mockUser];
      useAdminUsersStore.setState({ users: initialUsers });

      const userData = { name: 'Jane' };
      const updatedUser = { ...mockUser, name: 'Jane' };
      mockUserService.update.mockResolvedValue(updatedUser);

      await useAdminUsersStore.getState().updateUser('1', userData);

      const state = useAdminUsersStore.getState();
      expect(state.users[0].name).toBe('Jane');
      expect(state.loading).toBe(false);
      expect(mockUserService.update).toHaveBeenCalledWith('1', userData);
    });

    it('should handle update user error', async () => {
      const error = new Error('Update failed');
      mockUserService.update.mockRejectedValue(error);

      await expect(useAdminUsersStore.getState().updateUser('1', {})).rejects.toThrow('Update failed');

      const state = useAdminUsersStore.getState();
      expect(state.loading).toBe(false);
    });
  });

  describe('updateUserRoles', () => {
    it('should update user roles successfully', async () => {
      const initialUsers = [mockUser];
      useAdminUsersStore.setState({ users: initialUsers });

      const roles = ['ADMIN', 'USER'];
      const updatedUser = { ...mockUser, roles };
      mockUserService.updateRoles.mockResolvedValue(updatedUser);

      await useAdminUsersStore.getState().updateUserRoles('1', roles);

      const state = useAdminUsersStore.getState();
      expect(state.users[0].roles).toEqual(roles);
      expect(mockUserService.updateRoles).toHaveBeenCalledWith('1', roles);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const initialUsers = [mockUser, { ...mockUser, id: '2' }];
      useAdminUsersStore.setState({ users: initialUsers });

      mockUserService.delete.mockResolvedValue();

      await useAdminUsersStore.getState().deleteUser('1');

      const state = useAdminUsersStore.getState();
      expect(state.users).toHaveLength(1);
      expect(state.users[0].id).toBe('2');
      expect(mockUserService.delete).toHaveBeenCalledWith('1');
    });

    it('should handle delete user error', async () => {
      const error = new Error('Delete failed');
      mockUserService.delete.mockRejectedValue(error);

      await expect(useAdminUsersStore.getState().deleteUser('1')).rejects.toThrow('Delete failed');

      const state = useAdminUsersStore.getState();
      expect(state.loading).toBe(false);
    });
  });
});

describe('UserProfileStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUserProfileStore.setState({
      user: null,
      loading: false,
      error: null,
      uploadingImage: false,
    });
  });

  describe('fetchUser', () => {
    it('should fetch user successfully', async () => {
      mockUserService.getById.mockResolvedValue(mockUser);

      await useUserProfileStore.getState().fetchUser('1');

      const state = useUserProfileStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockUserService.getById).toHaveBeenCalledWith('1');
    });

    it('should handle fetch user error', async () => {
      const error = new Error('User not found');
      mockUserService.getById.mockRejectedValue(error);

      await expect(useUserProfileStore.getState().fetchUser('1')).rejects.toThrow('User not found');

      const state = useUserProfileStore.getState();
      expect(state.error).toBe('User not found');
      expect(state.loading).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userData = { name: 'Jane' };
      const updatedUser = { ...mockUser, name: 'Jane' };
      mockUserService.update.mockResolvedValue(updatedUser);

      await useUserProfileStore.getState().updateProfile('1', userData);

      const state = useUserProfileStore.getState();
      expect(state.user).toEqual(updatedUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle update profile error', async () => {
      const error = new Error('Update failed');
      mockUserService.update.mockRejectedValue(error);

      await expect(useUserProfileStore.getState().updateProfile('1', {})).rejects.toThrow('Update failed');

      const state = useUserProfileStore.getState();
      expect(state.error).toBe('Update failed');
      expect(state.loading).toBe(false);
    });
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture successfully', async () => {
      const file = new File([''], 'profile.jpg', { type: 'image/jpeg' });
      const updatedUser = { ...mockUser, profilePicture: 'http://example.com/profile.jpg' };
      
      mockUserService.uploadProfilePicture.mockResolvedValue(updatedUser);
      mockAuthStore.getState.mockReturnValue({
        user: {
          id: '1',
          name: '',
          email: '',
          roles: []
        },
        updateProfilePicture: jest.fn(),
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: function (email: string, password: string): Promise<void> {
          throw new Error('Function not implemented.');
        },
        logout: function (): void {
          throw new Error('Function not implemented.');
        },
        clearSession: function (): void {
          throw new Error('Function not implemented.');
        },
        setUserFromToken: function (token: string): void {
          throw new Error('Function not implemented.');
        },
        initializeAuth: function (): void {
          throw new Error('Function not implemented.');
        },
        initializeUserCart: function (userId: string): Promise<void> {
          throw new Error('Function not implemented.');
        }
      });

      await useUserProfileStore.getState().uploadProfilePicture('1', file);

      const state = useUserProfileStore.getState();
      expect(state.user).toEqual(updatedUser);
      expect(state.uploadingImage).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle upload error', async () => {
      const file = new File([''], 'profile.jpg', { type: 'image/jpeg' });
      const error = new Error('Upload failed');
      mockUserService.uploadProfilePicture.mockRejectedValue(error);

      await expect(useUserProfileStore.getState().uploadProfilePicture('1', file)).rejects.toThrow('Upload failed');

      const state = useUserProfileStore.getState();
      expect(state.error).toBe('Upload failed');
      expect(state.uploadingImage).toBe(false);
    });
  });

  describe('removeProfilePicture', () => {
    it('should remove profile picture successfully', async () => {
      const updatedUser = { ...mockUser, profilePicture: undefined };
      
      mockUserService.removeProfilePicture.mockResolvedValue(updatedUser);
      mockAuthStore.getState.mockReturnValue({
        user: {
          id: '1',
          name: '',
          email: '',
          roles: []
        },
        updateProfilePicture: jest.fn(),
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: function (email: string, password: string): Promise<void> {
          throw new Error('Function not implemented.');
        },
        logout: function (): void {
          throw new Error('Function not implemented.');
        },
        clearSession: function (): void {
          throw new Error('Function not implemented.');
        },
        setUserFromToken: function (token: string): void {
          throw new Error('Function not implemented.');
        },
        initializeAuth: function (): void {
          throw new Error('Function not implemented.');
        },
        initializeUserCart: function (userId: string): Promise<void> {
          throw new Error('Function not implemented.');
        }
      });

      await useUserProfileStore.getState().removeProfilePicture('1');

      const state = useUserProfileStore.getState();
      expect(state.user).toEqual(updatedUser);
      expect(state.uploadingImage).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('clearUser', () => {
    it('should clear user state', () => {
      useUserProfileStore.setState({
        user: mockUser,
        loading: true,
        error: 'Some error',
        uploadingImage: true,
      });

      useUserProfileStore.getState().clearUser();

      const state = useUserProfileStore.getState();
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.uploadingImage).toBe(false);
    });
  });
});
