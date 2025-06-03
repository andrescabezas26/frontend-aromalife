import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SpotifyTrack } from "@/services/spotify/spotify.service";
import { AudioRecording, AudioUpload } from "@/services/audio/audio.service";

// Type definitions for the personalization store
export interface PersonalizationStep {
  step: number;
  isCompleted: boolean;
  data?: any;
}

export interface MainOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface IntendedImpact {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface Container {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  dimensions?: {
    height: number;
    width: number;
    depth: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Aroma {
  id: string;
  name: string;
  description: string;
  olfativePyramid: {
    salida: string;
    corazon: string;
    fondo: string;
  };
  imageUrl: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  type: "template" | "ai-generated" | "custom";
  aiPrompt?: string;
  isActive: boolean;
  container?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  // Propiedades para el flujo local (sin backend)
  isLocal?: boolean;
  localFile?: File;
  localPreview?: string;
  localPrompt?: string;
}

// Audio-related interfaces
export interface AudioSelection {
  id: string;
  type: "recording" | "upload" | "spotify" | "none";
  name: string;
  url?: string;
  duration?: number;
  createdAt: string;

  // For recordings and uploads
  localFile?: File | Blob;
  localUrl?: string;

  // For Spotify tracks
  spotifyTrack?: SpotifyTrack;

  // For uploaded audio
  cloudinaryUrl?: string;
  cloudinaryPublicId?: string;
}

export interface PersonalizationState {
  // Current step tracking
  currentStep: number;
  maxStepReached: number;

  // Return to preview tracking
  returnToPreview: boolean;

  // Hydration tracking to prevent SSR mismatches
  _hasHydrated: boolean;

  // Step 1: Main purpose selection
  mainOption: MainOption | null;

  // Step 2: Place selection (optional - only for decorate flow)
  place: Place | null;

  // Step 3: Intended impact/emotion selection
  intendedImpact: IntendedImpact | null;

  // Step 4: Container selection
  container: Container | null;

  // Step 5: Fragrance selection
  fragrance: Aroma | null;
  waxColor: string | null;

  // Step 6: Label selection
  label: Label | null;

  // Step 7: Message creation
  message: string;
  customPrompt: string;

  // Step 8: Audio selection
  audioSelection: AudioSelection | null;

  // Step 9: Candle name
  candleName: string;

  // Step 10: 3D Model (optional)
  modelFile: File | null;

  // Additional context data
  aromaData: any | null;
  emotionData: any | null;
  contextLoading: boolean;

  // Navigation helpers
  canGoToStep: (step: number) => boolean;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Step actions
  setMainOption: (option: MainOption) => void;
  setPlace: (place: Place | null) => void;
  setIntendedImpact: (impact: IntendedImpact) => void;
  setContainer: (container: Container) => void;
  setFragrance: (fragrance: Aroma, waxColor: string) => void;
  setLabel: (label: Label | null) => void;
  setMessage: (message: string) => void;
  setCustomPrompt: (prompt: string) => void;

  // Audio actions
  setAudioSelection: (audio: AudioSelection | null) => void;

  // Candle name action
  setCandleName: (name: string) => void;

  // 3D Model action
  setModelFile: (file: File | null) => void;

  // Context data actions
  setAromaData: (data: any) => void;
  setEmotionData: (data: any) => void;
  setContextLoading: (loading: boolean) => void;

  // Utility actions
  reset: () => void;
  canContinueFromStep: (step: number) => boolean;
  getStepUrl: (step: number) => string;
  isStepCompleted: (step: number) => boolean;

  // Return to preview functionality
  setReturnToPreview: (returnToPreview: boolean) => void;
  editFromPreview: (section: string) => string;

  // Progress calculation
  getProgress: () => number;
}

const initialState = {
  currentStep: 1,
  maxStepReached: 1,
  returnToPreview: false,
  mainOption: null,
  place: null,
  intendedImpact: null,
  container: null,
  fragrance: null,
  waxColor: null,
  label: null,
  message: "",
  customPrompt: "",
  audioSelection: null,
  candleName: "",
  modelFile: null,
  aromaData: null,
  emotionData: null,
  contextLoading: false,
  _hasHydrated: false,
};

export const usePersonalizationStore = create<PersonalizationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation helpers
      canGoToStep: (step: number) => {
        const state = get();
        return step <= state.maxStepReached;
      },

