import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

export function useSafeTexture(imageUrl?: string, fallbackUrl?: string) {
  const isMountedRef = useRef(true);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadTexture = useCallback((url: string, isFallback = false) => {
    if (!isMountedRef.current) return;

    setLoading(true);
    const loader = new THREE.TextureLoader();
    
    loader.load(
      url,
      (loadedTexture) => {
        if (isMountedRef.current) {
          setTexture(loadedTexture);
          setLoading(false);
          setError(false);
        }
      },
      undefined,
      (loadError) => {
        if (isMountedRef.current) {
          console.warn('Error loading texture:', loadError);
          setError(true);
          setLoading(false);
          
          // Intentar cargar fallback si no es ya el fallback
          if (!isFallback && fallbackUrl && url !== fallbackUrl) {
            loadTexture(fallbackUrl, true);
          } else {
            setTexture(null);
          }
        }
      }
    );
  }, [fallbackUrl]);

  useEffect(() => {
    if (imageUrl) {
      loadTexture(imageUrl);
    } else {
      setTexture(null);
      setLoading(false);
      setError(false);
    }
  }, [imageUrl, loadTexture]);

  return { texture, loading, error };
}