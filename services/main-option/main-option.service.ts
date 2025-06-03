import { createRequestWithEntity } from "@/lib/axios";
import { MainOption } from "@/types/main-option";

// Crear cliente HTTP específico para opciones principales
const mainOptionApi = createRequestWithEntity("opción principal");

export const MainOptionService = {
  async getCount(): Promise<number> {
    try {
      const response = await mainOptionApi.get("/main-options/count/number");
      return response.data.count;
    } catch (error) {
      console.error("Error al obtener el conteo de opciones principales:", error);
      throw error;
    }
  },

  async getAll(): Promise<MainOption[]> {
    try {
      const response = await mainOptionApi.get("/main-options");
      return response.data;
    } catch (error) {
      console.error("Error al obtener las opciones principales:", error);
      throw error;
    }
  },

  async getById(id: string): Promise<MainOption> {
    try {
      const response = await mainOptionApi.get(`/main-options/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error al obtener la opción principal con id ${id}:`,
        error
      );
      throw error;
    }
  },

  async create(
    data: Omit<MainOption, "id" | "createdAt" | "updatedAt">
  ): Promise<MainOption> {
    try {
      const response = await mainOptionApi.post("/main-options", data);
      return response.data;
    } catch (error) {
      console.error("Error al crear la opción principal:", error);
      throw error;
    }
  },

  async update(id: string, data: Partial<MainOption>): Promise<MainOption> {
    try {
      const response = await mainOptionApi.put(`/main-options/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(
        `Error al actualizar la opción principal con id ${id}:`,
        error
      );
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await mainOptionApi.delete(`/main-options/${id}`);
    } catch (error) {
      console.error(
        `Error al eliminar la opción principal con id ${id}:`,
        error
      );
      throw error;
    }
  },
};
