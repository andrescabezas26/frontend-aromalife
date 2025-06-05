import { usePersonalizationStore, MainOption, IntendedImpact, Container, Aroma, Label, AudioSelection } from '@/stores/personalization-store';

// Mock localStorage and related browser APIs
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock URL.revokeObjectURL
Object.defineProperty(window, 'URL', {
  value: {
    revokeObjectURL: jest.fn(),
    createObjectURL: jest.fn(() => 'blob:mock-url'),
  },
});

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('PersonalizationStore', () => {
  // Variable to save the original setState implementation
  let originalSetState: any;

  // Mock data
  const mockMainOption: MainOption = {
    id: 'option1',
    name: 'Gift',
    description: 'Create a gift candle',
    emoji: '🎁',
  };

  const mockIntendedImpact: IntendedImpact = {
    id: 'impact1',
    name: 'Relaxation',
    icon: '🧘',
    description: 'Calm and peaceful',
  };

  const mockContainer: Container = {
    id: 'container1',
    name: 'Glass Jar',
    description: 'Beautiful glass container',
    imageUrl: 'container.jpg',
    basePrice: 25.99,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  };

  const mockAroma: Aroma = {
    id: 'aroma1',
    name: 'Lavender',
    description: 'Calming lavender scent',
    olfativePyramid: {
      salida: 'Fresh',
      corazon: 'Lavender',
      fondo: 'Musk',
    },
    imageUrl: 'lavender.jpg',
    color: '#7B68EE',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  };

  const mockLabel: Label = {
    id: 'label1',
    name: 'Custom Label',
    description: 'User custom label',
    imageUrl: 'label.jpg',
    type: 'custom',
    isActive: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  };

  const mockLocalLabel: Label = {
    id: 'local1',
    name: 'Local Label',
    imageUrl: 'local.jpg',
    type: 'custom',
    isActive: true,
    isLocal: true,
    localPreview: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  };

  const mockAudioSelection: AudioSelection = {
    id: 'audio1',
    type: 'recording',
    name: 'Voice Note',
    duration: 30,
    createdAt: '2023-01-01',
  };
  beforeEach(() => {
    // Save the original setState implementation
    originalSetState = usePersonalizationStore.setState;
    
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();

    // Reset store state
    usePersonalizationStore.setState({
      currentStep: 1,
      maxStepReached: 1,
      returnToPreview: false,
      _hasHydrated: true, // Set to true for testing
      mainOption: null,
      place: null,
      intendedImpact: null,
      container: null,
      fragrance: null,
      waxColor: null,
      label: null,
      message: '',
      customPrompt: '',
      audioSelection: null,
      candleName: '',
      modelFile: null,
      aromaData: null,
      emotionData: null,
      contextLoading: false,
    });

    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
  });
  afterEach(() => {
    // Restore the original setState implementation
    usePersonalizationStore.setState = originalSetState;
    
    // Restore original console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      // Reset to true initial state
      usePersonalizationStore.setState({
        currentStep: 1,
        maxStepReached: 1,
        returnToPreview: false,
        _hasHydrated: false,
        mainOption: null,
        place: null,
        intendedImpact: null,
        container: null,
        fragrance: null,
        waxColor: null,
        label: null,
        message: '',
        customPrompt: '',
        audioSelection: null,
        candleName: '',
        modelFile: null,
        aromaData: null,
        emotionData: null,
        contextLoading: false,
      });

      const state = usePersonalizationStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.maxStepReached).toBe(1);
      expect(state.mainOption).toBeNull();
      expect(state.message).toBe('');
      expect(state.candleName).toBe('');
      expect(state._hasHydrated).toBe(false);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      usePersonalizationStore.setState({ maxStepReached: 5 });
    });

    it('should allow going to any reached step', () => {
      const { canGoToStep } = usePersonalizationStore.getState();
      
      expect(canGoToStep(1)).toBe(true);
      expect(canGoToStep(3)).toBe(true);
      expect(canGoToStep(5)).toBe(true);
      expect(canGoToStep(6)).toBe(false);
    });

    it('should go to step if allowed', () => {
      const { goToStep } = usePersonalizationStore.getState();
      goToStep(3);

      const state = usePersonalizationStore.getState();
      expect(state.currentStep).toBe(3);
    });

    it('should not go to step if not allowed', () => {
      usePersonalizationStore.setState({ currentStep: 2 });
      
      const { goToStep } = usePersonalizationStore.getState();
      goToStep(6); // Beyond maxStepReached

      const state = usePersonalizationStore.getState();
      expect(state.currentStep).toBe(2); // Should not change
    });

    it('should go to next step', () => {
      usePersonalizationStore.setState({ currentStep: 3 });

      const { nextStep } = usePersonalizationStore.getState();
      nextStep();

      const state = usePersonalizationStore.getState();
      expect(state.currentStep).toBe(4);
      expect(state.maxStepReached).toBe(5); // Should update maxStepReached
    });

    it('should not go beyond step 8', () => {
      usePersonalizationStore.setState({ currentStep: 8 });

      const { nextStep } = usePersonalizationStore.getState();
      nextStep();

      const state = usePersonalizationStore.getState();
      expect(state.currentStep).toBe(8);
    });

    it('should go to previous step', () => {
      usePersonalizationStore.setState({ currentStep: 3 });

      const { previousStep } = usePersonalizationStore.getState();
      previousStep();

      const state = usePersonalizationStore.getState();
      expect(state.currentStep).toBe(2);
    });

    it('should not go below step 1', () => {
      usePersonalizationStore.setState({ currentStep: 1 });

      const { previousStep } = usePersonalizationStore.getState();
      previousStep();

      const state = usePersonalizationStore.getState();
      expect(state.currentStep).toBe(1);
    });
  });

  describe('Step Actions', () => {
    it('should set main option and update maxStepReached', () => {
      const { setMainOption } = usePersonalizationStore.getState();
      setMainOption(mockMainOption);

      const state = usePersonalizationStore.getState();
      expect(state.mainOption).toEqual(mockMainOption);
      expect(state.maxStepReached).toBe(2);
    });

    it('should set place', () => {
      const place = { id: 'place1', name: 'Living Room', description: 'Cozy space' };
      const { setPlace } = usePersonalizationStore.getState();
      setPlace(place);

      const state = usePersonalizationStore.getState();
      expect(state.place).toEqual(place);
      expect(state.maxStepReached).toBe(2);
    });

    it('should set intended impact and update maxStepReached', () => {
      const { setIntendedImpact } = usePersonalizationStore.getState();
      setIntendedImpact(mockIntendedImpact);

      const state = usePersonalizationStore.getState();
      expect(state.intendedImpact).toEqual(mockIntendedImpact);
      expect(state.maxStepReached).toBe(3);
    });

    it('should set container and update maxStepReached', () => {
      const { setContainer } = usePersonalizationStore.getState();
      setContainer(mockContainer);

      const state = usePersonalizationStore.getState();
      expect(state.container).toEqual(mockContainer);
      expect(state.maxStepReached).toBe(4);
    });

    it('should set fragrance with wax color and update maxStepReached', () => {
      const { setFragrance } = usePersonalizationStore.getState();
      setFragrance(mockAroma, '#FF0000');

      const state = usePersonalizationStore.getState();
      expect(state.fragrance).toEqual(mockAroma);
      expect(state.waxColor).toBe('#FF0000');
      expect(state.maxStepReached).toBe(5);
    });

    it('should set message', () => {
      const { setMessage } = usePersonalizationStore.getState();
      setMessage('Hello world');

      const state = usePersonalizationStore.getState();
      expect(state.message).toBe('Hello world');
    });

    it('should set custom prompt', () => {
      const { setCustomPrompt } = usePersonalizationStore.getState();
      setCustomPrompt('Custom AI prompt');

      const state = usePersonalizationStore.getState();
      expect(state.customPrompt).toBe('Custom AI prompt');
    });

    it('should set candle name and update maxStepReached when name is not empty', () => {
      const { setCandleName } = usePersonalizationStore.getState();
      setCandleName('My Candle');

      const state = usePersonalizationStore.getState();
      expect(state.candleName).toBe('My Candle');
      expect(state.maxStepReached).toBe(8);
    });

    it('should not update maxStepReached when setting empty candle name', () => {
      usePersonalizationStore.setState({ maxStepReached: 5 });
      
      const { setCandleName } = usePersonalizationStore.getState();
      setCandleName('   '); // Empty after trim

      const state = usePersonalizationStore.getState();
      expect(state.candleName).toBe('   ');
      expect(state.maxStepReached).toBe(5);
    });

    it('should set model file', () => {
      const mockFile = new File(['content'], 'model.obj', { type: 'application/octet-stream' });
      
      const { setModelFile } = usePersonalizationStore.getState();
      setModelFile(mockFile);

      const state = usePersonalizationStore.getState();
      expect(state.modelFile).toBe(mockFile);
    });
  });

  describe('Label Management', () => {
    it('should set normal label successfully', () => {
      const { setLabel } = usePersonalizationStore.getState();
      setLabel(mockLabel);

      const state = usePersonalizationStore.getState();
      expect(state.label).toEqual(mockLabel);
      expect(state.maxStepReached).toBe(6);
    });

    it('should set local label with small preview', () => {
      const { setLabel } = usePersonalizationStore.getState();
      setLabel(mockLocalLabel);

      const state = usePersonalizationStore.getState();
      expect(state.label).toEqual(mockLocalLabel);
      expect(state.maxStepReached).toBe(6);
    });

    it('should handle large local label by removing preview', () => {
      const largePreview = 'data:image/jpeg;base64,' + 'A'.repeat(600000); // Large preview
      const largeLocalLabel = { ...mockLocalLabel, localPreview: largePreview };

      const { setLabel } = usePersonalizationStore.getState();
      setLabel(largeLocalLabel);

      const state = usePersonalizationStore.getState();
      expect(state.label?.localPreview).toBeUndefined();
      expect(state.label?.imageUrl).toBe('/placeholder.svg');
      expect(console.warn).toHaveBeenCalledWith(
        'Imagen muy grande para localStorage, se guardará sin preview'
      );
    });    

    it('should clear label when setting null', () => {
      usePersonalizationStore.setState({ label: mockLabel, maxStepReached: 6 });

      const { setLabel } = usePersonalizationStore.getState();
      setLabel(null);

      const state = usePersonalizationStore.getState();
      expect(state.label).toBeNull();
      expect(state.maxStepReached).toBe(6); // Should not decrease
    });
  });

  describe('Audio Management', () => {
    it('should set audio selection successfully', () => {
      const { setAudioSelection } = usePersonalizationStore.getState();
      setAudioSelection(mockAudioSelection);

      const state = usePersonalizationStore.getState();
      expect(state.audioSelection).toEqual(mockAudioSelection);
      expect(state.maxStepReached).toBe(7);
    });

    it('should revoke previous blob URL when setting new audio', () => {
      const previousAudio = { ...mockAudioSelection, localUrl: 'blob:previous-url' };
      usePersonalizationStore.setState({ audioSelection: previousAudio });

      const { setAudioSelection } = usePersonalizationStore.getState();
      setAudioSelection(mockAudioSelection);

      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:previous-url');
    });

    it('should handle URL revocation errors gracefully', () => {
      (window.URL.revokeObjectURL as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to revoke URL');
      });

      const previousAudio = { ...mockAudioSelection, localUrl: 'blob:previous-url' };
      usePersonalizationStore.setState({ audioSelection: previousAudio });

      const { setAudioSelection } = usePersonalizationStore.getState();
      expect(() => setAudioSelection(mockAudioSelection)).not.toThrow();
      expect(console.warn).toHaveBeenCalledWith('Error revoking previous audio URL:', expect.any(Error));
    });    

    it('should clear audio when setting null', () => {
      usePersonalizationStore.setState({ audioSelection: mockAudioSelection, maxStepReached: 7 });

      const { setAudioSelection } = usePersonalizationStore.getState();
      setAudioSelection(null);

      const state = usePersonalizationStore.getState();
      expect(state.audioSelection).toBeNull();
      expect(state.maxStepReached).toBe(7); // Should not decrease
    });
  });

  describe('Context Data Management', () => {
    it('should set aroma data', () => {
      const aromaData = { scent: 'lavender', intensity: 'medium' };
      
      const { setAromaData } = usePersonalizationStore.getState();
      setAromaData(aromaData);

      const state = usePersonalizationStore.getState();
      expect(state.aromaData).toEqual(aromaData);
    });

    it('should set emotion data', () => {
      const emotionData = { mood: 'calm', energy: 'low' };
      
      const { setEmotionData } = usePersonalizationStore.getState();
      setEmotionData(emotionData);

      const state = usePersonalizationStore.getState();
      expect(state.emotionData).toEqual(emotionData);
    });

    it('should set context loading state', () => {
      const { setContextLoading } = usePersonalizationStore.getState();
      setContextLoading(true);

      const state = usePersonalizationStore.getState();
      expect(state.contextLoading).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    it('should reset store to initial state', () => {
      // Set some state
      usePersonalizationStore.setState({
        currentStep: 5,
        mainOption: mockMainOption,
        message: 'test message',
        candleName: 'test candle',
      });

      const { reset } = usePersonalizationStore.getState();
      reset();

      const state = usePersonalizationStore.getState();
      expect(state.currentStep).toBe(1);
      expect(state.mainOption).toBeNull();
      expect(state.message).toBe('');
      expect(state.candleName).toBe('');
    });

    it('should check if can continue from each step', () => {
      const { canContinueFromStep } = usePersonalizationStore.getState();
      
      // Step 1 - needs main option
      expect(canContinueFromStep(1)).toBe(false);
      usePersonalizationStore.setState({ mainOption: mockMainOption });
      expect(canContinueFromStep(1)).toBe(true);

      // Step 2 - only needs main option (place is optional)
      expect(canContinueFromStep(2)).toBe(true);

      // Step 3 - needs intended impact
      expect(canContinueFromStep(3)).toBe(false);
      usePersonalizationStore.setState({ intendedImpact: mockIntendedImpact });
      expect(canContinueFromStep(3)).toBe(true);

      // Step 4 - needs container
      expect(canContinueFromStep(4)).toBe(false);
      usePersonalizationStore.setState({ container: mockContainer });
      expect(canContinueFromStep(4)).toBe(true);

      // Step 5 - needs fragrance
      expect(canContinueFromStep(5)).toBe(false);
      usePersonalizationStore.setState({ fragrance: mockAroma });
      expect(canContinueFromStep(5)).toBe(true);

      // Step 6 - needs label
      expect(canContinueFromStep(6)).toBe(false);
      usePersonalizationStore.setState({ label: mockLabel });
      expect(canContinueFromStep(6)).toBe(true);

      // Step 7 - needs non-empty message
      expect(canContinueFromStep(7)).toBe(false);
      usePersonalizationStore.setState({ message: '   ' }); // Empty after trim
      expect(canContinueFromStep(7)).toBe(false);
      usePersonalizationStore.setState({ message: 'Valid message' });
      expect(canContinueFromStep(7)).toBe(true);

      // Step 8 - needs audio selection
      expect(canContinueFromStep(8)).toBe(false);
      usePersonalizationStore.setState({ audioSelection: mockAudioSelection });
      expect(canContinueFromStep(8)).toBe(true);
    });

    it('should return false for canContinueFromStep when not hydrated', () => {
      usePersonalizationStore.setState({ 
        _hasHydrated: false,
        mainOption: mockMainOption 
      });

      const { canContinueFromStep } = usePersonalizationStore.getState();
      expect(canContinueFromStep(1)).toBe(false);
    });

    it('should check if steps are completed', () => {
      const { isStepCompleted } = usePersonalizationStore.getState();

      // All steps should be incomplete initially
      for (let i = 1; i <= 8; i++) {
        expect(isStepCompleted(i)).toBe(false);
      }

      // Complete each step
      usePersonalizationStore.setState({ mainOption: mockMainOption });
      expect(isStepCompleted(1)).toBe(true);

      usePersonalizationStore.setState({ intendedImpact: mockIntendedImpact });
      expect(isStepCompleted(2)).toBe(true);

      usePersonalizationStore.setState({ container: mockContainer });
      expect(isStepCompleted(3)).toBe(true);

      usePersonalizationStore.setState({ fragrance: mockAroma });
      expect(isStepCompleted(4)).toBe(true);

      usePersonalizationStore.setState({ label: mockLabel });
      expect(isStepCompleted(5)).toBe(true);

      usePersonalizationStore.setState({ message: 'Valid message' });
      expect(isStepCompleted(6)).toBe(true);

      usePersonalizationStore.setState({ audioSelection: mockAudioSelection });
      expect(isStepCompleted(7)).toBe(true);

      usePersonalizationStore.setState({ candleName: 'My Candle' });
      expect(isStepCompleted(8)).toBe(true);
    });

    it('should calculate progress correctly', () => {
      const { getProgress } = usePersonalizationStore.getState();

      // Initially 0%
      expect(getProgress()).toBe(0);

      // Complete steps one by one
      usePersonalizationStore.setState({ mainOption: mockMainOption });
      expect(getProgress()).toBe(13); // 1/8 * 100 = 12.5, rounded to 13

      usePersonalizationStore.setState({ intendedImpact: mockIntendedImpact });
      expect(getProgress()).toBe(25); // 2/8 * 100 = 25

      usePersonalizationStore.setState({ container: mockContainer });
      expect(getProgress()).toBe(38); // 3/8 * 100 = 37.5, rounded to 38

      usePersonalizationStore.setState({ fragrance: mockAroma });
      expect(getProgress()).toBe(50); // 4/8 * 100 = 50

      usePersonalizationStore.setState({ label: mockLabel });
      expect(getProgress()).toBe(63); // 5/8 * 100 = 62.5, rounded to 63

      usePersonalizationStore.setState({ message: 'Valid message' });
      expect(getProgress()).toBe(75); // 6/8 * 100 = 75

      usePersonalizationStore.setState({ audioSelection: mockAudioSelection });
      expect(getProgress()).toBe(88); // 7/8 * 100 = 87.5, rounded to 88

      usePersonalizationStore.setState({ candleName: 'My Candle' });
      expect(getProgress()).toBe(100); // 8/8 * 100 = 100
    });

    it('should return 0 progress on server side', () => {
      // Mock window being undefined (SSR scenario)
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const { getProgress } = usePersonalizationStore.getState();
      expect(getProgress()).toBe(0);

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('URL Generation', () => {
    beforeEach(() => {
      usePersonalizationStore.setState({
        mainOption: mockMainOption,
        intendedImpact: mockIntendedImpact,
        container: mockContainer,
        fragrance: mockAroma,
        waxColor: '#FF0000',
        label: mockLabel,
        message: 'Hello world',
      });
    });

    it('should generate correct URLs for each step', () => {
      const { getStepUrl } = usePersonalizationStore.getState();

      expect(getStepUrl(1)).toContain('/personalization');
      expect(getStepUrl(2)).toContain('/personalization/impact');
      expect(getStepUrl(3)).toContain('/personalization/container');
      expect(getStepUrl(4)).toContain('/personalization/fragrance');
      expect(getStepUrl(5)).toContain('/personalization/label');
      expect(getStepUrl(6)).toContain('/personalization/message');
      expect(getStepUrl(7)).toContain('/personalization/audio');
      expect(getStepUrl(8)).toContain('/personalization/name');
    });

    it('should include query parameters in URLs', () => {
      const { getStepUrl } = usePersonalizationStore.getState();
      const url = getStepUrl(1);

      expect(url).toContain('mainOptionId=option1');
      expect(url).toContain('emotion=impact1');
      expect(url).toContain('container=container1');
      expect(url).toContain('fragrance=aroma1');
      // Encoded #FF0000
      expect(url).toContain('label=label1');
    });
  });

  describe('Return to Preview', () => {
    it('should set return to preview flag', () => {
      const { setReturnToPreview } = usePersonalizationStore.getState();
      setReturnToPreview(true);

      const state = usePersonalizationStore.getState();
      expect(state.returnToPreview).toBe(true);
    });

    it('should generate correct edit URLs from preview', () => {
      const { editFromPreview } = usePersonalizationStore.getState();

      expect(editFromPreview('impact')).toBe('/personalization/impact?from=preview');
      expect(editFromPreview('container')).toBe('/personalization/container?from=preview');
      expect(editFromPreview('fragrance')).toBe('/personalization/fragrance?from=preview');
      expect(editFromPreview('label')).toBe('/personalization/label?from=preview');
      expect(editFromPreview('message')).toBe('/personalization/message?from=preview');
      expect(editFromPreview('audio')).toBe('/personalization/audio?from=preview');
      expect(editFromPreview('name')).toBe('/personalization/name?from=preview');
      expect(editFromPreview('unknown')).toBe('/personalization/preview');
    });

    it('should set returnToPreview flag when editing from preview', () => {
      const { editFromPreview } = usePersonalizationStore.getState();
      editFromPreview('impact');

      const state = usePersonalizationStore.getState();
      expect(state.returnToPreview).toBe(true);
    });
  });

  describe('Storage Persistence', () => {
    it('should have persistence configuration', () => {
      // The store is configured with persist middleware
      const storeConfig = usePersonalizationStore.persist;
      expect(storeConfig).toBeDefined();
    });

    it('should handle storage rehydration errors', () => {
      const onRehydrateStorage = usePersonalizationStore.persist?.getOptions()?.onRehydrateStorage;
      if (onRehydrateStorage) {
        const callback = onRehydrateStorage();
        
        // Test error handling
        callback?.(null, new Error('Storage error'));
        expect(console.error).toHaveBeenCalledWith('Error rehydrating storage:', expect.any(Error));

        // Test successful rehydration
        const mockState = { _hasHydrated: false } as any;
        callback?.(mockState, null);
        expect(mockState._hasHydrated).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid step numbers', () => {
      const { canContinueFromStep, isStepCompleted, getStepUrl } = usePersonalizationStore.getState();

      expect(canContinueFromStep(0)).toBe(false);
      expect(canContinueFromStep(10)).toBe(false);
      expect(isStepCompleted(0)).toBe(false);
      expect(isStepCompleted(10)).toBe(false);
      expect(getStepUrl(0)).toContain('/personalization');
      expect(getStepUrl(10)).toContain('/personalization');
    });

    it('should handle empty or whitespace-only strings', () => {
      const { setMessage, setCandleName, isStepCompleted } = usePersonalizationStore.getState();

      setMessage('   ');
      setCandleName('   ');

      expect(isStepCompleted(6)).toBe(false); // Message step
      expect(isStepCompleted(8)).toBe(false); // Name step
    });
  });
});
