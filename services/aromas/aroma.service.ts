import { createRequestWithEntity } from "@/lib/axios";
import { Aroma } from "@/types/aroma";

// Crear cliente HTTP específico para aromas
const aromaApi = createRequestWithEntity("aroma");

export const AromaService = {
  async getCount(): Promise<number> {
    try {
      const response = await aromaApi.get("/aromas/count/number");
      return response.data.count;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getAll(): Promise<Aroma[]> {
    try {
      const response = await aromaApi.get("/aromas");
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getAllWithRelations(): Promise<Aroma[]> {
    try {
      const response = await aromaApi.get("/aromas?relations=intendedImpacts");
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getById(id: string): Promise<Aroma> {
    try {
      const response = await aromaApi.get(`/aromas/${id}`);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async create(aromaData: Omit<Aroma, "id">): Promise<Aroma> {
    try {
      const response = await aromaApi.post("/aromas", aromaData);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async update(id: string, aromaData: Partial<Aroma>): Promise<Aroma> {
    try {
      const response = await aromaApi.put(`/aromas/${id}`, aromaData);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await aromaApi.delete(`/aromas/${id}`);
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getAromasByMainOption(
    mainOptionId: string,
    placeId?: string
  ): Promise<Aroma[]> {
    try {
      let url = `/aromas/by-main-option/${mainOptionId}`;
      const params = new URLSearchParams();

      if (placeId) {
        params.append("placeId", placeId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await aromaApi.get(url);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getAromasByIntendedImpact(intendedImpactId: string): Promise<Aroma[]> {
    try {
      const response = await aromaApi.get(
        `/aromas/by-intended-impact/${intendedImpactId}`
      );
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  async getAromasByCompleteTestResults(
    intendedImpactId: string,
    mainOptionId?: string,
    placeId?: string
  ): Promise<Aroma[]> {
    try {
      let url = `/aromas/by-test-results/${intendedImpactId}`;
      const params = new URLSearchParams();

      if (mainOptionId) {
        params.append("mainOptionId", mainOptionId);
      }
      if (placeId) {
        params.append("placeId", placeId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await aromaApi.get(url);
      console.log("getAromasByCompleteTestResults response", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching aromas by complete test results:", error);
      throw error;
    }
  },

  // Asignar un intended impact a un aroma (crear nueva relación)
  async assignIntendedImpact(aromaId: string, intendedImpactId: string): Promise<Aroma> {
    try {
      const response = await aromaApi.patch(`/aromas/${aromaId}/assign-intended-impact/${intendedImpactId}`);
      return response.data;
    } catch (error) {
      console.error("Error assigning intended impact to aroma: alpin", error);
      throw error; // El error ya viene traducido desde el interceptor
    }
  },

  // Remover un intended impact de un aroma (eliminar relación existente)
  async removeIntendedImpact(aromaId: string, intendedImpactId: string): Promise<Aroma> {
    try {
      const response = await aromaApi.patch(`/aromas/${aromaId}/remove-intended-impact/${intendedImpactId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing intended impact from aroma:", error);
      throw error; // El error ya viene traducido desde el interceptor
    }
  },
};
