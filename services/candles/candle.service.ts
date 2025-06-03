import axios from "@/lib/axios";
import { AxiosError } from "axios";
import {
  Candle,
  CreateCandleRequest,
  CreateCandleWithFilesRequest,
  UpdateCandleRequest,
} from "@/types/candle";
import { Container } from "@/types/container";
import { Gift } from "@/types/gift";

// Interfaz para el error del servidor
interface ServerErrorResponse {
  message?: string;
  error?: string;
}

// Función para traducir errores HTTP a mensajes en español
const translateError = (error: AxiosError<ServerErrorResponse>): string => {
  const status = error.response?.status;
  const serverMessage =
    error.response?.data?.message || error.response?.data?.error;

  switch (status) {
    case 400:
      if (serverMessage) {
        if (serverMessage.toLowerCase().includes("name")) {
          return "El nombre no es válido";
        }
        if (serverMessage.toLowerCase().includes("price")) {
          return "El precio no es válido";
        }
        if (serverMessage.toLowerCase().includes("container")) {
          return "El contenedor seleccionado no es válido";
        }
        if (serverMessage.toLowerCase().includes("aroma")) {
          return "El aroma seleccionado no es válido";
        }
        if (serverMessage.toLowerCase().includes("required")) {
          return "Faltan campos obligatorios por completar";
        }
        return serverMessage;
      }
      return "Los datos enviados no son válidos";

    case 401:
      return "No tienes autorización para realizar esta acción";

    case 403:
      return "No tienes permisos para acceder a este recurso";

    case 404:
      return "La vela no fue encontrada";

    case 409:
      if (serverMessage) {
        if (
          serverMessage.toLowerCase().includes("purchased") ||
          serverMessage.toLowerCase().includes("orders") ||
          serverMessage.toLowerCase().includes("cannot delete")
        ) {
          return "No se puede eliminar esta vela porque ya ha sido comprada";
        }
        return serverMessage;
      }
      return "Ya existe una vela con ese nombre";

    case 500:
      return "Error interno del servidor. Intenta de nuevo más tarde";

    case 502:
      return "Problema de conectividad con el servidor";

    case 503:
      return "El servidor no está disponible temporalmente";

    case 504:
      return "El servidor tardó demasiado en responder. Intenta de nuevo";

    default:
      // Errores de red
      if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK") {
        return "Error de conexión. Verifica tu conexión a internet";
      }
      if (error.code === "ECONNABORTED") {
        return "La conexión ha tardado demasiado. Intenta de nuevo";
      }
      if (error.code === "ENOTFOUND") {
        return "No se pudo conectar al servidor. Verifica tu conexión";
      }

      return serverMessage || "Ha ocurrido un error inesperado";
  }
};

export const CandleService = {
  async getAll(): Promise<Candle[]> {
    try {
      const response = await axios.get<Candle[]>("/candles");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async getById(id: string): Promise<Candle> {
    try {
      const response = await axios.get<Candle>(`/candles/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async getByUser(userId: string): Promise<Candle[]> {
    try {
      console.log("Fetching candles for user ID:", userId);
      const response = await axios.get<Candle[]>(`/candles/user/${userId}`);

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async create(candleData: CreateCandleRequest): Promise<Candle> {
    try {
      const response = await axios.post<Candle>("/candles", candleData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async createWithFiles(
    candleData: CreateCandleWithFilesRequest
  ): Promise<Candle> {
    try {
      const formData = new FormData();
      // Agregar los campos básicos
      Object.entries(candleData).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          key !== "audioFile" &&
          key !== "labelFile" &&
          key !== "modelFile"
        ) {
          console.log(`Adding field ${key}:`, value);
          formData.append(key, value.toString());
        }
      });

      // Agregar archivos si existen
      if (candleData.audioFile) {
        console.log("Adding audio file:", {
          name: candleData.audioFile.name,
          size: candleData.audioFile.size,
          type: candleData.audioFile.type,
        });
        formData.append("audioFile", candleData.audioFile);
      } else {
        console.log("No audio file to add");
      }

      if (candleData.labelFile) {
        console.log("Adding label file:", {
          name: candleData.labelFile.name,
          size: candleData.labelFile.size,
          type: candleData.labelFile.type,
        });
        formData.append("labelFile", candleData.labelFile);
      } else {
        console.log("No label file to add");
      }

      if (candleData.modelFile) {
        console.log("Adding model file:", {
          name: candleData.modelFile.name,
          size: candleData.modelFile.size,
          type: candleData.modelFile.type,
        });
        formData.append("modelFile", candleData.modelFile);
      } else {
        console.log("No model file to add");
      }

      // Debug: Print FormData contents
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      const response = await axios.post<Candle>(
        "/candles/with-files",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response received:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error in createWithFiles:", error);
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async update(id: string, candleData: UpdateCandleRequest): Promise<Candle> {
    try {
      const response = await axios.put<Candle>(`/candles/${id}`, candleData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`/candles/${id}`);
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async assignAroma(candleId: string, aromaId: string): Promise<Candle> {
    try {
      const response = await axios.patch<Candle>(
        `/candles/${candleId}/assign-aroma/${aromaId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async assignContainer(
    candleId: string,
    containerId: string
  ): Promise<Candle> {
    try {
      const response = await axios.patch<Candle>(
        `/candles/${candleId}/assign-container/${containerId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async assignUser(candleId: string, userId: string): Promise<Candle> {
    try {
      const response = await axios.patch<Candle>(
        `/candles/${candleId}/assign-user/${userId}`
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async getContainers(): Promise<Container[]> {
    try {
      const response = await axios.get<Container[]>("/candles/containers");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },

  async getGifts(): Promise<Gift[]> {
    try {
      const response = await axios.get<Gift[]>("/candles/gifts");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },
};
