// filepath: c:\Universidad\Semestre VII\Compunet III\AromaLife\frontend-aromalife-adn\__tests__\services\spotify\spotify.service.test.ts
import { AxiosError } from 'axios';
import apiClient from '@/lib/axios';
import { spotifyService, SpotifyTrack, SpotifySearchResponse } from '@/services/spotify/spotify.service';

// Mock del módulo axios
jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('SpotifyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Mock data
  const mockSpotifyTrack: SpotifyTrack = {
    id: '4iV5W9uYEdYUVa79Axb7Rh',
    name: 'Never Gonna Give You Up',
    artists: ['Rick Astley'],
    preview_url: 'https://p.scdn.co/mp3-preview/1234567890',
    image: 'https://i.scdn.co/image/ab67616d0000b273abc123',
    external_url: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh'
  };

  const mockSearchResponse: SpotifySearchResponse = {
    tracks: [mockSpotifyTrack]
  };

  describe('searchTracks', () => {
    it('should search tracks successfully', async () => {
      const query = 'Never Gonna Give You Up';
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      const result = await spotifyService.searchTracks(query);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', {
        params: {
          query: query.trim(),
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockSearchResponse);
    });

    it('should trim whitespace from query', async () => {
      const query = '  Rick Astley  ';
      const trimmedQuery = 'Rick Astley';
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks(query);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', {
        params: {
          query: trimmedQuery,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle empty query string', async () => {
      await expect(spotifyService.searchTracks('')).rejects.toThrow('Query parameter is required');
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only query string', async () => {
      await expect(spotifyService.searchTracks('   ')).rejects.toThrow('Query parameter is required');
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle null query', async () => {
      await expect(spotifyService.searchTracks(null as any)).rejects.toThrow('Query parameter is required');
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle undefined query', async () => {
      await expect(spotifyService.searchTracks(undefined as any)).rejects.toThrow('Query parameter is required');
      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should return multiple tracks', async () => {
      const multipleTracksResponse: SpotifySearchResponse = {
        tracks: [
          mockSpotifyTrack,
          {
            id: '2WfaOiMkCvy7F5fcp2zZ8L',
            name: 'Together Forever',
            artists: ['Rick Astley'],
            preview_url: 'https://p.scdn.co/mp3-preview/0987654321',
            image: 'https://i.scdn.co/image/ab67616d0000b273def456',
            external_url: 'https://open.spotify.com/track/2WfaOiMkCvy7F5fcp2zZ8L'
          }
        ]
      };
      mockApiClient.get.mockResolvedValue({ data: multipleTracksResponse });

      const result = await spotifyService.searchTracks('Rick Astley');

      expect(result.tracks).toHaveLength(2);
      expect(result.tracks[0].name).toBe('Never Gonna Give You Up');
      expect(result.tracks[1].name).toBe('Together Forever');
    });

    it('should handle empty search results', async () => {
      const emptyResponse: SpotifySearchResponse = {
        tracks: []
      };
      mockApiClient.get.mockResolvedValue({ data: emptyResponse });

      const result = await spotifyService.searchTracks('nonexistent song');

      expect(result.tracks).toHaveLength(0);
      expect(result).toEqual(emptyResponse);
    });

    it('should handle tracks without preview URLs', async () => {
      const trackWithoutPreview: SpotifyTrack = {
        ...mockSpotifyTrack,
        preview_url: null
      };
      const responseWithoutPreview: SpotifySearchResponse = {
        tracks: [trackWithoutPreview]
      };
      mockApiClient.get.mockResolvedValue({ data: responseWithoutPreview });

      const result = await spotifyService.searchTracks('song without preview');

      expect(result.tracks[0].preview_url).toBeNull();
    });

    it('should handle tracks without images', async () => {
      const trackWithoutImage: SpotifyTrack = {
        ...mockSpotifyTrack,
        image: null
      };
      const responseWithoutImage: SpotifySearchResponse = {
        tracks: [trackWithoutImage]
      };
      mockApiClient.get.mockResolvedValue({ data: responseWithoutImage });

      const result = await spotifyService.searchTracks('song without image');

      expect(result.tracks[0].image).toBeNull();
    });

    it('should handle tracks with multiple artists', async () => {
      const trackWithMultipleArtists: SpotifyTrack = {
        ...mockSpotifyTrack,
        artists: ['Artist 1', 'Artist 2', 'Artist 3']
      };
      const responseWithMultipleArtists: SpotifySearchResponse = {
        tracks: [trackWithMultipleArtists]
      };
      mockApiClient.get.mockResolvedValue({ data: responseWithMultipleArtists });

      const result = await spotifyService.searchTracks('collaboration song');

      expect(result.tracks[0].artists).toHaveLength(3);
      expect(result.tracks[0].artists).toEqual(['Artist 1', 'Artist 2', 'Artist 3']);
    });

    it('should handle special characters in query', async () => {
      const specialQuery = 'Señorita & Love (Remix) - Artist #1';
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks(specialQuery);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', {
        params: {
          query: specialQuery,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle very long queries', async () => {
      const longQuery = 'A'.repeat(1000);
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks(longQuery);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', {
        params: {
          query: longQuery,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP 400 bad request error', async () => {
      const error = new AxiosError('Bad Request', '400');
      error.response = {
        status: 400,
        statusText: 'Bad Request',
        data: {},
        headers: {},
        config: {} as any
      };
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks: 400 Bad Request'
      );
      expect(console.error).toHaveBeenCalledWith('Error searching tracks:', error);
    });

    it('should handle HTTP 401 unauthorized error', async () => {
      const error = new AxiosError('Unauthorized', '401');
      error.response = {
        status: 401,
        statusText: 'Unauthorized',
        data: {},
        headers: {},
        config: {} as any
      };
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks: 401 Unauthorized'
      );
    });

    it('should handle HTTP 403 forbidden error', async () => {
      const error = new AxiosError('Forbidden', '403');
      error.response = {
        status: 403,
        statusText: 'Forbidden',
        data: {},
        headers: {},
        config: {} as any
      };
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks: 403 Forbidden'
      );
    });

    it('should handle HTTP 404 not found error', async () => {
      const error = new AxiosError('Not Found', '404');
      error.response = {
        status: 404,
        statusText: 'Not Found',
        data: {},
        headers: {},
        config: {} as any
      };
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks: 404 Not Found'
      );
    });

    it('should handle HTTP 429 rate limit error', async () => {
      const error = new AxiosError('Too Many Requests', '429');
      error.response = {
        status: 429,
        statusText: 'Too Many Requests',
        data: {},
        headers: {},
        config: {} as any
      };
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks: 429 Too Many Requests'
      );
    });

    it('should handle HTTP 500 internal server error', async () => {
      const error = new AxiosError('Internal Server Error', '500');
      error.response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: {},
        headers: {},
        config: {} as any
      };
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks: 500 Internal Server Error'
      );
    });

    it('should handle HTTP 502 bad gateway error', async () => {
      const error = new AxiosError('Bad Gateway', '502');
      error.response = {
        status: 502,
        statusText: 'Bad Gateway',
        data: {},
        headers: {},
        config: {} as any
      };
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks: 502 Bad Gateway'
      );
    });

    it('should handle HTTP 503 service unavailable error', async () => {
      const error = new AxiosError('Service Unavailable', '503');
      error.response = {
        status: 503,
        statusText: 'Service Unavailable',
        data: {},
        headers: {},
        config: {} as any
      };
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks: 503 Service Unavailable'
      );
    });

    it('should handle network errors without response', async () => {
      const error = new AxiosError('Network Error', 'NETWORK_ERROR');
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks'
      );
      expect(console.error).toHaveBeenCalledWith('Error searching tracks:', error);
    });

    it('should handle timeout errors', async () => {
      const error = new AxiosError('timeout of 10000ms exceeded', 'ECONNABORTED');
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks'
      );
    });

    it('should handle connection refused errors', async () => {
      const error = new AxiosError('connect ECONNREFUSED', 'ECONNREFUSED');
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks'
      );
    });

    it('should handle DNS resolution errors', async () => {
      const error = new AxiosError('getaddrinfo ENOTFOUND', 'ENOTFOUND');
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks'
      );
    });

    it('should handle generic non-axios errors', async () => {
      const error = new Error('Generic error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(spotifyService.searchTracks('test query')).rejects.toThrow(
        'Failed to search tracks'
      );
      expect(console.error).toHaveBeenCalledWith('Error searching tracks:', error);
    });

    it('should handle malformed response data', async () => {
      mockApiClient.get.mockResolvedValue({ data: null });

      const result = await spotifyService.searchTracks('test query');

      expect(result).toBeNull();
    });

    it('should handle response without data property', async () => {
      mockApiClient.get.mockResolvedValue({});

      const result = await spotifyService.searchTracks('test query');

      expect(result).toBeUndefined();
    });

    it('should handle response with invalid tracks structure', async () => {
      const invalidResponse = {
        tracks: 'invalid'
      };
      mockApiClient.get.mockResolvedValue({ data: invalidResponse });

      const result = await spotifyService.searchTracks('test query');

      expect(result).toEqual(invalidResponse);
    });

    it('should handle response with missing track properties', async () => {
      const incompleteTrack = {
        id: '123',
        name: 'Test Song'
        // Missing other required properties
      };
      const responseWithIncompleteTrack = {
        tracks: [incompleteTrack]
      };
      mockApiClient.get.mockResolvedValue({ data: responseWithIncompleteTrack });

      const result = await spotifyService.searchTracks('test query');

      expect(result.tracks[0]).toEqual(incompleteTrack);
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle concurrent requests', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      const promises = [
        spotifyService.searchTracks('query 1'),
        spotifyService.searchTracks('query 2'),
        spotifyService.searchTracks('query 3')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockApiClient.get).toHaveBeenCalledTimes(3);
      results.forEach(result => {
        expect(result).toEqual(mockSearchResponse);
      });
    });

    it('should handle large response with many tracks', async () => {
      const largeResponse: SpotifySearchResponse = {
        tracks: Array.from({ length: 1000 }, (_, i) => ({
          ...mockSpotifyTrack,
          id: `track-${i}`,
          name: `Track ${i}`
        }))
      };
      mockApiClient.get.mockResolvedValue({ data: largeResponse });

      const result = await spotifyService.searchTracks('popular artist');

      expect(result.tracks).toHaveLength(1000);
      expect(result.tracks[0].name).toBe('Track 0');
      expect(result.tracks[999].name).toBe('Track 999');
    });

    it('should handle Unicode characters in query', async () => {
      const unicodeQuery = '음악 🎵 música ♪ موسيقى';
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks(unicodeQuery);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', {
        params: {
          query: unicodeQuery,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle emoji in query', async () => {
      const emojiQuery = '🎵 Happy Song 🎶';
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks(emojiQuery);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', {
        params: {
          query: emojiQuery,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle SQL injection attempt in query', async () => {
      const sqlInjectionQuery = "'; DROP TABLE tracks; --";
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks(sqlInjectionQuery);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', {
        params: {
          query: sqlInjectionQuery,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle XSS attempt in query', async () => {
      const xssQuery = '<script>alert("xss")</script>';
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks(xssQuery);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', {
        params: {
          query: xssQuery,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle newlines and tabs in query', async () => {
      const queryWithWhitespace = 'song\nwith\ttabs\rand\nnewlines';
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks(queryWithWhitespace);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', {
        params: {
          query: queryWithWhitespace,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle tracks with very long names', async () => {
      const trackWithLongName: SpotifyTrack = {
        ...mockSpotifyTrack,
        name: 'A'.repeat(500),
        artists: ['B'.repeat(200)]
      };
      const responseWithLongName: SpotifySearchResponse = {
        tracks: [trackWithLongName]
      };
      mockApiClient.get.mockResolvedValue({ data: responseWithLongName });

      const result = await spotifyService.searchTracks('long song name');

      expect(result.tracks[0].name).toHaveLength(500);
      expect(result.tracks[0].artists[0]).toHaveLength(200);
    });

    it('should handle tracks with empty arrays for artists', async () => {
      const trackWithNoArtists: SpotifyTrack = {
        ...mockSpotifyTrack,
        artists: []
      };
      const responseWithNoArtists: SpotifySearchResponse = {
        tracks: [trackWithNoArtists]
      };
      mockApiClient.get.mockResolvedValue({ data: responseWithNoArtists });

      const result = await spotifyService.searchTracks('instrumental track');

      expect(result.tracks[0].artists).toHaveLength(0);
    });

    it('should handle tracks with invalid URLs', async () => {
      const trackWithInvalidUrls: SpotifyTrack = {
        ...mockSpotifyTrack,
        preview_url: 'invalid-url',
        external_url: 'not-a-url',
        image: 'bad-image-url'
      };
      const responseWithInvalidUrls: SpotifySearchResponse = {
        tracks: [trackWithInvalidUrls]
      };
      mockApiClient.get.mockResolvedValue({ data: responseWithInvalidUrls });

      const result = await spotifyService.searchTracks('track with invalid urls');

      expect(result.tracks[0].preview_url).toBe('invalid-url');
      expect(result.tracks[0].external_url).toBe('not-a-url');
      expect(result.tracks[0].image).toBe('bad-image-url');
    });
  });

  describe('Request Configuration', () => {
    it('should include correct headers in request', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks('test query');

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', 
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should use correct endpoint', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks('test query');

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', expect.any(Object));
    });

    it('should pass query as URL parameter', async () => {
      const testQuery = 'my test song';
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks(testQuery);

      expect(mockApiClient.get).toHaveBeenCalledWith('/spotify/search', 
        expect.objectContaining({
          params: {
            query: testQuery,
          },
        })
      );
    });
  });

  describe('Service Instance', () => {
    it('should export a singleton instance', () => {
      expect(spotifyService).toBeDefined();
      expect(typeof spotifyService.searchTracks).toBe('function');
    });

    it('should maintain state across calls', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      await spotifyService.searchTracks('first call');
      await spotifyService.searchTracks('second call');

      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });

    it('should be reusable', async () => {
      mockApiClient.get.mockResolvedValue({ data: mockSearchResponse });

      const firstResult = await spotifyService.searchTracks('reusable test');
      const secondResult = await spotifyService.searchTracks('reusable test');

      expect(firstResult).toEqual(secondResult);
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});
