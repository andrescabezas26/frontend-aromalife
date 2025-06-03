// Spotify Service - Calls backend API for search functionality
import apiClient from "@/lib/axios";
import { AxiosError } from "axios";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  preview_url: string | null;
  image: string | null;
  external_url: string;
}

export interface SpotifySearchResponse {
  tracks: SpotifyTrack[];
}

class SpotifyService {
  /**
   * Search for tracks using our backend API
   */
  async searchTracks(query: string): Promise<SpotifySearchResponse> {
    if (!query || query.trim().length === 0) {
      throw new Error("Query parameter is required");
    }

    try {
      const response = await apiClient.get("/spotify/search", {
        params: {
          query: query.trim(),
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error searching tracks:", error);
      if (error instanceof AxiosError && error.response) {
        throw new Error(
          `Failed to search tracks: ${error.response?.status} ${error.response?.statusText}`
        );
      }
      throw new Error("Failed to search tracks");
    }
  }
}

// Export singleton instance
export const spotifyService = new SpotifyService();
