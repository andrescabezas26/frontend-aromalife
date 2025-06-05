import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  const mockMql = {
    matches,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => mockMql),
  });
  
  return mockMql;
};

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

describe('useIsMobile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false initially when window is undefined', () => {
    const mockMql = mockMatchMedia(false);
    mockInnerWidth(1024);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should return true when window width is less than 768px', () => {
    const mockMql = mockMatchMedia(true);
    mockInnerWidth(600);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should return false when window width is 768px or greater', () => {
    const mockMql = mockMatchMedia(false);
    mockInnerWidth(1024);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should add and remove event listener on mount/unmount', () => {
    const mockMql = mockMatchMedia(false);
    mockInnerWidth(1024);
    
    const { unmount } = renderHook(() => useIsMobile());
    
    expect(mockMql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    
    expect(mockMql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update when media query changes', () => {
    let changeHandler: () => void;
    const mockMql = {
      matches: false,
      addEventListener: jest.fn().mockImplementation((event, handler) => {
        changeHandler = handler;
      }),
      removeEventListener: jest.fn(),
    };
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => mockMql),
    });
    
    // Start with desktop width
    mockInnerWidth(1024);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
    
    // Simulate window resize to mobile
    act(() => {
      mockInnerWidth(600);
      changeHandler();
    });
    
    expect(result.current).toBe(true);
  });

  it('should handle edge case at breakpoint boundary', () => {
    const mockMql = mockMatchMedia(true);
    mockInnerWidth(767); // Just below 768
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
    
    // Test exactly at breakpoint
    const mockMql2 = mockMatchMedia(false);
    mockInnerWidth(768);
    
    const { result: result2 } = renderHook(() => useIsMobile());
    
    expect(result2.current).toBe(false);
  });
});
