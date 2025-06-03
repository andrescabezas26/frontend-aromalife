import { create } from "zustand";
import { UserService } from "@/services/users/user.service";
import { User } from "@/types/user";
import { useAuthStore } from "@/stores/auth-store";

interface AdminUsersState {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  updateUserRoles: (id: string, roles: string[]) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

interface UserProfileState {
  user: User | null;
  loading: boolean;
  error: string | null;
  uploadingImage: boolean;
  fetchUser: (id: string) => Promise<void>;
  updateProfile: (id: string, userData: Partial<User>) => Promise<void>;
  uploadProfilePicture: (id: string, file: File) => Promise<void>;
  removeProfilePicture: (id: string) => Promise<void>;
  clearUser: () => void;
}

export const useAdminUsersStore = create<AdminUsersState>((set) => ({
  users: [],
  loading: false,
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const users = await UserService.getAll();
      set({ users, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
  updateUser: async (id: string, userData: Partial<User>) => {
    set({ loading: true });
    try {
      const updatedUser = await UserService.update(id, userData);
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? updatedUser : user)),
        loading: false,
      }));
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
  updateUserRoles: async (id: string, roles: string[]) => {
    set({ loading: true });
    try {
      const updatedUser = await UserService.updateRoles(id, roles);
      set((state) => ({
        users: state.users.map((user) => (user.id === id ? updatedUser : user)),
        loading: false,
      }));
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
  deleteUser: async (id: string) => {
    set({ loading: true });
    try {
      await UserService.delete(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        loading: false,
      }));
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },
}));

export const useUserProfileStore = create<UserProfileState>((set) => ({
  user: null,
  loading: false,
  error: null,
  uploadingImage: false,
  fetchUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const user = await UserService.getById(id);
      set({ user, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  updateProfile: async (id: string, userData: Partial<User>) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await UserService.update(id, userData);
      set({ user: updatedUser, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  uploadProfilePicture: async (id: string, file: File) => {
    set({ uploadingImage: true, error: null });
    try {
      const updatedUser = await UserService.uploadProfilePicture(id, file);
      set({ user: updatedUser, uploadingImage: false });
      
      // Actualizar también el store de autenticación si es el usuario actual
      const { user: currentAuthUser } = useAuthStore.getState();
      if (currentAuthUser && currentAuthUser.id === id) {
        useAuthStore.getState().updateProfilePicture(updatedUser.profilePicture || '');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al subir la imagen";
      set({ error: errorMessage, uploadingImage: false });
      throw error;
    }
  },
  removeProfilePicture: async (id: string) => {
    set({ uploadingImage: true, error: null });
    try {
      const updatedUser = await UserService.removeProfilePicture(id);
      set({ user: updatedUser, uploadingImage: false });
      
      // Actualizar también el store de autenticación si es el usuario actual
      const { user: currentAuthUser } = useAuthStore.getState();
      if (currentAuthUser && currentAuthUser.id === id) {
        useAuthStore.getState().updateProfilePicture('');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar la imagen";
      set({ error: errorMessage, uploadingImage: false });
      throw error;
    }
  },
  clearUser: () => {
    set({ user: null, error: null, loading: false, uploadingImage: false });
  },
}));
