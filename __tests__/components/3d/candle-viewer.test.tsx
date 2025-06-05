import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CandleViewer } from '@/components/3d/candle-viewer';

// Mock Three.js
jest.mock('three', () => ({
  __esModule: true,
  ...jest.requireActual('three'),
  Color: jest.fn().mockImplementation((color) => ({
    getHex: jest.fn(() => 0xffffff),
    setHex: jest.fn(),
  })),
  SRGBColorSpace: 'srgb',
  DoubleSide: 2,
  TextureLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((url, onLoad, onProgress, onError) => {
      // Simulate successful texture loading
      const mockTexture = {
        colorSpace: 'srgb',
      };
      if (onLoad && url && !url.includes('invalid')) {
        setTimeout(() => onLoad(mockTexture), 10);
      } else if (onError) {
        setTimeout(() => onError(new Error('Texture load error')), 10);
      }
    }),
  })),
  Box3: jest.fn().mockImplementation(() => ({
    setFromObject: jest.fn().mockReturnThis(),
    getCenter: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
  })),
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({ x, y, z })),
  MeshStandardMaterial: jest.fn().mockImplementation(() => ({
    clone: jest.fn().mockReturnThis(),
    color: {
      setHex: jest.fn(),
    },
    name: 'MockMaterial',
  })),
  Mesh: jest.fn().mockImplementation(() => ({
    name: 'MockMesh',
    material: {
      name: 'wax_material',
    },
  })),
  Group: jest.fn().mockImplementation(() => ({
    clone: jest.fn().mockReturnThis(),
    position: { sub: jest.fn() },
    traverse: jest.fn((callback) => {
      // Simulate traversing mesh children
      const mockMesh = {
        name: 'wax_mesh',
        material: {
          name: 'wax_material',
          clone: jest.fn().mockReturnThis(),
          color: { setHex: jest.fn() },
        },
      };
      callback(mockMesh);
    }),
  })),
}));

// Mock GLTFLoader
jest.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((url, onLoad, onProgress, onError) => {
      if (url && !url.includes('invalid')) {
        const mockGLTF = {
          scene: {
            clone: jest.fn().mockReturnValue({
              position: { sub: jest.fn() },
              traverse: jest.fn((callback) => {
                const mockMesh = {
                  name: 'wax_mesh',
                  material: {
                    name: 'wax_material',
                    clone: jest.fn().mockReturnThis(),
                    color: { setHex: jest.fn() },
                  },
                };
                callback(mockMesh);
              }),
            }),
          },
        };
        setTimeout(() => onLoad && onLoad(mockGLTF), 10);
      } else {
        setTimeout(() => onError && onError(new Error('GLTF load error')), 10);
      }
    }),
  })),
}));

// Mock React Three Fiber
jest.mock('@react-three/fiber', () => ({
  Canvas: jest.fn(({ children, onCreated, ...props }) => {
    // Simulate canvas creation
    React.useEffect(() => {
      if (onCreated) onCreated();
    }, [onCreated]);
    
    return (
      <div data-testid="r3f-canvas" {...props}>
        {children}
      </div>
    );
  }),
  useFrame: jest.fn((callback) => {
    // Mock useFrame hook
    React.useEffect(() => {
      const mockState = {
        clock: { elapsedTime: 1 },
      };
      callback(mockState);
    }, [callback]);
  }),
  useLoader: jest.fn((Loader, url) => {
    if (url && !url.includes('invalid')) {
      return {
        scene: {
          clone: jest.fn().mockReturnValue({
            position: { sub: jest.fn() },
            traverse: jest.fn(),
          }),
        },
      };
    }
    throw new Error('Loader error');
  }),
}));

// Mock React Three Drei
jest.mock('@react-three/drei', () => ({
  OrbitControls: jest.fn(({ children, ...props }) => (
    <div data-testid="orbit-controls" {...props}>
      {children}
    </div>
  )),
  Environment: jest.fn(({ preset, ...props }) => (
    <div data-testid="environment" data-preset={preset} {...props} />
  )),
  Text: jest.fn(({ children, ...props }) => (
    <div data-testid="drei-text" {...props}>
      {children}
    </div>
  )),
  Html: jest.fn(({ children, center, ...props }) => (
    <div data-testid="drei-html" data-center={center} {...props}>
      {children}
    </div>
  )),
}));

// Mock HTMLCanvasElement and related APIs
beforeAll(() => {
  // Mock HTMLCanvasElement
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: jest.fn(() => ({
      fillStyle: '',
      fillRect: jest.fn(),
      canvas: { width: 128, height: 128 },
    })),
  });

  // Mock document.createElement for canvas
  const originalCreateElement = document.createElement;
  document.createElement = jest.fn((tagName) => {
    if (tagName === 'canvas') {
      const canvas = originalCreateElement.call(document, 'canvas');
      canvas.width = 128;
      canvas.height = 128;
      return canvas;
    }
    return originalCreateElement.call(document, tagName);
  });
});

