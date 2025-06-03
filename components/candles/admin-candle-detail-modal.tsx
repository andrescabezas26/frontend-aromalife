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
  Box,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { CandleViewer } from "@/components/3d/candle-viewer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { OrderItem } from "@/types/order";
import { CandleService } from "@/services/candles/candle.service";

interface AdminCandleDetailModalProps {
  candle: Candle | OrderItem['candle'] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCandleDetailModal({
  candle,
  open,
  onOpenChange,
}: AdminCandleDetailModalProps) {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [completeCandleData, setCompleteCandleData] = useState<Candle | null>(null);
  const [isLoadingCandleData, setIsLoadingCandleData] = useState(false);

  // Fetch complete candle data when modal opens
  useEffect(() => {
    const fetchCompleteCandleData = async () => {
      if (!open || !candle?.id) return;

      setIsLoadingCandleData(true);
      try {
        const fullCandleData = await CandleService.getById(candle.id);
        setCompleteCandleData(fullCandleData);
      } catch (error) {
        console.error('Error fetching complete candle data:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información completa de la vela.",
          variant: "destructive",
        });
        // Fallback to the original candle data
        setCompleteCandleData(candle as Candle);
      } finally {
        setIsLoadingCandleData(false);
      }
    };

    fetchCompleteCandleData();
  }, [open, candle?.id]);

  // Use complete candle data if available, otherwise fallback to original candle
  const displayCandle = completeCandleData || candle;

  if (!candle || !displayCandle) return null;

