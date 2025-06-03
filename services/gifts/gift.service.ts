import { createRequestWithEntity } from "@/lib/axios";
import { Gift } from "@/types/gift";

// Crear cliente HTTP específico para regalos
const giftApi = createRequestWithEntity("regalo");

export const GiftService = {
  async getAll(): Promise<Gift[]> {
    try {
      const response = await giftApi.get("/gifts");
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getById(id: string): Promise<Gift> {
    try {
      const response = await giftApi.get(`/gifts/${id}`);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async create(giftData: Omit<Gift, "id">): Promise<Gift> {
    try {
      const response = await giftApi.post("/gifts", giftData);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async createWithFile(
    giftData: Omit<Gift, "id">,
    file?: File
  ): Promise<Gift> {
    try {
      const formData = new FormData();

      // Agregar todos los campos del formulario al FormData
      Object.entries(giftData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Manejar el precio como número
          if (key === 'price') {
            formData.append(key, Number(value).toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Agregar el archivo si existe
      if (file) {
        formData.append("image", file);
      }

      // Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value} (type: ${typeof value})`);
      }

      const response = await giftApi.post("/gifts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async update(id: string, giftData: Partial<Gift>): Promise<Gift> {
    try {
      const response = await giftApi.put(`/gifts/${id}`, giftData);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async updateWithFile(
    id: string,
    giftData: Partial<Gift>,
    file?: File
  ): Promise<Gift> {
    try {
      const formData = new FormData();

      // Agregar todos los campos del formulario al FormData
      Object.entries(giftData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          // Manejar el precio como número
          if (key === 'price') {
            formData.append(key, Number(value).toString());
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Agregar el archivo si existe
      if (file) {
        formData.append("image", file);
      }

      const response = await giftApi.put(`/gifts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await giftApi.delete(`/gifts/${id}`);
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
};