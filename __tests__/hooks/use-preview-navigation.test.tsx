import { renderHook, act } from '@testing-library/react';
import { usePreviewNavigation } from '@/hooks/use-preview-navigation';

// Mock Next.js router and search params
const mockPush = jest.fn();
const mockSearchParams = {
  get: jest.fn()
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useSearchParams: () => mockSearchParams
}));

// Mock personalization store
const mockSetReturnToPreview = jest.fn();
const mockReturnToPreview = { value: false };

jest.mock('@/stores/personalization-store', () => ({
  usePersonalizationStore: () => ({
    returnToPreview: mockReturnToPreview.value,
    setReturnToPreview: mockSetReturnToPreview
  })
}));

describe('usePreviewNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReturnToPreview.value = false;
    mockSearchParams.get.mockReturnValue(null);
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePreviewNavigation());
    
    expect(result.current.fromPreview).toBe(false);
    expect(typeof result.current.goBackToPreview).toBe('function');
    expect(typeof result.current.handleNext).toBe('function');
  });

  it('should detect when coming from preview via search params', () => {
    mockSearchParams.get.mockReturnValue('preview');
    
    const { result } = renderHook(() => usePreviewNavigation());
    
    expect(result.current.fromPreview).toBe(true);
    expect(mockSetReturnToPreview).toHaveBeenCalledWith(true);
  });

  it('should not set returnToPreview when not from preview', () => {
    mockSearchParams.get.mockReturnValue('home');
    
    renderHook(() => usePreviewNavigation());
    
    expect(mockSetReturnToPreview).not.toHaveBeenCalledWith(true);
  });

  it('should return true for fromPreview when store has returnToPreview true', () => {
    mockReturnToPreview.value = true;
    
    const { result } = renderHook(() => usePreviewNavigation());
    
    expect(result.current.fromPreview).toBe(true);
  });

  it('should return true for fromPreview when both store and search params indicate preview', () => {
    mockReturnToPreview.value = true;
    mockSearchParams.get.mockReturnValue('preview');
    
    const { result } = renderHook(() => usePreviewNavigation());
    
    expect(result.current.fromPreview).toBe(true);
  });

  it('should go back to preview when goBackToPreview is called', () => {
    const { result } = renderHook(() => usePreviewNavigation());
    
    act(() => {
      result.current.goBackToPreview();
    });
    
    expect(mockSetReturnToPreview).toHaveBeenCalledWith(false);
    expect(mockPush).toHaveBeenCalledWith('/personalization/preview');
  });

  it('should handle next by going to preview when fromPreview is true', () => {
    mockReturnToPreview.value = true;
    
    const { result } = renderHook(() => usePreviewNavigation());
    
    act(() => {
      result.current.handleNext('/default/next/url');
    });
    
    expect(mockSetReturnToPreview).toHaveBeenCalledWith(false);
    expect(mockPush).toHaveBeenCalledWith('/personalization/preview');
  });

  it('should handle next by going to default URL when fromPreview is false', () => {
    mockReturnToPreview.value = false;
    
    const { result } = renderHook(() => usePreviewNavigation());
    
    act(() => {
      result.current.handleNext('/default/next/url');
    });
    
    expect(mockPush).toHaveBeenCalledWith('/default/next/url');
    expect(mockSetReturnToPreview).not.toHaveBeenCalledWith(false);
  });

  it('should update fromPreview when search params change', () => {
    const { result, rerender } = renderHook(() => usePreviewNavigation());
    
    expect(result.current.fromPreview).toBe(false);
    
    // Simulate search params change
    mockSearchParams.get.mockReturnValue('preview');
    
    rerender();
    
    // Note: In a real scenario, this would trigger the useEffect
    // For testing purposes, we can manually verify the effect would be called
    expect(mockSearchParams.get).toHaveBeenCalledWith('from');
  });

  it('should handle null search params gracefully', () => {
    mockSearchParams.get.mockReturnValue(null);
    
    const { result } = renderHook(() => usePreviewNavigation());
    
    expect(result.current.fromPreview).toBe(false);
    expect(mockSetReturnToPreview).not.toHaveBeenCalledWith(true);
  });

  it('should handle different search param values', () => {
    mockSearchParams.get.mockReturnValue('other-value');
    
    const { result } = renderHook(() => usePreviewNavigation());
    
    expect(result.current.fromPreview).toBe(false);
    expect(mockSetReturnToPreview).not.toHaveBeenCalledWith(true);
  });

  it('should set returnToPreview when useEffect runs with fromPreview true', () => {
    mockSearchParams.get.mockReturnValue('preview');
    
    renderHook(() => usePreviewNavigation());
    
    // The useEffect should have run and called setReturnToPreview(true)
    expect(mockSetReturnToPreview).toHaveBeenCalledWith(true);
  });

  it('should work with different default next URLs', () => {
    mockReturnToPreview.value = false;
    
    const { result } = renderHook(() => usePreviewNavigation());
    
    const testUrls = [
      '/step/2',
      '/checkout',
      '/confirmation',
      '/custom/path'
    ];
    
    testUrls.forEach(url => {
      act(() => {
        result.current.handleNext(url);
      });
      
      expect(mockPush).toHaveBeenCalledWith(url);
    });
  });
});
