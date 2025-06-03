import { createRequestWithEntity } from "@/lib/axios";
import { Container } from "@/types/container";

// Crear cliente HTTP específico para contenedores
const containerApi = createRequestWithEntity("contenedor");

export const ContainerService = {
  async getCount(): Promise<number> {
    try {
      const response = await containerApi.get("/containers/count/number");
      return response.data.count;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getAll(): Promise<Container[]> {
    try {
      const response = await containerApi.get("/containers");
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getById(id: string): Promise<Container> {
    try {
      const response = await containerApi.get(`/containers/${id}`);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
  async create(containerData: Omit<Container, "id">): Promise<Container> {
    try {
      const response = await containerApi.post("/containers", containerData);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
  async createWithFile(
    containerData: Omit<Container, "id">,
    file?: File
  ): Promise<Container> {
    try {
      const formData = new FormData();

      // Agregar todos los campos del formulario al FormData
      Object.entries(containerData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === 'object') {
            // Solo agregar objetos que tengan contenido válido
            const jsonString = JSON.stringify(value);
            if (jsonString !== '{}' && jsonString !== 'null') {
              formData.append(key, jsonString);
            }
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Agregar el archivo si existe
      if (file) {
        formData.append("image", file);
      }

      const response = await containerApi.post("/containers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async update(
    id: string,
    containerData: Partial<Container>
  ): Promise<Container> {
    try {
      const response = await containerApi.put(`/containers/${id}`, containerData);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
  async updateWithFile(
    id: string,
    containerData: Partial<Container>,
    file?: File
  ): Promise<Container> {
    try {
      const formData = new FormData();

      // Agregar todos los campos del formulario al FormData
      Object.entries(containerData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (typeof value === 'object') {
            // Solo agregar objetos que tengan contenido válido
            const jsonString = JSON.stringify(value);
            if (jsonString !== '{}' && jsonString !== 'null') {
              formData.append(key, jsonString);
            }
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Agregar el archivo si existe
      if (file) {
        formData.append("image", file);
      }

      const response = await containerApi.put(`/containers/${id}`, formData, {
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
      await containerApi.delete(`/containers/${id}`);
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
};
