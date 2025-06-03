// Audio Recording and File Management Service

export interface AudioRecording {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  duration: number;
  type: "recording" | "upload";
  createdAt: string;
}

export interface AudioUpload extends AudioRecording {
  file: File;
  size: number;
}

class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordingChunks: Blob[] = [];
  private isRecording = false;
  private activeUrls: Set<string> = new Set();

  // Check if browser supports recording
  isRecordingSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      "MediaRecorder" in window
    );
  }

  // Start recording audio
  async startRecording(): Promise<void> {
    if (!this.isRecordingSupported()) {
      throw new Error("Audio recording is not supported in this browser");
    }

    if (this.isRecording) {
      throw new Error("Recording is already in progress");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.recordingChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error("Error starting recording:", error);
      throw new Error(
        "Failed to start recording. Please check microphone permissions."
      );
    }
  }

  // Stop recording and return the audio blob
  async stopRecording(): Promise<AudioRecording> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error("No recording in progress"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const tracks = this.mediaRecorder?.stream.getTracks();
        const cleanupStream = () => tracks?.forEach((track) => track.stop());

        if (this.recordingChunks.length === 0) {
          cleanupStream();
          resolve({
            id: `recording-${Date.now()}`,
            name: `Grabación ${new Date().toLocaleString()}`,
            blob: new Blob([], { type: "audio/webm;codecs=opus" }),
            url: "",
            duration: 0,
            type: "recording",
            createdAt: new Date().toISOString(),
          });
          this.isRecording = false;
          this.recordingChunks = [];
          return;
        }

        const blob = new Blob(this.recordingChunks, {
          type: "audio/webm;codecs=opus",
        });

        if (blob.size === 0) {
          cleanupStream();
          resolve({
            id: `recording-${Date.now()}`,
            name: `Grabación ${new Date().toLocaleString()}`,
            blob,
            url: "",
            duration: 0,
            type: "recording",
            createdAt: new Date().toISOString(),
          });
          this.isRecording = false;
          this.recordingChunks = [];
          return;
        }

        const url = this.createSafeUrl(blob);
        const audio = new Audio();

        const cleanupAudioElement = () => {
          audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
          audio.removeEventListener("error", handleError);
          audio.removeEventListener("canplaythrough", handleCanPlayThrough);
          audio.removeAttribute("src");
          try {
            audio.load();
          } catch (e) {
            console.warn("Error during audio element cleanup load:", e);
          }
        };

        const handleLoadedMetadata = () => {
          // Let's wait for canplaythrough to ensure duration is accurate
          if (audio.readyState >= 4) {
            handleCanPlayThrough();
          }
        };

        const handleCanPlayThrough = () => {
          const durationValue = audio.duration;
          // Use a fallback duration calculation if metadata isn't available
          const finalDuration =
            Number.isFinite(durationValue) && durationValue > 0
              ? durationValue
              : this.recordingChunks.reduce(
                  (acc, chunk) => acc + chunk.size,
                  0
                ) / 16000; // Assuming 16kHz sample rate

          cleanupAudioElement();
          cleanupStream();
          resolve({
            id: `recording-${Date.now()}`,
            name: `Grabación ${new Date().toLocaleString()}`,
            blob,
            url,
            duration: finalDuration,
            type: "recording",
            createdAt: new Date().toISOString(),
          });
        };

        const handleError = (event: Event) => {
          console.error(
            "Error loading audio metadata for recording. Audio element error:",
            audio.error,
            "Event:",
            event
          );
          cleanupAudioElement();
          cleanupStream();

          // If we fail to get duration through audio element, estimate it from chunk size
          const estimatedDuration =
            this.recordingChunks.reduce((acc, chunk) => acc + chunk.size, 0) /
            16000;

          resolve({
            id: `recording-${Date.now()}`,
            name: `Grabación ${new Date().toLocaleString()}`,
            blob,
            url,
            duration: estimatedDuration,
            type: "recording",
            createdAt: new Date().toISOString(),
          });
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("canplaythrough", handleCanPlayThrough);
        audio.addEventListener("error", handleError);

        audio.preload = "auto"; // Ensure metadata is loaded
        audio.src = url;
        audio.load();
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
      this.recordingChunks = []; // Clear chunks after stopping
    });
  }

  // Cancel recording
  cancelRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      this.isRecording = false;
      this.recordingChunks = [];
    }
  }

  // Process uploaded audio file
  async processAudioFile(file: File): Promise<AudioUpload> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith("audio/")) {
        reject(new Error("Please select a valid audio file"));
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        reject(new Error("File size must be less than 10MB"));
        return;
      }

      if (file.size === 0) {
        // Handle empty file directly
        resolve({
          id: `upload-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          blob: file,
          url: "", // No valid URL for an empty file in this context
          duration: 0,
          type: "upload",
          file,
          size: file.size,
          createdAt: new Date().toISOString(),
        });
        return;
      }

      const url = this.createSafeUrl(file);
      const audio = new Audio();

      const cleanupAudioElement = (revokeUrlIfError: boolean = false) => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("error", handleError);
        audio.removeAttribute("src");
        try {
          audio.load();
        } catch (e) {
          console.warn("Error during audio element cleanup load:", e);
        }
        if (revokeUrlIfError) {
          this.revokeSafeUrl(url);
        }
      };

      const handleLoadedMetadata = () => {
        const durationValue = audio.duration;
        const finalDuration =
          Number.isFinite(durationValue) && durationValue > 0
            ? durationValue
            : 0;

        const audioUpload: AudioUpload = {
          id: `upload-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          blob: file,
          url, // This URL will be used for playback and needs to be managed by the consumer
          duration: finalDuration,
          type: "upload",
          file,
          size: file.size,
          createdAt: new Date().toISOString(),
        };

        cleanupAudioElement(false); // URL is passed in audioUpload, so don't revoke here
        resolve(audioUpload);
      };

      const handleError = (event: Event) => {
        console.error(
          "Error loading audio metadata for file. Audio element error:",
          audio.error,
          "Event:",
          event
        );
        cleanupAudioElement(true); // URL will not be used, so revoke it
        reject(
          new Error(
            "Invalid audio file or format not supported. Could not read duration."
          )
        );
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("error", handleError);

      audio.src = url;
      audio.load();
    });
  }

  // Convert blob to file for upload
  blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, {
      type: blob.type,
      lastModified: Date.now(),
    });
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Format duration
  formatDuration(seconds: number): string {
    // Handle invalid or undefined values
    if (
      typeof seconds !== "number" ||
      isNaN(seconds) ||
      !isFinite(seconds) ||
      seconds < 0
    ) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  // Create URL safely and track it
  createSafeUrl(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.activeUrls.add(url);
    return url;
  }

  // Revoke URL safely
  revokeSafeUrl(url: string): void {
    if (url && url.startsWith("blob:") && this.activeUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.activeUrls.delete(url);
    }
  }

  // Cleanup all active URLs
  cleanupAllUrls(): void {
    this.activeUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn("Error revoking URL:", e);
      }
    });
    this.activeUrls.clear();
  }

  // Get recording status
  getRecordingStatus(): { isRecording: boolean; isSupported: boolean } {
    return {
      isRecording: this.isRecording,
      isSupported: this.isRecordingSupported(),
    };
  }
}

export const audioService = new AudioService();
