import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer } from '@/hooks/use-toast';

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('useToast', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with empty toasts array', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.toasts).toEqual([]);
  });

  it('should add a toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test toast',
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test Toast',
      description: 'This is a test toast',
      open: true,
    });
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it('should limit toasts to TOAST_LIMIT (1)', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
      result.current.toast({ title: 'Toast 3' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 3');
  });

  it('should dismiss a specific toast', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    
    act(() => {
      const toastResult = result.current.toast({ title: 'Test Toast' });
      toastId = toastResult.id;
    });
    
    expect(result.current.toasts[0].open).toBe(true);
    
    act(() => {
      result.current.dismiss(toastId);
    });
    
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should dismiss all toasts when no id provided', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });
    
    expect(result.current.toasts[0].open).toBe(true);
    
    act(() => {
      result.current.dismiss();
    });
    
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should return toast object with dismiss and update methods', () => {
    const { result } = renderHook(() => useToast());
    
    let toastResult: any;
    
    act(() => {
      toastResult = result.current.toast({ title: 'Test Toast' });
    });
    
    expect(toastResult).toHaveProperty('id');
    expect(toastResult).toHaveProperty('dismiss');
    expect(toastResult).toHaveProperty('update');
    expect(typeof toastResult.dismiss).toBe('function');
    expect(typeof toastResult.update).toBe('function');
  });

  it('should update toast content', () => {
    const { result } = renderHook(() => useToast());
    
    let toastResult: any;
    
    act(() => {
      toastResult = result.current.toast({ title: 'Original Title' });
    });
    
    expect(result.current.toasts[0].title).toBe('Original Title');
    
    act(() => {
      toastResult.update({ title: 'Updated Title' });
    });
    
    expect(result.current.toasts[0].title).toBe('Updated Title');
  });

});

describe('toast function (standalone)', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('should create toast with generated id', () => {
    const toastResult = toast({ title: 'Standalone Toast' });
    
    expect(toastResult).toHaveProperty('id');
    expect(toastResult).toHaveProperty('dismiss');
    expect(toastResult).toHaveProperty('update');
  });

  it('should dismiss standalone toast', () => {
    const toastResult = toast({ title: 'Standalone Toast' });
    
    expect(typeof toastResult.dismiss).toBe('function');
    
    // Should not throw
    expect(() => toastResult.dismiss()).not.toThrow();
  });
});

describe('reducer', () => {
  const initialState = { toasts: [] };

  it('should add toast to state', () => {
    const toast = {
      id: '1',
      title: 'Test Toast',
      open: true,
      onOpenChange: jest.fn(),
    };

    const newState = reducer(initialState, {
      type: 'ADD_TOAST',
      toast,
    });

    expect(newState.toasts).toHaveLength(1);
    expect(newState.toasts[0]).toEqual(toast);
  });

  it('should update existing toast', () => {
    const existingToast = {
      id: '1',
      title: 'Original Title',
      open: true,
      onOpenChange: jest.fn(),
    };

    const stateWithToast = { toasts: [existingToast] };

    const newState = reducer(stateWithToast, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'Updated Title' },
    });

    expect(newState.toasts[0].title).toBe('Updated Title');
    expect(newState.toasts[0].id).toBe('1');
  });

  it('should dismiss specific toast', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true, onOpenChange: jest.fn() };
    const toast2 = { id: '2', title: 'Toast 2', open: true, onOpenChange: jest.fn() };

    const stateWithToasts = { toasts: [toast1, toast2] };

    const newState = reducer(stateWithToasts, {
      type: 'DISMISS_TOAST',
      toastId: '1',
    });

    expect(newState.toasts[0].open).toBe(false);
    expect(newState.toasts[1].open).toBe(true);
  });

  it('should dismiss all toasts when no id provided', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true, onOpenChange: jest.fn() };
    const toast2 = { id: '2', title: 'Toast 2', open: true, onOpenChange: jest.fn() };

    const stateWithToasts = { toasts: [toast1, toast2] };

    const newState = reducer(stateWithToasts, {
      type: 'DISMISS_TOAST',
    });

    expect(newState.toasts[0].open).toBe(false);
    expect(newState.toasts[1].open).toBe(false);
  });

  it('should remove specific toast', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true, onOpenChange: jest.fn() };
    const toast2 = { id: '2', title: 'Toast 2', open: true, onOpenChange: jest.fn() };

    const stateWithToasts = { toasts: [toast1, toast2] };

    const newState = reducer(stateWithToasts, {
      type: 'REMOVE_TOAST',
      toastId: '1',
    });

    expect(newState.toasts).toHaveLength(1);
    expect(newState.toasts[0].id).toBe('2');
  });

  it('should remove all toasts when no id provided', () => {
    const toast1 = { id: '1', title: 'Toast 1', open: true, onOpenChange: jest.fn() };
    const toast2 = { id: '2', title: 'Toast 2', open: true, onOpenChange: jest.fn() };

    const stateWithToasts = { toasts: [toast1, toast2] };

    const newState = reducer(stateWithToasts, {
      type: 'REMOVE_TOAST',
    });

    expect(newState.toasts).toEqual([]);
  });
});