  // Show loading state while fetching complete candle data
  if (isLoadingCandleData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <span>Cargando información de la vela...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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

  // Function to download an image from URL
  const downloadImage = async (url: string, filename: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Descarga exitosa",
        description: `${filename} se ha descargado correctamente.`,
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error en la descarga",
        description: "No se pudo descargar la imagen. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadQR = () => {
    const qrUrl = (displayCandle as Candle).qrUrl;
    if (qrUrl) {
      downloadImage(qrUrl, `vela-${displayCandle.name}-qr.png`);
    }
  };

  const handleDownloadCandleImage = () => {
    // Use the complete candle data to ensure we have the label information
    const candleToUse = displayCandle;
    console.log("Candle data for download:", candleToUse);
    
    if (candleToUse?.label?.imageUrl) {
      downloadImage(candleToUse.label.imageUrl, `vela-${candleToUse.name}-etiqueta.png`);
    } else {
      toast({
        title: "Sin imagen disponible",
        description: "Esta vela no tiene imagen disponible para descargar.",
        variant: "destructive",
      });
    }
  };

  const handlePlayAudio = () => {
    const audioUrl = (displayCandle as Candle).audioUrl;
    if (audioUrl && !isSpotifyUrl(audioUrl)) {
      const audio = new Audio(audioUrl);
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
                {displayCandle.name || `Vela #${displayCandle.id}`}
                <Badge variant="secondary">Personalizada</Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Vista Admin
                </Badge>
              </DialogTitle>
              <DialogDescription className="space-y-3">
                <div className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {(displayCandle as Candle).createdAt ? 
                    `Creada el ${formatDate((displayCandle as Candle).createdAt)}` : 
                    'Vela personalizada'
                  }
                </div>
                <div className="text-black text-sm font-medium italic leading-relaxed bg-blue-50 p-3 rounded-lg border border-blue-200">
                  Esta página está destinada para que <span className="font-bold text-red-600">descargues</span> la imagen y el QR, y copies el mensaje del cliente para empezar con el proceso de crear la vela con los elementos seleccionados por el cliente.
                  <br />
                  Recuerda cambiar el estado a <span className="font-bold text-red-600">"En Proceso"</span> para que tu cliente esté actualizado de su compra.
                  <br />
                  Si necesitas más información, <span className="font-bold text-purple-600">contacta</span> al cliente directamente por medio de su whatsApp presente en la orden.
                </div>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {/* Download buttons for admin */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCandleImage}
                disabled={isDownloading}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {isDownloading ? "Descargando..." : "Imagen"}
              </Button>
              {(displayCandle as Candle).qrUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQR}
                  disabled={isDownloading}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sin Visualización 3D */}

          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(displayCandle as Candle).description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Descripción
                  </label>
                  <p className="text-sm mt-1">{(displayCandle as Candle).description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {(displayCandle as Candle).price && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Precio Total
                    </label>
                    <p className="text-xl font-bold text-primary flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {Number((displayCandle as Candle).price).toFixed(2)}
                    </p>
                  </div>
                )}
                {(displayCandle as Candle).updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Última actualización
                    </label>
                    <p className="text-sm">{formatDate((displayCandle as Candle).updatedAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Aroma */}
          {displayCandle.aroma && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  Aroma Seleccionado
                </CardTitle>
              </CardHeader>
              <CardContent>                <div className="flex items-start gap-4">
                  {displayCandle.aroma.color && (
                    <div 
                      className="w-24 h-24 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: displayCandle.aroma.color }}
                      title={`Color: ${displayCandle.aroma.color}`}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{displayCandle.aroma.name}</h3>
                    {(displayCandle.aroma as any)?.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {(displayCandle.aroma as any).description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenedor */}
          {displayCandle.container && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Contenedor Seleccionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {(displayCandle.container as any)?.imageUrl && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image
                        src={(displayCandle.container as any).imageUrl}
                        alt={displayCandle.container.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{displayCandle.container.name}</h3>
                    {(displayCandle.container as any)?.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {(displayCandle.container as any).description}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Etiqueta */}
          {displayCandle.label && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-green-600" />
                  Etiqueta Personalizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  {(displayCandle.label as any)?.imageUrl && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image
                        src={(displayCandle.label as any).imageUrl}
                        alt={displayCandle.label.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{displayCandle.label.name}</h3>
                      {(displayCandle.label as any)?.description && (
                        <p className="text-sm text-muted-foreground">
                          {(displayCandle.label as any).description}
                        </p>
                      )}
                    </div>

                    {(displayCandle.label as any)?.text && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Texto de la etiqueta
                        </label>
                        <p className="text-sm mt-1 italic">{(displayCandle.label as any).text}</p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const labelImageUrl = (displayCandle.label as any)?.imageUrl;
                        if (labelImageUrl) {
                          downloadImage(labelImageUrl, `etiqueta-${displayCandle.label!.name}.png`);
                        }
                      }}
                      disabled={!(displayCandle.label as any)?.imageUrl || isDownloading}
                      className="w-fit"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Etiqueta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensaje personalizado */}
          {displayCandle.message && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                  Mensaje Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm italic">&quot;{displayCandle.message}&quot;</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio */}
          {(displayCandle as Candle).audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-pink-600" />
                  Audio Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const audioUrl = (displayCandle as Candle).audioUrl;
                  if (!audioUrl) return null;
                  
                  return isSpotifyUrl(audioUrl) ? (
                    // Spotify embed
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enlace de Spotify configurado para esta vela
                      </p>
                      {(() => {
                        const trackId = getSpotifyTrackId(audioUrl);
                        return trackId ? (
                          <iframe
                            src={getSpotifyEmbedUrl(trackId)}
                            width="100%"
                            height="232"
                            frameBorder="0"
                            allowTransparency={true}
                            allow="encrypted-media"
                            className="rounded-lg"
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            URL de Spotify no válida
                          </p>
                        );
                      })()}
                    </div>
                  ) : (
                    // Regular audio controls
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Audio personalizado subido por el usuario
                      </p>

                      <audio controls className="w-full">
                        <source src={audioUrl} type="audio/mpeg" />
                        Tu navegador no soporta el elemento de audio.
                      </audio>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadImage(audioUrl, `audio-${displayCandle.name}.mp3`)}
                        disabled={isDownloading}
                        className="w-fit"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Audio
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* QR Code */}
          {(displayCandle as Candle).qrUrl && (
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
                      src={(displayCandle as Candle).qrUrl || ''}
                      alt="Código QR de la vela"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el QR para verlo en tamaño completo
                    </p>
                    
                    <Button
                      variant="outline"
                      onClick={handleDownloadQR}
                      disabled={isDownloading}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isDownloading ? "Descargando..." : "Descargar QR"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del usuario */}
          {(displayCandle as Candle).user && (
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
                    {(displayCandle as Candle).user?.name || "N/A"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    {(displayCandle as Candle).user?.email || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>

      {/* Modal de QR expandido */}
      {(displayCandle as Candle).qrUrl && (
        <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Código QR - {displayCandle.name}
              </DialogTitle>
              <DialogDescription>
                Código QR de la vela personalizada
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center p-4">
              <div className="relative w-80 h-80 border rounded-lg bg-white">
                <Image
                  src={(displayCandle as Candle).qrUrl || ''}
                  alt="Código QR expandido"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Escanea este código QR para acceder a la información de la vela
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const qrUrl = (displayCandle as Candle).qrUrl;
                    if (qrUrl) {
                      window.open(qrUrl, "_blank");
                    }
                  }}
                  className="flex-1"
                >
                  Abrir en nueva pestaña
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  disabled={isDownloading}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