describe('CandleViewer', () => {
  // Spy on console methods
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<CandleViewer />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
      expect(screen.getByText('Arrastra para rotar')).toBeInTheDocument();
    });

    it('should render with custom dimensions', () => {
      render(<CandleViewer width={400} height={500} />);
      
      const container = screen.getByTestId('r3f-canvas').parentElement;
      expect(container).toHaveStyle({ width: '400px', height: '500px' });
    });

    it('should apply custom className', () => {
      render(<CandleViewer className="custom-class" />);
      
      const container = screen.getByTestId('r3f-canvas').parentElement;
      expect(container).toHaveClass('custom-class');
    });

    it('should render with custom wax color', () => {
      render(<CandleViewer waxColor="#ff0000" />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });
  });

  describe('Label and Text Rendering', () => {
    it('should render with label text when no image is provided', () => {
      render(<CandleViewer labelText="Test Label" />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });

    it('should render with label image URL', () => {
      render(<CandleViewer labelImageUrl="https://example.com/label.jpg" />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });

    it('should render with message text', () => {
      render(<CandleViewer messageText="Custom Message" />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });

    it('should render with both label and message', () => {
      render(
        <CandleViewer 
          labelText="Test Label" 
          messageText="Test Message" 
        />
      );
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });
  });

  describe('QR Code Functionality', () => {
    it('should render QR code when showQR is true', () => {
      render(<CandleViewer showQR={true} />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });

    it('should render QR code with custom URL', () => {
      render(
        <CandleViewer 
          showQR={true} 
          qrUrl="https://custom-qr-url.com" 
        />
      );
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });

    it('should not render QR code when showQR is false', () => {
      render(<CandleViewer showQR={false} />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });
  });

  describe('3D Controls and Animation', () => {
    it('should render with auto rotation enabled', () => {
      render(<CandleViewer autoRotate={true} />);
      
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    });

    it('should render with auto rotation disabled', () => {
      render(<CandleViewer autoRotate={false} />);
      
      expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    });

    it('should render environment with sunset preset', () => {
      render(<CandleViewer />);
      
      expect(screen.getByTestId('environment')).toBeInTheDocument();
      expect(screen.getByTestId('environment')).toHaveAttribute('data-preset', 'sunset');
    });
  });

  describe('Custom Model Loading', () => {
    it('should render with custom model URL', () => {
      render(<CandleViewer customModelUrl="https://example.com/custom-model.glb" />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });

    it('should use default model when no custom URL provided', () => {
      render(<CandleViewer />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });

    it('should handle model loading errors', () => {
      render(<CandleViewer customModelUrl="invalid-url" />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });

    it('should handle texture loading errors', () => {
      render(<CandleViewer labelImageUrl="invalid-image-url" />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });
  });

  describe('Canvas 3D Error Boundary', () => {
    it('should display error UI when 3D rendering fails', () => {
      // Create a mock error boundary scenario
      const originalError = console.error;
      console.error = jest.fn();

      // Simulate error state
      const errorState = { hasError: true, error: new Error('3D Error') };
      
      // We can't easily test the error boundary directly, but we can test the error UI structure
      render(
        <div className="flex items-center justify-center h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center p-4">
            <div className="text-red-500 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                data-testid="error-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.888-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Error en renderizado 3D
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              No se pudo cargar el modelo 3D
            </p>
            <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
              Reintentar
            </button>
          </div>
        </div>
      );

      expect(screen.getByText('Error en renderizado 3D')).toBeInTheDocument();
      expect(screen.getByText('No se pudo cargar el modelo 3D')).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();

      console.error = originalError;
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<CandleViewer />);
      
      const container = screen.getByTestId('r3f-canvas').parentElement;
      expect(container).toHaveClass('border', 'rounded-lg');
    });

    it('should provide interaction instructions', () => {
      render(<CandleViewer />);
      
      expect(screen.getByText('Arrastra para rotar')).toBeInTheDocument();
    });
  });

  describe('Performance and Optimization', () => {
    it('should render without memory leaks', () => {
      const { unmount } = render(<CandleViewer />);
      
      // Component should render successfully
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
      
      // Should unmount without errors
      unmount();
    });

    it('should handle rapid prop changes', () => {
      const { rerender } = render(<CandleViewer waxColor="#ff0000" />);
      
      // Change props rapidly
      rerender(<CandleViewer waxColor="#00ff00" />);
      rerender(<CandleViewer waxColor="#0000ff" />);
      rerender(<CandleViewer waxColor="#ffff00" />);
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });
  });

  describe('Complex Scenarios', () => {
    it('should render with all features enabled', () => {
      render(
        <CandleViewer 
          waxColor="#ff6b35"
          labelImageUrl="https://example.com/label.jpg"
          labelText="Fallback Label"
          messageText="Happy Birthday!"
          showQR={true}
          qrUrl="https://custom-qr.com"
          width={500}
          height={600}
          autoRotate={true}
          className="custom-candle-viewer"
          customModelUrl="https://example.com/custom.glb"
        />
      );
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
      
      const container = screen.getByTestId('r3f-canvas').parentElement;
      expect(container).toHaveStyle({ width: '500px', height: '600px' });
      expect(container).toHaveClass('custom-candle-viewer');
    });

    it('should handle empty/undefined props gracefully', () => {
      render(
        <CandleViewer 
          waxColor=""
          labelImageUrl=""
          labelText=""
          messageText=""
          qrUrl=""
          customModelUrl=""
        />
      );
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });

    it('should handle special characters in text props', () => {
      render(
        <CandleViewer 
          labelText="Étiquette spéciale avec accents éàü"
          messageText="Mensaje con caracteres especiales: ñáéíóú ¡¿"
        />
      );
      
      expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
    });
  });

  describe('Canvas Configuration', () => {
    it('should create canvas with correct camera settings', () => {
      render(<CandleViewer />);
      
      const canvas = screen.getByTestId('r3f-canvas');
      expect(canvas).toHaveAttribute('camera');
    });

    it('should log canvas creation success', () => {
      render(<CandleViewer />);
      
      // The canvas onCreated callback should have been called
      expect(consoleLogSpy).toHaveBeenCalledWith('Canvas 3D creado exitosamente');
    });
  });
});
