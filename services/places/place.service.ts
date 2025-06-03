import { Place } from "@/types/place"
import { createRequestWithEntity } from "@/lib/axios"

// Crear cliente HTTP específico para places
const placeApi = createRequestWithEntity("lugar")

export const PlaceService = {
  async getCount(): Promise<number> {
    try {
      const response = await placeApi.get("/places/count/number")
      return response.data.count
    } catch (error) {
      console.error("Error al obtener el conteo de lugares:", error)
      throw error
    }
  },

  // Obtener todos los places
  async getAll(): Promise<Place[]> {
    try {
      const response = await placeApi.get("/places")
      return response.data
    } catch (error) {
      console.error("Error fetching places:", error)
      throw error
    }
  },

  // Obtener place por ID
  async getById(id: string): Promise<Place> {
    try {
      const response = await placeApi.get(`/places/${id}`)
      return response.data
    } catch (error) {
      console.error("Error fetching place:", error)
      throw error
    }
  },

  // Crear place
  async create(place: Place): Promise<Place> {
    try {
      const response = await placeApi.post("/places", place)
      return response.data
    } catch (error) {
      console.error("Error creating place:", error)
      throw error
    }
  },

  // Actualizar place
  async update(id: string, place: Place): Promise<Place> {
    try {
      const response = await placeApi.put(`/places/${id}`, place)
      return response.data
    } catch (error) {
      console.error("Error updating place:", error)
      throw error
    }
  },

  // Eliminar place
  async delete(id: string): Promise<void> {
    try {
      await placeApi.delete(`/places/${id}`)
    } catch (error) {
      console.error("Error deleting place:", error)
      throw error
    }
  }
}
