import { createRequestWithEntity } from "@/lib/axios";
import { User } from "@/types/user";

// Crear cliente HTTP específico para usuarios
const userApi = createRequestWithEntity("usuario");

export const UserService = {
  async getAll(): Promise<User[]> {
    try {
      const response = await userApi.get("/auth/users");
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getCount(): Promise<number> {
    try {
      const response = await userApi.get("/auth/users/count/number");
      console.log("User count response:", response.data);
      return response.data.count;
    } catch (error) {
      console.error("Error fetching user count:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<User> {
    try {
      const response = await userApi.get(`/auth/users/${id}`);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getAdminPhone(): Promise<{ phoneCountryCode: string; phone: string; fullPhone: string }> {
    try {
      const response = await userApi.get("/auth/admin/phone");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await userApi.put(`/auth/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async updateRoles(id: string, roles: string[]): Promise<User> {
    try {
      const response = await userApi.put(`/auth/users/${id}/roles`, { roles });
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
  async delete(id: string): Promise<void> {
    try {
      await userApi.delete(`/auth/users/${id}/remove`);
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
  async uploadProfilePicture(id: string, file: File): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await userApi.put(
        `/auth/users/${id}/profile-picture`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
  async removeProfilePicture(id: string): Promise<User> {
    try {
      const response = await userApi.delete(`/auth/users/${id}/profile-picture`);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
};
