"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { CandleViewer } from "@/components/3d/candle-viewer";
import {
  Mic,
  Upload,
  Play,
  Pause,
  Square,
  Trash2,
  Download,
  Search,
  Music,
  Loader2,
  Volume2,
  ArrowLeft,
} from "lucide-react";
import { usePersonalizationStore } from "@/stores/personalization-store";
import {
  audioService,
  AudioRecording,
  AudioUpload,
} from "@/services/audio/audio.service";
import { SpotifyTrack } from "@/services/spotify/spotify.service";
import { audioCloudinaryService } from "@/services/audio/cloudinary.service";
import { SpotifyTab } from "@/components/spotify/spotify-tab";
import { usePreviewNavigation } from "@/hooks/use-preview-navigation";

export default function AudioPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview navigation
  const { fromPreview, handleNext } = usePreviewNavigation();

  // Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [currentRecording, setCurrentRecording] =
    useState<AudioRecording | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<AudioUpload | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // Spotify states
  const [selectedSpotifyTrack, setSelectedSpotifyTrack] =
    useState<SpotifyTrack | null>(null);

  // Audio playback states
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<
    Record<string, HTMLAudioElement>
  >({});

  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Zustand store
  const {
    mainOption,
    intendedImpact,
    place,
    container,
    fragrance,
    waxColor,
    label,
    message,
    audioSelection,
    setAudioSelection,
    nextStep,
    getProgress,
    canContinueFromStep,
  } = usePersonalizationStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop recording if in progress
      if (isRecording) {
        audioService.cancelRecording();
      }

      // Cleanup audio elements
      Object.values(audioElements).forEach((audio) => {
        audio.pause();
        audio.src = "";
        audio.load();
      });

      // Cleanup recording interval
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }

      // Cleanup URLs
      if (currentRecording) {
        URL.revokeObjectURL(currentRecording.url);
      }
      if (uploadedAudio) {
        URL.revokeObjectURL(uploadedAudio.url);
      }

      // Cleanup URLs when component unmounts
      audioService.cleanupAllUrls();
    };
  }, []);

  // Get recommendations on mount - removed, now handled by SpotifyTab
  // useEffect(() => {
  //   loadSpotifyRecommendations()
  // }, [intendedImpact])

  // Spotify functions - simplified for new component integration
  const selectSpotifyTrack = (track: SpotifyTrack) => {
    setSelectedSpotifyTrack(track);

    // Save to store
    const audioSelection = {
      id: `spotify-${track.id}`,
      type: "spotify" as const,
      name: `${track.artists[0]} - ${track.name}`,
      url: track.preview_url || track.external_url,
      duration: 30, // Default to 30 seconds for preview
      createdAt: new Date().toISOString(),
      spotifyTrack: track,
    };

    setAudioSelection(audioSelection);

    toast({
      title: "Canción de Spotify seleccionada",
      description: `${track.artists[0]} - ${track.name}`,
      duration: 3000,
    });
  };

  // Recording functions
  const startRecording = async () => {
    try {
      setRecordingTime(0);
      await audioService.startRecording();
      setIsRecording(true);

      // Start timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setRecordingInterval(interval);

      toast({
        title: "Grabación iniciada",
        description: "Habla cerca del micrófono",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description:
          "No se pudo iniciar la grabación. Verifica los permisos del micrófono.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    try {
      const recording = await audioService.stopRecording();
      setCurrentRecording(recording);
      setIsRecording(false);

      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }

      // Save to store
      const audioSelection = {
        id: recording.id,
        type: "recording" as const,
        name: recording.name,
        url: recording.url,
        duration: recording.duration,
        createdAt: recording.createdAt,
        localFile: recording.blob,
        localUrl: recording.url,
      };

      setAudioSelection(audioSelection);

      toast({
        title: "Grabación completada",
        description: `Duración: ${audioService.formatDuration(
          recording.duration || 0
        )}`,
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      toast({
        title: "Error",
        description: "Error al completar la grabación",
        variant: "destructive",
      });
    }
  };

  const cancelRecording = () => {
    audioService.cancelRecording();
    setIsRecording(false);
    setRecordingTime(0);

    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }

    // Clear any existing recording state
    if (currentRecording) {
      URL.revokeObjectURL(currentRecording.url);
      setCurrentRecording(null);
    }

    // Clear audio selection if it was a recording
    if (audioSelection?.type === "recording") {
      setAudioSelection(null);
    }

    toast({
      title: "Grabación cancelada",
      description: "La grabación ha sido cancelada",
    });
  };

  // File upload functions
  // Función auxiliar para procesar archivos de audio (compartida entre file select y drag & drop)
  const processAudioFile = async (file: File) => {
    try {
      setIsUploading(true);
      const audioUpload = await audioService.processAudioFile(file);
      setUploadedAudio(audioUpload);

      // Save to store
      const audioSelection = {
        id: audioUpload.id,
        type: "upload" as const,
        name: audioUpload.name,
        url: audioUpload.url,
        duration: audioUpload.duration,
        createdAt: audioUpload.createdAt,
        localFile: audioUpload.file,
        localUrl: audioUpload.url,
      };

      setAudioSelection(audioSelection);

      toast({
        title: "Archivo cargado",
        description: `${audioUpload.name} - ${audioService.formatFileSize(
          audioUpload.size
        )}`,
      });
    } catch (error) {
      console.error("Error processing audio file:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al procesar el archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(dragCounter + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      // Check if the dragged item is an audio file
      const hasAudioFile = Array.from(e.dataTransfer.items).some((item) =>
        item.type.startsWith("audio/")
      );
      if (hasAudioFile) {
        setIsDragOver(true);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(dragCounter - 1);
    if (dragCounter - 1 === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    if (isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Filter audio files
    const audioFiles = files.filter((file) => file.type.startsWith("audio/"));

    if (audioFiles.length === 0) {
      toast({
        title: "Error",
        description: "Por favor, arrastra solo archivos de audio",
        variant: "destructive",
      });
      return;
    }

    // Take the first audio file
    const file = audioFiles[0];
    await processAudioFile(file);
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processAudioFile(file);
  };

  // Audio playback functions
  const togglePlayback = async (audioUrl: string, audioId: string) => {
    try {
      // Stop any currently playing audio
      Object.entries(audioElements).forEach(([id, audio]) => {
        if (id !== audioId) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      let audio = audioElements[audioId];

      if (!audio) {
        audio = new Audio(audioUrl);

        // Add event listeners
        audio.addEventListener("ended", () => {
          setCurrentlyPlaying(null);
        });

        audio.addEventListener("error", (e) => {
          console.error("Audio playback error:", e);
          setCurrentlyPlaying(null);
          toast({
            title: "Error de reproducción",
            description: "No se pudo reproducir el audio",
            variant: "destructive",
          });
        });

        setAudioElements((prev) => ({ ...prev, [audioId]: audio }));
      }

      if (currentlyPlaying === audioId) {
        audio.pause();
        setCurrentlyPlaying(null);
      } else {
        await audio.play();
        setCurrentlyPlaying(audioId);
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      setCurrentlyPlaying(null);
      toast({
        title: "Error de reproducción",
        description: "No se pudo reproducir el audio",
        variant: "destructive",
      });
    }
  };

  const handleContinue = () => {
    if (fromPreview) {
      handleNext("/personalization/preview");
    } else {
      nextStep();
      handleNext("/personalization/name");
    }
  };

  const deleteRecording = () => {
    if (currentRecording) {
      // Stop and cleanup audio playback
      const audioId = `recording-${currentRecording.id}`;
      if (audioElements[audioId]) {
        audioElements[audioId].pause();
        audioElements[audioId].src = "";
        audioElements[audioId].load();

        // Remove from audioElements
        const newAudioElements = { ...audioElements };
        delete newAudioElements[audioId];
        setAudioElements(newAudioElements);
      }

      // Stop currently playing if it's this recording
      if (currentlyPlaying === audioId) {
        setCurrentlyPlaying(null);
      }

      // Cleanup URL and state
      URL.revokeObjectURL(currentRecording.url);
      setCurrentRecording(null);
      setAudioSelection(null);

      toast({
        title: "Grabación eliminada",
        description: "La grabación ha sido eliminada",
      });
    }
  };

  const deleteUpload = () => {
    if (uploadedAudio) {
      // Stop and cleanup audio playback
      const audioId = `upload-${uploadedAudio.id}`;
      if (audioElements[audioId]) {
        audioElements[audioId].pause();
        audioElements[audioId].src = "";
        audioElements[audioId].load();

        // Remove from audioElements
        const newAudioElements = { ...audioElements };
        delete newAudioElements[audioId];
        setAudioElements(newAudioElements);
      }

      // Stop currently playing if it's this upload
      if (currentlyPlaying === audioId) {
        setCurrentlyPlaying(null);
      }

      // Cleanup URL and state
      URL.revokeObjectURL(uploadedAudio.url);
      setUploadedAudio(null);
      setAudioSelection(null);

      toast({
        title: "Archivo eliminado",
        description: "El archivo ha sido eliminado",
      });
    }
  };

  const handleFinishRecording = useCallback(
    (blob: Blob) => {
      if (currentAudioUrl) {
        audioService.revokeSafeUrl(currentAudioUrl);
      }
      const url = audioService.createSafeUrl(blob);
      setCurrentAudioUrl(url);
      // ...rest of the handling code...
    },
    [currentAudioUrl]
  );

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">
            {fromPreview ? "Editar Audio" : "Personaliza tu vela"}
          </h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">Paso 7 de 8</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Agrega un mensaje sonoro
          </h2>
          <p className="text-center text-muted-foreground">
            Elige una de las opciones para continuar
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 3D Candle Viewer */}
            <div className="flex flex-col items-center justify-center">
              <CandleViewer
                waxColor={waxColor || "#F5F5F5"}
                labelImageUrl={label?.imageUrl}
                labelText={label?.name}
                messageText={message || undefined}
                showQR={!!audioSelection}
                qrUrl="generic"
                width={320}
                height={400}
                autoRotate={false}
                className="shadow-lg"
              />
              <p className="mt-4 text-sm text-muted-foreground text-center max-w-xs">
                Tu vela incluirá un código QR que enlaza al audio seleccionado
              </p>

              {/* Current selection display */}
              {audioSelection && (
                <Card className="mt-4 w-full max-w-xs">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {audioSelection.type === "recording" && (
                          <Mic className="h-5 w-5 text-red-500" />
                        )}
                        {audioSelection.type === "upload" && (
                          <Upload className="h-5 w-5 text-blue-500" />
                        )}
                        {audioSelection.type === "spotify" && (
                          <Music className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {audioSelection.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {audioService.formatDuration(
                            audioSelection.duration || 0
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Audio selection tabs */}
            <div className="space-y-6">
              <Tabs defaultValue="spotify" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-12">
                  <TabsTrigger
                    value="spotify"
                    className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                  >
                    <Music className="h-5 w-5" />
                    <span className="font-medium">Spotify</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="record"
                    className="flex items-center gap-2"
                  >
                    <Mic className="h-5 w-5" />
                    <span className="font-medium">Grabar</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="font-medium">Subir</span>
                  </TabsTrigger>
                </TabsList>

                {/* Spotify Tab - Now first and more prominent */}
                <TabsContent value="spotify" className="space-y-4 mt-6">
                  <SpotifyTab
                    onTrackSelect={selectSpotifyTrack}
                    selectedTrack={selectedSpotifyTrack}
                    intendedImpact={intendedImpact}
                  />
                </TabsContent>

                {/* Record Tab */}
                <TabsContent value="record" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                          <Mic
                            className={`h-10 w-10 ${
                              isRecording
                                ? "text-red-600 animate-pulse"
                                : "text-red-500"
                            }`}
                          />
                        </div>

                        {isRecording ? (
                          <div className="space-y-4">
                            <p className="text-lg font-medium text-red-600">
                              Grabando...
                            </p>
                            <p className="text-2xl font-mono">
                              {audioService.formatDuration(recordingTime)}
                            </p>
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="destructive"
                                onClick={stopRecording}
                              >
                                <Square className="h-4 w-4 mr-2" />
                                Detener
                              </Button>
                              <Button
                                variant="outline"
                                onClick={cancelRecording}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-lg font-medium">Grabar audio</p>
                            <p className="text-sm text-muted-foreground">
                              Graba un mensaje personal, máximo 30 segundos
                            </p>
                            <Button onClick={startRecording} size="lg">
                              <Mic className="h-4 w-4 mr-2" />
                              Iniciar grabación
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Recording preview */}
                      {currentRecording && !isRecording && (
                        <div className="mt-6 pt-6 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  togglePlayback(
                                    currentRecording.url,
                                    `recording-${currentRecording.id}`
                                  )
                                }
                              >
                                {currentlyPlaying ===
                                `recording-${currentRecording.id}` ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <div>
                                <p className="text-sm font-medium">
                                  {currentRecording.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {audioService.formatDuration(
                                    currentRecording.duration || 0
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const a = document.createElement("a");
                                  a.href = currentRecording.url;
                                  a.download = currentRecording.name;
                                  a.click();
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={deleteRecording}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Upload Tab */}
                <TabsContent value="upload" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragOver
                              ? "border-blue-400 bg-blue-50/50"
                              : "border-gray-300 hover:border-primary/50"
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                        >
                          <Upload
                            className={`h-12 w-12 mx-auto mb-4 ${
                              isDragOver
                                ? "text-blue-400"
                                : "text-muted-foreground"
                            }`}
                          />
                          <p
                            className={`text-lg font-medium mb-2 ${
                              isDragOver ? "text-blue-600" : ""
                            }`}
                          >
                            {isDragOver
                              ? "Suelta el archivo aquí"
                              : "Subir archivo de audio"}
                          </p>
                          <p
                            className={`text-sm mb-4 ${
                              isDragOver
                                ? "text-blue-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {isDragOver
                              ? "Suelta tu archivo de audio aquí"
                              : "Arrastra y suelta tu archivo aquí o haz clic para seleccionar"}
                          </p>
                          <Button variant="outline" disabled={isUploading}>
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Procesando...
                              </>
                            ) : (
                              "Seleccionar archivo"
                            )}
                          </Button>
                          <p
                            className={`text-xs mt-4 ${
                              isDragOver
                                ? "text-blue-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            Formatos soportados: MP3, WAV, M4A, OGG • Máximo
                            10MB
                          </p>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />

                        {/* Upload preview */}
                        {uploadedAudio && (
                          <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    togglePlayback(
                                      uploadedAudio.url,
                                      `upload-${uploadedAudio.id}`
                                    )
                                  }
                                >
                                  {currentlyPlaying ===
                                  `upload-${uploadedAudio.id}` ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <div>
                                  <p className="text-sm font-medium">
                                    {uploadedAudio.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {audioService.formatDuration(
                                      uploadedAudio.duration || 0
                                    )}{" "}
                                    •{" "}
                                    {audioService.formatFileSize(
                                      uploadedAudio.size || 0
                                    )}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={deleteUpload}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex justify-between items-center">
            {fromPreview && (
              <Button
                variant="outline"
                onClick={() => handleNext("/personalization/preview")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Preview
              </Button>
            )}
            {!fromPreview && (
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}

            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!audioSelection}
                className={
                  !audioSelection ? "opacity-50 cursor-not-allowed" : ""
                }
              >
                {fromPreview ? "Guardar Cambios" : "Siguiente: Nombre"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
