import apiClient from "@/lib/axios";

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  url: string;
  secure_url: string;
  bytes: number;
  duration?: number; // For audio/video files
  created_at: string;
}

export interface AudioUploadResult {
  url: string;
  publicId: string;
  duration?: number;
  format: string;
  size: number;
}

class AudioCloudinaryService {
  // Upload audio file to Cloudinary via backend
  async uploadAudio(
    file: File,
    options?: {
      publicId?: string;
      folder?: string;
      tags?: string[];
    }
  ): Promise<AudioUploadResult> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      if (options?.publicId) {
        formData.append("publicId", options.publicId);
      }

      if (options?.folder) {
        formData.append("folder", options.folder);
      }

      if (options?.tags) {
        formData.append("tags", options.tags.join(","));
      }

      const response = await apiClient.post("/upload/audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const cloudinaryResponse: CloudinaryUploadResponse = response.data;

      return {
        url: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        duration: cloudinaryResponse.duration,
        format: cloudinaryResponse.format,
        size: cloudinaryResponse.bytes,
      };
    } catch (error) {
      console.error("Error uploading audio to Cloudinary:", error);
      throw new Error("Failed to upload audio file");
    }
  }

  // Upload audio blob (from recording) to Cloudinary
  async uploadAudioBlob(
    blob: Blob,
    filename: string,
    options?: {
      publicId?: string;
      folder?: string;
      tags?: string[];
    }
  ): Promise<AudioUploadResult> {
    try {
      // Convert blob to file
      const file = new File([blob], filename, { type: blob.type });
      return await this.uploadAudio(file, options);
    } catch (error) {
      console.error("Error uploading audio blob to Cloudinary:", error);
      throw error;
    }
  }

  // Delete audio from Cloudinary
  async deleteAudio(publicId: string): Promise<void> {
    try {
      await apiClient.delete(`/upload/audio/${publicId}`);
    } catch (error) {
      console.error("Error deleting audio from Cloudinary:", error);
      throw new Error("Failed to delete audio file");
    }
  }

  // Get audio info from Cloudinary
  async getAudioInfo(publicId: string): Promise<CloudinaryUploadResponse> {
    try {
      const response = await apiClient.get(`/upload/audio/info/${publicId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting audio info from Cloudinary:", error);
      throw new Error("Failed to get audio information");
    }
  }

  // Generate audio URL with transformations
  generateAudioUrl(
    publicId: string,
    options?: {
      volume?: number; // -100 to 100
      startOffset?: number; // seconds
      endOffset?: number; // seconds
      format?: "mp3" | "wav" | "ogg";
    }
  ): string {
    const baseUrl = "https://res.cloudinary.com";
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      throw new Error("Cloudinary cloud name not configured");
    }

    let transformations = [];

    if (options?.volume !== undefined) {
      transformations.push(`e_volume:${options.volume}`);
    }

    if (options?.startOffset !== undefined) {
      transformations.push(`so_${options.startOffset}`);
    }

    if (options?.endOffset !== undefined) {
      transformations.push(`eo_${options.endOffset}`);
    }

    const format = options?.format || "mp3";
    const transformationString =
      transformations.length > 0 ? transformations.join(",") + "/" : "";

    return `${baseUrl}/${cloudName}/video/upload/${transformationString}${publicId}.${format}`;
  }
}

export const audioCloudinaryService = new AudioCloudinaryService();