      goToStep: (step: number) => {
        const state = get();
        if (state.canGoToStep(step)) {
          set({ currentStep: step });
        }
      },

      nextStep: () => {
        const state = get();
        const nextStep = state.currentStep + 1;
        if (nextStep <= 8) {
          // Maximum step is 8 for main personalization flow
          set({
            currentStep: nextStep,
            maxStepReached: Math.max(state.maxStepReached, nextStep),
          });
        }
      },

      previousStep: () => {
        const state = get();
        const prevStep = state.currentStep - 1;
        if (prevStep >= 1) {
          set({ currentStep: prevStep });
        }
      },

      // Step actions
      setMainOption: (option: MainOption) => {
        set({
          mainOption: option,
          maxStepReached: Math.max(get().maxStepReached, 2),
        });
      },

      setPlace: (place: Place | null) => {
        set({
          place,
          maxStepReached: Math.max(get().maxStepReached, 2),
        });
      },

      setIntendedImpact: (impact: IntendedImpact) => {
        set({
          intendedImpact: impact,
          maxStepReached: Math.max(get().maxStepReached, 3),
        });
      },

      setContainer: (container: Container) => {
        set({
          container,
          maxStepReached: Math.max(get().maxStepReached, 4),
        });
      },

      setFragrance: (fragrance: Aroma, waxColor: string) => {
        set({
          fragrance,
          waxColor,
          maxStepReached: Math.max(get().maxStepReached, 5),
        });
      },

      setLabel: (label: Label | null) => {
        try {
          // Si es una etiqueta local con preview, verificar el espacio de almacenamiento
          if (label?.isLocal && label.localPreview) {
            const previewSize = label.localPreview.length * 2; // Aproximación del tamaño en bytes

            // Si es muy grande, crear una versión sin preview para la persistencia
            if (previewSize > 500000) {
              // Si es mayor a ~500KB
              console.warn(
                "Imagen muy grande para localStorage, se guardará sin preview"
              );
              // Crear copia sin el preview para evitar errores de cuota
              const labelWithoutPreview = {
                ...label,
                localPreview: undefined,
                imageUrl: "/placeholder.svg", // Fallback
              };

              set({
                label: labelWithoutPreview,
                maxStepReached: Math.max(get().maxStepReached, 6),
              });
              return;
            }
          }

          set({
            label,
            maxStepReached: label
              ? Math.max(get().maxStepReached, 6)
              : get().maxStepReached,
          });
        } catch (error) {
          console.error("Error saving label to storage:", error);

          // Si falla el guardado, intentar guardar sin el preview
          if (label?.isLocal) {
            const simplifiedLabel = {
              ...label,
              localPreview: undefined,
              localFile: undefined,
            };

            try {
              set({
                label: simplifiedLabel,
                maxStepReached: label
                  ? Math.max(get().maxStepReached, 6)
                  : get().maxStepReached,
              });
            } catch (secondError) {
              console.error(
                "Failed to save even simplified label:",
                secondError
              );
              // Como último recurso, guardar sin la etiqueta
              set({
                label: null,
                maxStepReached: get().maxStepReached,
              });
            }
          }
        }
      },

      setMessage: (message: string) => {
        set({ message });
      },

      setCustomPrompt: (prompt: string) => {
        set({ customPrompt: prompt });
      },

      // Audio actions
      setAudioSelection: (audioSelection: AudioSelection | null) => {
        try {
          // Handle cleanup of previous audio URLs
          const currentAudio = get().audioSelection;
          if (
            currentAudio?.localUrl &&
            currentAudio.localUrl.startsWith("blob:")
          ) {
            try {
              URL.revokeObjectURL(currentAudio.localUrl);
            } catch (e) {
              console.warn("Error revoking previous audio URL:", e);
            }
          }

          set({
            audioSelection,
            maxStepReached: audioSelection
              ? Math.max(get().maxStepReached, 7)
              : get().maxStepReached,
          });
        } catch (error) {
          console.error("Error saving audio selection:", error);

          // If storage fails, try to save a simplified version
          if (audioSelection) {
            try {
              const simplifiedAudio = {
                ...audioSelection,
                localFile: undefined,
                localUrl: undefined,
              };
              set({
                audioSelection: simplifiedAudio,
                maxStepReached: Math.max(get().maxStepReached, 7),
              });
            } catch (secondError) {
              console.error(
                "Failed to save even simplified audio:",
                secondError
              );
              // As last resort, clear audio selection
              set({
                audioSelection: null,
                maxStepReached: get().maxStepReached,
              });
            }
          }
        }
      },

