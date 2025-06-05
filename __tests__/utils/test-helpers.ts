import { User } from '@/types/user';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
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
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02'),
  ...overrides,
});

export const createMockUsers = (count: number = 3): User[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      id: `${index + 1}`,
      name: `User${index + 1}`,
      email: `user${index + 1}@example.com`,
      roles: index === 0 ? ['ADMIN'] : ['USER'],
    })
  );
};

export const mockApiResponse = <T>(data: T, delay: number = 0): Promise<{ data: T }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

export const mockApiError = (message: string, delay: number = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, delay);
  });
};

// Tipos para mocks de stores
export interface MockStoreState {
  loading?: boolean;
  error?: string | null;
  users?: User[];
  user?: User | null;
  uploadingImage?: boolean;
}

export const createMockStoreActions = () => ({
  fetchUsers: jest.fn(),
  updateUser: jest.fn(),
  updateUserRoles: jest.fn(),
  deleteUser: jest.fn(),
  fetchUser: jest.fn(),
  updateProfile: jest.fn(),
  uploadProfilePicture: jest.fn(),
  removeProfilePicture: jest.fn(),
  clearUser: jest.fn(),
});

// Helper para crear mock de Zustand store
export const createMockZustandStore = <T>(initialState: T, actions: any = {}) => {
  let state = { ...initialState };
  
  const getState = () => state;
  const setState = (newState: Partial<T> | ((state: T) => Partial<T>)) => {
    if (typeof newState === 'function') {
      state = { ...state, ...newState(state) };
    } else {
      state = { ...state, ...newState };
    }
  };

  return {
    getState,
    setState,
    ...actions,
  };
};

// Mock data para diferentes escenarios
export const mockUserScenarios = {
  activeUser: createMockUser({ isActive: true }),
  inactiveUser: createMockUser({ isActive: false }),
  adminUser: createMockUser({ roles: ['ADMIN', 'USER'] }),
  userWithProfilePicture: createMockUser({ 
    profilePicture: 'http://example.com/profile.jpg' 
  }),
  userWithImageUrl: createMockUser({ 
    imageUrl: 'http://example.com/image.jpg' 
  }),
  userWithMinimalData: createMockUser({
    address: '',
    city: '',
    state: '',
    country: '',
    profilePicture: undefined,
    imageUrl: undefined,
  }),
};
