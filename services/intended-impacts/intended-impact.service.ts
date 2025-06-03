import { createRequestWithEntity } from "@/lib/axios";
import { IntendedImpact, IntendedImpactTableView } from "@/types/intended-impact";

// Crear cliente HTTP específico para impactos
const intendedImpactApi = createRequestWithEntity("impacto ");

export const IntendedImpactService = {
  async getCount(): Promise<number> {
    try {
      const response = await intendedImpactApi.get("/intended-impacts/count/number");
      return response.data.count;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  // Obtener todos los impactos
  async getAll(): Promise<IntendedImpact[]> {
    try {
      const response = await intendedImpactApi.get("/intended-impacts");
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getAllWithMainOptions(): Promise<IntendedImpactTableView[]> {
    try {
      const response = await intendedImpactApi.get('/intended-impacts/with-main-option');
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  // Obtener un impacto  por ID
  async getById(id: string): Promise<IntendedImpact> {
    try {
      const response = await intendedImpactApi.get(`/intended-impacts/${id}?relations=mainOption`);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  // Crear un nuevo impacto 
  async create(data: Omit<IntendedImpact, "id" | "createdAt" | "updatedAt">): Promise<IntendedImpact> {
    try {
      // Preparar datos para el backend - solo enviar los campos necesarios
      const backendData = {
        name: data.name,
        icon: data.icon,
        description: data.description,
        mainOptionId: data.mainOptionId
      };
      
      const response = await intendedImpactApi.post("/intended-impacts", backendData);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  // Actualizar un impacto 
  async update(id: string, data: Partial<IntendedImpact>): Promise<IntendedImpact> {
    try {
      // Preparar datos para el backend - solo enviar los campos necesarios
      const backendData: any = {};
      if (data.name !== undefined) backendData.name = data.name;
      if (data.icon !== undefined) backendData.icon = data.icon;
      if (data.description !== undefined) backendData.description = data.description;
      if (data.mainOptionId !== undefined) backendData.mainOptionId = data.mainOptionId;
      
      const response = await intendedImpactApi.put(`/intended-impacts/${id}`, backendData);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  // Eliminar un impacto 
  async delete(id: string): Promise<void> {
    try {
      await intendedImpactApi.delete(`/intended-impacts/${id}`);
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  // Obtener impactos por opción principal
  async getByMainOption(mainOptionId: string, placeId?: string): Promise<IntendedImpact[]> {
    try {
      const params = placeId ? { placeId } : {};
      const response = await intendedImpactApi.get(
        `/intended-impacts/by-main-option/${mainOptionId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }
};