      // Candle name action
      setCandleName: (name: string) => {
        set({
          candleName: name,
          maxStepReached: name.trim()
            ? Math.max(get().maxStepReached, 8)
            : get().maxStepReached,
        });
      },

      // 3D Model action
      setModelFile: (file: File | null) => {
        set({ modelFile: file });
      },

      // Context data actions
      setAromaData: (data: any) => {
        set({ aromaData: data });
      },

      setEmotionData: (data: any) => {
        set({ emotionData: data });
      },

      setContextLoading: (loading: boolean) => {
        set({ contextLoading: loading });
      },

      // Utility actions
      reset: () => {
        set(initialState);
      },

      canContinueFromStep: (step: number) => {
        const state = get();

        // Return false on server-side or before hydration to prevent hydration mismatches
        if (typeof window === "undefined" || !state._hasHydrated) {
          return false;
        }

        switch (step) {
          case 1:
            return !!state.mainOption;
          case 2:
            // Place is optional, only required for "decorate" flow
            return !!state.mainOption;
          case 3:
            return !!state.intendedImpact;
          case 4:
            return !!state.container;
          case 5:
            return !!state.fragrance;
          case 6:
            return !!state.label;
          case 7:
            return !!state.message.trim(); // Message is now mandatory
          case 8:
            return !!state.audioSelection; // Audio is now mandatory
          default:
            return false;
        }
      },

      getStepUrl: (step: number) => {
        const state = get();
        const params = new URLSearchParams();

        // Add common parameters
        if (state.mainOption)
          params.append("mainOptionId", state.mainOption.id);
        if (state.place) params.append("placeId", state.place.id);
        if (state.intendedImpact)
          params.append("emotion", state.intendedImpact.id);
        if (state.container) params.append("container", state.container.id);
        if (state.fragrance) {
          params.append("fragrance", state.fragrance.id);
          if (state.waxColor)
            params.append("waxColor", encodeURIComponent(state.waxColor));
        }
        if (state.label) params.append("label", state.label.id);
        if (state.message)
          params.append("message", encodeURIComponent(state.message));

        const query = params.toString() ? `?${params.toString()}` : "";

        switch (step) {
          case 1:
            return `/personalization${query}`;
          case 2:
            return `/personalization/impact${query}`;
          case 3:
            return `/personalization/container${query}`;
          case 4:
            return `/personalization/fragrance${query}`;
          case 5:
            return `/personalization/label${query}`;
          case 6:
            return `/personalization/message${query}`;
          case 7:
            return `/personalization/audio${query}`;
          case 8:
            return `/personalization/name${query}`;
          default:
            return `/personalization${query}`;
        }
      },

      isStepCompleted: (step: number) => {
        const state = get();

        switch (step) {
          case 1:
            return !!state.mainOption;
          case 2:
            return !!state.intendedImpact;
          case 3:
            return !!state.container;
          case 4:
            return !!state.fragrance;
          case 5:
            return !!state.label;
          case 6:
            return !!state.message.trim(); // Message is now mandatory
          case 7:
            return !!state.audioSelection; // Audio is now mandatory
          case 8:
            return !!state.candleName.trim(); // Name is required
          default:
            return false;
        }
      },

      // Progress calculation (out of 8 steps: 1-personalization, 2-place/impact, 3-impact, 4-container, 5-fragrance, 6-label, 7-message, 8-audio)
      getProgress: () => {
        const state = get();

        // Return 0 on server-side or before hydration to prevent hydration mismatches
        if (typeof window === "undefined") {
          return 0;
        }

        let completedSteps = 0;

        for (let i = 1; i <= 8; i++) {
          if (state.isStepCompleted(i)) {
            completedSteps++;
          } else {
            break; // Stop counting if we hit an incomplete step
          }
        }

        return Math.round((completedSteps / 8) * 100);
      },

