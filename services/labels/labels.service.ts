import { createRequestWithEntity } from "@/lib/axios";

export interface Label {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  type: "template" | "ai-generated" | "custom";
  aiPrompt?: string;
  isActive: boolean;
  container?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  // Propiedades para el flujo local (sin backend)
  isLocal?: boolean;
  localFile?: File;
  localPreview?: string;
  localPrompt?: string;
}

export interface GenerateLabelRequest {
  prompt: string;
  name?: string;
}

// Crear cliente HTTP específico para etiquetas
const labelApi = createRequestWithEntity("etiqueta");

class LabelsService {
  async getAllLabels(): Promise<Label[]> {
    try {
      const response = await labelApi.get("/labels");
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }

  async getTemplateLabels(): Promise<Label[]> {
    try {
      const response = await labelApi.get("/labels/templates");
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }

  async getLabelsByContainer(containerId: string): Promise<Label[]> {
    try {
      const response = await labelApi.get(`/labels/container/${containerId}`);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }

  async getLabelById(id: string): Promise<Label> {
    try {
      const response = await labelApi.get(`/labels/${id}`);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }

  async generateLabelWithAI(
    request: GenerateLabelRequest,
    containerId?: string
  ): Promise<Label> {
    try {
      const url = containerId
        ? `/labels/generate-ai?containerId=${containerId}`
        : `/labels/generate-ai`;

      const response = await labelApi.post(url, request);
      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }

  async uploadCustomLabel(
    file: File,
    name: string,
    description?: string,
    containerId?: string
  ): Promise<Label> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      if (description) {
        formData.append("description", description);
      }
      if (containerId) {
        formData.append("containerId", containerId);
      }

      const response = await labelApi.post("/labels/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }

  // Admin CRUD operations
  async createTemplateLabel(
    file: File,
    name: string,
    description?: string
  ): Promise<Label> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      if (description) {
        formData.append("description", description);
      }

      const response = await labelApi.post(
        "/labels/upload-template",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }

  async updateTemplateLabel(
    id: string,
    data: Partial<Label>,
    file?: File
  ): Promise<Label> {
    try {
      if (file) {
        // If there's a file, use FormData with the new endpoint
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", data.name || "");
        if (data.description) {
          formData.append("description", data.description);
        }

        const response = await labelApi.patch(
          `/labels/${id}/with-file`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        return response.data;
      } else {
        // If no file, just update the text data
        const response = await labelApi.patch(`/labels/${id}`, data);
        return response.data;
      }
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }

  async deleteLabel(id: string): Promise<void> {
    try {
      await labelApi.delete(`/labels/${id}`);
    } catch (error) {
      throw error; // El error ya viene traducido desde el interceptor
    }
  }
}

export const labelsService = new LabelsService();
