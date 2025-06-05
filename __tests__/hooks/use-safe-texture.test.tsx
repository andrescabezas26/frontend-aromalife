import { renderHook, act } from '@testing-library/react';
import { useSafeTexture } from '@/hooks/use-safe-texture';
import * as THREE from 'three';

// Mock THREE.TextureLoader
const mockTextureLoader = {
  load: jest.fn()
};

jest.mock('three', () => ({
  ...jest.requireActual('three'),
  TextureLoader: jest.fn(() => mockTextureLoader)
}));

describe('useSafeTexture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTextureLoader.load.mockReset();
  });

  it('should initialize with null texture, no loading, and no error', () => {
    const { result } = renderHook(() => useSafeTexture());
    
    expect(result.current.texture).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it('should start loading when imageUrl is provided', () => {
    const { result } = renderHook(() => useSafeTexture('https://example.com/image.jpg'));
    
    expect(result.current.loading).toBe(true);
    expect(mockTextureLoader.load).toHaveBeenCalledWith(
      'https://example.com/image.jpg',
      expect.any(Function),
      undefined,
      expect.any(Function)
    );
  });

  it('should handle imageUrl change', () => {
    const { result, rerender } = renderHook(
      ({ imageUrl, fallbackUrl }: { imageUrl?: string, fallbackUrl?: string }) => useSafeTexture(imageUrl, fallbackUrl),
      {
        initialProps: { 
          imageUrl: 'https://example.com/image1.jpg',
          fallbackUrl: 'https://example.com/fallback.jpg'
        }
      }
    );
    
    expect(mockTextureLoader.load).toHaveBeenCalledWith(
      'https://example.com/image1.jpg',
      expect.any(Function),
      undefined,
      expect.any(Function)
    );
    
    // Change imageUrl
    rerender({ 
      imageUrl: 'https://example.com/image2.jpg',
      fallbackUrl: 'https://example.com/fallback.jpg'
    });
    
    expect(mockTextureLoader.load).toHaveBeenCalledWith(
      'https://example.com/image2.jpg',
      expect.any(Function),
      undefined,
      expect.any(Function)
    );
  });

  it('should reset state when imageUrl is removed', () => {
    const { result, rerender } = renderHook(
      ({ imageUrl }: { imageUrl?: string | undefined }) => useSafeTexture(imageUrl),
      {
        initialProps: { imageUrl: 'https://example.com/image.jpg' }
      }
    );
    
    expect(result.current.loading).toBe(true);
    
    // Remove imageUrl
    rerender({ imageUrl: "" });
    
    expect(result.current.texture).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it('should not update state after component unmount', () => {
    const mockTexture = new THREE.Texture();
    let onLoadCallback: (texture: THREE.Texture) => void;
    
    mockTextureLoader.load.mockImplementation((url, onLoad) => {
      onLoadCallback = onLoad;
    });
    
    const { result, unmount } = renderHook(() => 
      useSafeTexture('https://example.com/image.jpg')
    );
    
    expect(result.current.loading).toBe(true);
    
    // Unmount component
    unmount();
    
    // Try to call onLoad after unmount
    act(() => {
      onLoadCallback(mockTexture);
    });
    
    // State should not have been updated
    expect(result.current.texture).toBeNull();
  });

  it('should handle undefined imageUrl gracefully', () => {
    const { result } = renderHook(() => useSafeTexture(undefined));
    
    expect(result.current.texture).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(mockTextureLoader.load).not.toHaveBeenCalled();
  });

  it('should handle empty string imageUrl', () => {
    const { result } = renderHook(() => useSafeTexture(''));
    
    expect(result.current.texture).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(mockTextureLoader.load).not.toHaveBeenCalled();
  });
});