      // Return to preview functionality
      setReturnToPreview: (returnToPreview: boolean) => {
        set({ returnToPreview });
      },

      editFromPreview: (section: string) => {
        const state = get();
        set({ returnToPreview: true });

        switch (section) {
          case "impact":
            return "/personalization/impact?from=preview";
          case "place":
            return "/personalization/decorate?from=preview";
          case "container":
            return "/personalization/container?from=preview";
          case "fragrance":
            return "/personalization/fragrance?from=preview";
          case "label":
            return "/personalization/label?from=preview";
          case "message":
            return "/personalization/message?from=preview";
          case "audio":
            return "/personalization/audio?from=preview";
          case "name":
            return "/personalization/name?from=preview";
          default:
            return "/personalization/preview";
        }
      },
    }),
    {
      name: "personalization-storage",
      // Only persist the essential data, not UI state or file objects
      partialize: (state) => {
        const baseData: {
          currentStep: number;
          maxStepReached: number;
          returnToPreview: boolean;
          mainOption: MainOption | null;
          place: Place | null;
          intendedImpact: IntendedImpact | null;
          container: Container | null;
          fragrance: Aroma | null;
          waxColor: string | null;
          message: string;
          customPrompt: string;
          label: Label | null;
          audioSelection: AudioSelection | null;
          candleName: string;
        } = {
          currentStep: state.currentStep,
          maxStepReached: state.maxStepReached,
          returnToPreview: state.returnToPreview,
          mainOption: state.mainOption,
          place: state.place,
          intendedImpact: state.intendedImpact,
          container: state.container,
          fragrance: state.fragrance,
          waxColor: state.waxColor,
          message: state.message,
          customPrompt: state.customPrompt,
          label: null,
          audioSelection: null,
          candleName: state.candleName,
        };

        // Para etiquetas, manejar cuidadosamente el tamaño
        if (state.label) {
          if (state.label.isLocal) {
            // Para etiquetas locales, intentar incluir preview solo si es pequeño
            const preview = state.label.localPreview;
            const shouldIncludePreview = preview && preview.length < 100000; // ~100KB límite

            baseData.label = {
              ...state.label,
              localFile: undefined, // Nunca persistir archivos
              localPreview: shouldIncludePreview ? preview : undefined,
              // Si no incluimos preview, asegurar que tengamos un fallback
              imageUrl: shouldIncludePreview
                ? state.label.imageUrl
                : "/placeholder.svg",
            };
          } else {
            // Para etiquetas del servidor, incluir normalmente
            baseData.label = state.label;
          }
        }

        // Para audio, manejar cuidadosamente el tamaño
        if (state.audioSelection) {
          // Para archivos de audio pequeños (recordings), intentar mantener el blob
          // Para archivos grandes (uploads), usar solo la URL
          if (
            state.audioSelection.type === "recording" &&
            state.audioSelection.localFile
          ) {
            // Para grabaciones, intentar mantener el blob si es pequeño (menos de 1MB)
            const blobSize =
              state.audioSelection.localFile instanceof Blob
                ? state.audioSelection.localFile.size
                : 0;

            if (blobSize > 0 && blobSize < 1024 * 1024) {
              // 1MB limit
              baseData.audioSelection = {
                ...state.audioSelection,
                localUrl: undefined, // Will be regenerated when needed
              };
            } else {
              // Si es muy grande, solo guardar metadatos
              baseData.audioSelection = {
                ...state.audioSelection,
                localFile: undefined,
                localUrl: undefined,
              };
            }
          } else {
            // Para uploads y otros tipos, no persistir archivos locales grandes
            baseData.audioSelection = {
              ...state.audioSelection,
              localFile: undefined,
              localUrl: undefined,
            };
          }
        }

        return baseData;
      },
      // Manejar errores de almacenamiento
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating storage:", error);
          // Limpiar storage si hay errores
          try {
            localStorage.removeItem("personalization-storage");
          } catch (e) {
            console.error("Failed to clear storage:", e);
          }
        } else if (state) {
          // Mark as hydrated after successful rehydration
          state._hasHydrated = true;
        }
      },
    }
  )
);
