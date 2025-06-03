"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Candle } from "@/types/candle";
import {
  Calendar,
  Package,
  Palette,
  Tag,
  DollarSign,
  Music,
  MessageSquare,
  QrCode,
  User,
  Trash2,
  Box,
} from "lucide-react";
import { CandleViewer } from "@/components/3d/candle-viewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useState } from "react";

interface CandleDetailModalProps {
  candle: Candle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (candleId: string, candleName?: string) => void;
  isDeleting?: boolean;
}

export function CandleDetailModal({
  candle,
  open,
  onOpenChange,
  onDelete,
  isDeleting = false,
}: CandleDetailModalProps) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  if (!candle) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to check if audio URL is a Spotify link
  const isSpotifyUrl = (url: string) => {
    return url.includes("open.spotify.com/track/");
  };

  // Function to extract Spotify track ID from URL
  const getSpotifyTrackId = (url: string) => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  // Function to get Spotify embed URL
  const getSpotifyEmbedUrl = (trackId: string) => {
    return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
  };

  const handlePlayAudio = () => {
    if (candle.audioUrl && !isSpotifyUrl(candle.audioUrl)) {
      const audio = new Audio(candle.audioUrl);
      audio.play();
      setAudioPlaying(true);
      audio.onended = () => setAudioPlaying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {candle.name || `Vela #${candle.id}`}
                <Badge variant="secondary">Personalizada</Badge>
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Creada el {formatDate(candle.createdAt)}
              </DialogDescription>
            </div>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        Eliminando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </span>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar vela?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará
                      permanentemente la vela{" "}
                      <strong>
                        &quot;{candle.name || `#${candle.id}`}&quot;
                      </strong>{" "}
                      de tu cuenta.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDelete(candle.id, candle.name);
                        onOpenChange(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visualización 3D */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5 text-indigo-600" />
                Modelo 3D de tu Vela
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  3D
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-0">
              <div className="relative w-full">
                <CandleViewer
                  waxColor={candle.aroma?.color || "#F5F5F5"}
                  labelImageUrl={candle.label?.imageUrl}
                  messageText={candle.message}
                  showQR={!!candle.audioUrl}
                  qrUrl={
                    candle.qrUrl ||
                    "https://via.placeholder.com/100x100/000000/ffffff?text=QR"
                  }
                  width={320}
                  height={400}
                  autoRotate={true}
                  className="shadow-lg m-4 mx-auto"
                />
                <div className="text-center text-sm text-muted-foreground mt-2 mb-4">
                  <p>
                    Puedes arrastrar para rotar la vela y usar la rueda del
                    ratón para hacer zoom
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candle.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Descripción
                  </label>
                  <p className="text-sm mt-1">{candle.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Precio Total
                  </label>
                  <p className="text-xl font-bold text-primary flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {candle.price?.toLocaleString("es-ES") || "No disponible"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Última actualización
                  </label>
                  <p className="text-sm">{formatDate(candle.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aroma */}
          {candle.aroma && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  Aroma Seleccionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {" "}
                <div className="flex items-start gap-4">
                  {candle.aroma.color && (
                    <div
                      className="w-24 h-24 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: candle.aroma.color }}
                      title={`Color: ${candle.aroma.color}`}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {candle.aroma.name}
                    </h3>
                    {candle.aroma.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {candle.aroma.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenedor */}
          {candle.container && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Contenedor Seleccionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {candle.container.imageUrl && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image
                        src={candle.container.imageUrl}
                        alt={candle.container.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {candle.container.name}
                    </h3>
                    {candle.container.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {candle.container.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etiqueta */}
          {candle.label && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-green-600" />
                  Etiqueta Personalizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {candle.label.imageUrl && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image
                        src={candle.label.imageUrl}
                        alt={candle.label.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Tipo de etiqueta
                      </label>
                      <h3 className="font-semibold text-lg">
                        {candle.label.name}
                      </h3>
                    </div>

                    {candle.label.description && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Descripción
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {candle.label.description}
                        </p>
                      </div>
                    )}

                    {candle.label.text && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Texto personalizado
                        </label>
                        <p className="text-sm mt-1 bg-muted/50 p-3 rounded-lg italic">
                          &quot;{candle.label.text}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensaje personalizado */}
          {candle.message && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                  Mensaje Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm italic">&quot;{candle.message}&quot;</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio */}
          {candle.audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-pink-600" />
                  Audio Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSpotifyUrl(candle.audioUrl) ? (
                  // Spotify embed
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Canción de Spotify seleccionada para tu vela
                    </p>
                    {(() => {
                      const trackId = getSpotifyTrackId(candle.audioUrl);
                      return trackId ? (
                        <iframe
                          src={getSpotifyEmbedUrl(trackId)}
                          width="100%"
                          height="152"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() =>
                              window.open(candle.audioUrl, "_blank")
                            }
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Music className="h-4 w-4" />
                            Abrir en Spotify
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            Haz clic para escuchar en Spotify
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  // Regular audio controls
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handlePlayAudio}
                        disabled={audioPlaying}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Music className="h-4 w-4" />
                        {audioPlaying ? "Reproduciendo..." : "Reproducir Audio"}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Haz clic para escuchar el audio personalizado de tu vela
                      </p>
                    </div>

                    {/* HTML5 Audio Player for better control */}
                    <audio controls className="w-full" preload="metadata">
                      <source src={candle.audioUrl} type="audio/mpeg" />
                      <source src={candle.audioUrl} type="audio/wav" />
                      <source src={candle.audioUrl} type="audio/ogg" />
                      Tu navegador no soporta el elemento de audio.
                    </audio>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* QR Code */}
          {candle.qrUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-gray-600" />
                  Código QR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="relative w-48 h-48 border rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setQrModalOpen(true)}
                  >
                    <Image
                      src={candle.qrUrl}
                      alt="Código QR de la vela"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Código QR de tu vela</p>
                    <p className="text-sm text-muted-foreground">
                      Escanea este código para acceder a información adicional
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Haz clic en el QR para verlo en tamaño completo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del usuario */}
          {candle.user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Creador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Nombre:</span>{" "}
                    {candle.user.name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    {candle.user.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>

      {/* Modal de QR expandido */}
      {candle.qrUrl && (
        <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Código QR - {candle.name}
              </DialogTitle>
              <DialogDescription>
                Código QR de tu vela personalizada
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center p-4">
              <div className="relative w-80 h-80 border rounded-lg bg-white">
                <Image
                  src={candle.qrUrl}
                  alt="Código QR expandido"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Escanea este código QR para acceder a la información de tu vela
              </p>
              <Button
                variant="outline"
                onClick={() => window.open(candle.qrUrl, "_blank")}
                className="w-full"
              >
                Abrir imagen en nueva pestaña
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
