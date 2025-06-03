"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Check,
  Edit,
  Play,
  Pause,
  Sparkles as CandleIcon,
  Trash2,
  ArrowLeft,
  Music,
  Mic,
  Heart,
  Home,
  MapPin,
  Palette,
  Sparkles,
  MessageSquare,
  Loader2,
  Package,
  Upload,
} from "lucide-react";
import { usePersonalizationStore } from "@/stores/personalization-store";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/hooks/use-toast";
import { audioService } from "@/services/audio/audio.service";
import { CandleService } from "@/services/candles/candle.service";
import { CreateCandleWithFilesRequest } from "@/types/candle";
import { CandleViewer } from "@/components/3d/candle-viewer";
import { useCandleModelExport } from "@/hooks/use-candle-model-export";

export default function VistaPreviewPage() {
  const router = useRouter();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isCreatingCandle, setIsCreatingCandle] = useState(false);

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
    candleName,
    reset,
    nextStep,
    getProgress,
    editFromPreview,
    setCandleName,
  } = usePersonalizationStore();

  // Auth store
  const { user, isAuthenticated } = useAuthStore();

  // 3D Model export hook
  const { exportCandleModel } = useCandleModelExport();

  const handleCreateCandle = async () => {
    if (!candleName?.trim()) {
      toast({
        title: "Nombre de vela requerido",
        description: "Por favor, asigna un nombre a tu vela antes de crearla.",
        variant: "destructive",
      });
      router.push("/personalization/name");
      return;
    }

    if (!isAuthenticated || !user) {
      toast({
        title: "Autenticación requerida",
        description: "Debes iniciar sesión para crear una vela.",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    if (!container?.id || !fragrance?.id) {
      toast({
        title: "Datos incompletos",
        description:
          "Faltan datos necesarios para crear la vela. Por favor, completa la personalización.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingCandle(true);

    try {
      const totalPrice = container.basePrice || 0;

      // Handle audio
      let audioSpotify: string | undefined;
      let audioFile: File | undefined;

      if (audioSelection) {
        if (audioSelection.type === "spotify" && audioSelection.spotifyTrack) {
          audioSpotify = `https://open.spotify.com/track/${audioSelection.spotifyTrack.id}`;
        } else if (
          (audioSelection.type === "recording" ||
            audioSelection.type === "upload") &&
          audioSelection.localFile
        ) {
          audioFile =
            audioSelection.localFile instanceof File
              ? audioSelection.localFile
              : new File(
                  [audioSelection.localFile],
                  audioSelection.name || "audio.mp3",
                  {
                    type: audioSelection.localFile.type || "audio/mp3",
                  }
                );
        } else if (audioSelection.localUrl) {
          const response = await fetch(audioSelection.localUrl);
          const blob = await response.blob();
          audioFile = new File([blob], audioSelection.name || "audio.mp3", {
            type: blob.type,
          });
        }
      }

      // Handle label
      let labelFile: File | undefined;
      let labelId: string | undefined;

      if (label) {
        if (label.type === "custom" && label.localFile) {
          labelFile = label.localFile;
        } else if (label.type === "template") {
          labelId = label.id;
        } else if (label.type === "ai-generated" && label.imageUrl) {
          try {
            const response = await fetch(label.imageUrl);
            const blob = await response.blob();
            const fileName = label.aiPrompt
              ? `ai-label-${label.aiPrompt
                  .slice(0, 20)
                  .replace(/[^a-zA-Z0-9]/g, "-")}.${
                  blob.type.split("/")[1] || "png"
                }`
              : `ai-generated-label-${Date.now()}.${
                  blob.type.split("/")[1] || "png"
                }`;
            labelFile = new File([blob], fileName, {
              type: blob.type || "image/png",
            });
          } catch (error) {
            console.error("Error downloading AI-generated image:", error);
            toast({
              title: "Error al procesar la imagen",
              description:
                "No se pudo descargar la imagen generada por IA. Por favor, intenta de nuevo.",
              variant: "destructive",
            });
            setIsCreatingCandle(false);
            return;
          }
        }
      }

      // Generate 3D model automatically
      console.log("Generating 3D model for candle...");
      let generatedModelFile: File | undefined;

      try {
        generatedModelFile = await exportCandleModel({
          waxColor: fragrance?.color || waxColor || "#F5F5F5",
          labelImageUrl: label?.imageUrl,
          messageText: message,
          showQR: !!audioSelection,
          qrUrl: "https://via.placeholder.com/100x100/000000/ffffff?text=QR",
        });

        console.log(
          "3D model generated successfully:",
          generatedModelFile.name,
          generatedModelFile.size
        );

        toast({
          title: "Modelo 3D generado",
          description: "Se ha creado el modelo 3D personalizado de tu vela.",
          duration: 3000,
        });
      } catch (error) {
        console.warn("Failed to generate 3D model:", error);
        toast({
          title: "Advertencia",
          description:
            "No se pudo generar el modelo 3D, pero la vela se creará sin él.",
          variant: "default",
          duration: 5000,
        });
      }

      // Prepare candle data
      const candleData: CreateCandleWithFilesRequest = {
        name: candleName.trim(),
        description: `Vela personalizada con aroma ${fragrance.name}${
          message ? ` - ${message}` : ""
        }`,
        price: totalPrice,
        message: message || undefined,
        audioUrl: audioSpotify,
        containerId: container.id,
        aromaId: fragrance.id,
        userId: user.id,
        isActive: true,
        labelId,
        audioFile,
        labelFile,
        labelName: label?.name,
        labelDescription: label?.description,
        labelType: label?.type,
        labelAiPrompt: label?.aiPrompt,
        modelFile: generatedModelFile,
      };

      // Create candle
      const createdCandle = await CandleService.createWithFiles(candleData);

      toast({
        title: "¡Vela creada exitosamente!",
        description: `Tu vela "${candleName}" ha sido creada y guardada en tu perfil.`,
        duration: 5000,
      });

      reset();
      router.push("/mis-velas");
    } catch (error) {
      console.error("Error creating candle:", error);
      toast({
        title: "Error al crear la vela",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setIsCreatingCandle(false);
    }
  };

  const handleEdit = (section: string) => {
    const url = editFromPreview(section);
    router.push(url);
  };

  const handleDiscardPersonalization = () => {
    reset();
    toast({
      title: "Personalización descartada",
      description:
        "Se ha descartado tu personalización. Puedes empezar de nuevo.",
      duration: 3000,
    });
    router.push("/home");
  };

  const isAudioPlayable = (audioSelection: any) => {
    if (!audioSelection) return false;
    if (audioSelection.type === "spotify") return true; // Spotify has its own player

    // Check if we have any valid audio source
    return !!(
      audioSelection.url ||
      audioSelection.localUrl ||
      audioSelection.localFile ||
      audioSelection.cloudinaryUrl
    );
  };

  const handleAudioPlay = async () => {
    if (audioSelection?.type === "spotify") return;

    try {
      if (audioElement) {
        if (audioPlaying) {
          audioElement.pause();
          setAudioPlaying(false);
        } else {
          await audioElement.play();
          setAudioPlaying(true);
        }
      } else {
        let audioUrl = null;

        // For recordings and uploads, try to get a valid URL
        if (
          audioSelection?.type === "recording" ||
          audioSelection?.type === "upload"
        ) {
          // First try existing URLs if they're still valid
          if (audioSelection?.localUrl) {
            try {
              // Test if the blob URL is still valid
              const testAudio = new Audio(audioSelection.localUrl);
              testAudio.addEventListener("error", () => {
                throw new Error("Invalid blob URL");
              });
              audioUrl = audioSelection.localUrl;
            } catch {
              // Blob URL is invalid, will try other sources
            }
          }

          // If no valid localUrl, try the main url (for uploads from Cloudinary)
          if (!audioUrl && audioSelection?.url) {
            audioUrl = audioSelection.url;
          }

          // If we have a local file/blob, regenerate the URL
          if (!audioUrl && audioSelection?.localFile) {
            try {
              audioUrl = audioService.createSafeUrl(audioSelection.localFile);
              // Update the store with the new URL
              const updatedSelection = {
                ...audioSelection,
                localUrl: audioUrl,
              };
              // Note: We're not updating the store here to avoid potential loops
            } catch (error) {
              console.error("Error creating blob URL:", error);
            }
          }
        } else {
          // For other types, use the provided URL
          audioUrl = audioSelection?.url || audioSelection?.localUrl;
        }

        if (audioUrl) {
          const audio = new Audio(audioUrl);

          audio.addEventListener("ended", () => setAudioPlaying(false));
          audio.addEventListener("error", (e) => {
            console.error("Audio playback error:", e);
            toast({
              title: "Error",
              description:
                "No se pudo cargar el audio. El archivo puede haberse corrompido o no estar disponible.",
              variant: "destructive",
            });
            setAudioPlaying(false);
          });

          setAudioElement(audio);

          try {
            await audio.play();
            setAudioPlaying(true);
          } catch (playError) {
            console.error("Audio play error:", playError);
            toast({
              title: "Error de reproducción",
              description:
                "No se pudo reproducir el audio. Intenta grabarlo nuevamente.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Audio no disponible",
            description:
              "El audio seleccionado no está disponible. Por favor, selecciona o graba un nuevo audio.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error in handleAudioPlay:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar reproducir el audio",
        variant: "destructive",
      });
      setAudioPlaying(false);
    }
  };

  const getSpotifyEmbedUrl = (trackId: string) => {
    return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
  };

  // Cleanup effects
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
      audioService.cleanupAllUrls();
    };
  }, [audioElement]);

  const handlePreviewAudio = useCallback(
    (blob: Blob) => {
      if (currentAudioUrl) audioService.revokeSafeUrl(currentAudioUrl);
      const url = audioService.createSafeUrl(blob);
      setCurrentAudioUrl(url);
    },
    [currentAudioUrl]
  );

  const getAudioIcon = () => {
    if (!audioSelection) return <Music className="h-4 w-4" />;
    switch (audioSelection.type) {
      case "recording":
        return <Mic className="h-4 w-4 text-red-500" />;
      case "upload":
        return <Upload className="h-4 w-4 text-blue-500" />;
      case "spotify":
        return <Music className="h-4 w-4 text-green-500" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };

  const formatDuration = (seconds: number): string => {
    return audioService.formatDuration(seconds);
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header with progress */}
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Vista previa de tu vela
          </h1>
          <div className="flex flex-col items-center">
            <Progress value={getProgress()} className="w-full max-w-md h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Revisa tu creación
            </p>
          </div>
        </div>

        {/* Title and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold">¡Tu vela está lista!</h2>
          </div>

          <div className="flex gap-2">
            <Dialog
              open={showDiscardDialog}
              onOpenChange={setShowDiscardDialog}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Descartar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Descartar personalización?</DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground">
                  Perderás todos los cambios realizados hasta ahora.
                </p>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDiscardDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDiscardPersonalization}
                  >
                    Sí, descartar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Candle preview */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
                <CardTitle className="text-center text-amber-800">
                  Previsualización
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4 pt-6">
                <CandleViewer
                  waxColor={fragrance?.color || waxColor || "#F5F5F5"}
                  labelImageUrl={label?.imageUrl}
                  messageText={message}
                  showQR={!!audioSelection}
                  qrUrl="https://via.placeholder.com/100x100/000000/ffffff?text=QR"
                  width={280}
                  height={350}
                  autoRotate={true}
                  className="shadow-lg"
                />
              </CardContent>
            </Card>

            {/* Candle details */}
            <div className="text-center space-y-2 p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="font-medium text-lg">
                {candleName || "Mi vela personalizada"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {fragrance?.name || "Fragancia especial"}
              </p>

              <div className="flex items-center justify-center gap-2 mt-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: fragrance?.color || waxColor || "#F5F5F5",
                  }}
                />
                <span className="text-xs text-gray-500">{container?.name}</span>
              </div>

              {audioSelection && (
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                  {getAudioIcon()}
                  <span>Audio personalizado</span>
                </div>
              )}

              <div className="mt-4">
                <p className="text-lg font-semibold text-amber-700">
                  ${container?.basePrice?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Personalization details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main intention */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Intención principal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{mainOption?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mainOption?.description}
                    </p>
                  </div>
                  <span className="text-2xl">{mainOption?.emoji}</span>
                </div>
              </CardContent>
            </Card>

            {/* Emotional impact */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Emoción deseada
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("impact")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{intendedImpact?.icon}</span>
                  <div>
                    <p className="font-medium">{intendedImpact?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {intendedImpact?.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place (if selected) */}
            {place && (
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      Espacio
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit("place")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{place.imageUrl}</span>
                    <div>
                      <p className="font-medium">{place.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {place.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Container */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: "#DDD" }}
                    />
                    Contenedor
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("container")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      container?.imageUrl ||
                      "/placeholder.svg?height=80&width=80"
                    }
                    width={80}
                    height={80}
                    alt={container?.name || "Contenedor"}
                    className="rounded-lg border"
                  />
                  <div>
                    <p className="font-medium">{container?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {container?.description}
                    </p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      ${container?.basePrice?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fragrance */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-pink-500" />
                    Fragancia
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("fragrance")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-gray-200 flex-shrink-0"
                    style={{
                      backgroundColor:
                        fragrance?.color || waxColor || "#F5F5F5",
                    }}
                  />
                  <div>
                    <p className="font-medium">{fragrance?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {fragrance?.description}
                    </p>
                    {fragrance?.olfativePyramid && (
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        <div>
                          <span className="font-medium">Salida:</span>{" "}
                          {fragrance.olfativePyramid.salida}
                        </div>
                        <div>
                          <span className="font-medium">Corazón:</span>{" "}
                          {fragrance.olfativePyramid.corazon}
                        </div>
                        <div>
                          <span className="font-medium">Fondo:</span>{" "}
                          {fragrance.olfativePyramid.fondo}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Label */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded" />
                    Etiqueta
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("label")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={
                        label?.imageUrl || "/placeholder.svg?height=80&width=80"
                      }
                      width={80}
                      height={80}
                      alt="Etiqueta"
                      className="rounded-lg border object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">
                      {label?.name || "Etiqueta personalizada"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {label?.type === "ai-generated"
                        ? "Generada con IA"
                        : label?.type === "template"
                        ? "Plantilla seleccionada"
                        : "Personalizada"}
                    </p>
                    {label?.aiPrompt && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        "{label.aiPrompt}"
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message */}
            {message && (
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-indigo-500" />
                      Mensaje
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit("message")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="font-medium italic text-gray-700">
                    "{message}"
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Audio */}
            {audioSelection && (
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getAudioIcon()}
                      Audio
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit("audio")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{audioSelection.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {audioSelection.type === "recording" &&
                            "Grabación personal"}
                          {audioSelection.type === "upload" && "Archivo subido"}
                          {audioSelection.type === "spotify" &&
                            "Canción de Spotify"}
                          {audioSelection.duration &&
                            ` • ${formatDuration(audioSelection.duration)}`}
                        </p>
                      </div>
                      {audioSelection.type !== "spotify" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAudioPlay}
                          className="gap-1"
                          disabled={!isAudioPlayable(audioSelection)}
                        >
                          {audioPlaying ? (
                            <>
                              <Pause className="h-4 w-4" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              Escuchar
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {audioSelection.type === "spotify" &&
                      audioSelection.spotifyTrack?.id && (
                        <div className="mt-2">
                          <iframe
                            src={getSpotifyEmbedUrl(
                              audioSelection.spotifyTrack.id
                            )}
                            width="100%"
                            height="152"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="rounded-lg"
                          />
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3D Model Auto-generation Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="border-b border-blue-200">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Modelo 3D Automático
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">
                        Se generará automáticamente
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Al crear tu vela, se generará un modelo 3D personalizado
                        basado en tu diseño actual.
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Incluye:</strong> Color de cera personalizado,
                      etiqueta, mensaje y código QR
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candle name */}
            <Card
              className={!candleName?.trim() ? "border-red-200 bg-red-50" : ""}
            >
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles
                      className={`h-5 w-5 ${
                        !candleName?.trim() ? "text-red-500" : "text-yellow-500"
                      }`}
                    />
                    <span>Nombre de la vela</span>
                    {!candleName?.trim() && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                        Requerido
                      </span>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("name")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {candleName?.trim() ? (
                  <p className="font-medium text-lg text-gray-800">
                    "{candleName}"
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-red-600 font-medium">
                      Tu vela necesita un nombre
                    </p>
                    <p className="text-sm text-red-500">
                      Asigna un nombre único para poder crear tu vela.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warning if name is missing */}
            {!candleName?.trim() && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">
                      Falta un paso importante
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                      Dale un nombre único a tu vela para poder crearla.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit("name")}
                      className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Asignar nombre
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Final actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                size="lg"
                onClick={handleCreateCandle}
                disabled={!candleName?.trim() || isCreatingCandle}
                className={`flex-1 ${
                  !candleName?.trim()
                    ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                }`}
              >
                {isCreatingCandle ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creando vela...
                  </>
                ) : (
                  <>
                    <CandleIcon className="h-5 w-5 mr-2" />
                    Crear mi vela
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
