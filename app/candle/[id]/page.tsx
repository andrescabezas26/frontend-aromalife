"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Music,
  Play,
  Pause,
  Volume2,
  Sparkles,
  MessageSquare,
  Palette,
  Home,
  ArrowLeft,
  Loader2,
  Box,
} from "lucide-react";
import { CandleViewer } from "@/components/3d/candle-viewer";
import { createQRRequestWithEntity } from "@/lib/axios";
interface CandlePageData {
  id: string;
  name: string;
  description?: string;
  message?: string;
  audioUrl?: string;
  qrCodeUrl?: string;
  qrUrl?: string; // Agregar para el QR
  modelUrl?: string; // Agregar para el modelo 3D personalizado
  container?: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  };
  aroma?: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  label?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}
interface CandlePageData {
  id: string;
  name: string;
  description?: string;
  message?: string;
  audioUrl?: string;
  qrCodeUrl?: string;
  qrUrl?: string; // Agregar para el QR
  modelUrl?: string; // Agregar para el modelo 3D personalizado
  container?: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  };
  aroma?: {
    id: string;
    name: string;
    description?: string;
    color?: string;
  };
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  label?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

// Main option messages based on the personalization store
const getMainOptionMessage = (candleName: string): string => {
  const messages = [
    `"${candleName}" fue creada con amor especialmente para ti`,
    `Esta vela "${candleName}" lleva un mensaje especial en su aroma`,
    `"${candleName}" es una creación única que despierta emociones`,
    `Cada momento con "${candleName}" está lleno de significado`,
    `"${candleName}" fue diseñada para crear momentos especiales`,
  ];

  // Use candle name length to pick a consistent message
  const index = candleName.length % messages.length;
  return messages[index];
};

export default function CandlePage() {
  const params = useParams();
  const candleId = params.id as string;

  const [candle, setCandle] = useState<CandlePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    if (!candleId) return;

    const fetchCandle = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the API client with proper error handling
        const candleRequest = createQRRequestWithEntity("vela");
        const response = await candleRequest.get(`/candles/qr/${candleId}`);

        const candleData: CandlePageData = response.data;
        setCandle(candleData);
      } catch (err) {
        console.error("Error fetching candle:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchCandle();
  }, [candleId]);

  const handleAudioPlay = () => {
    if (!candle?.audioUrl) return;

    if (audioElement) {
      if (audioPlaying) {
        audioElement.pause();
        setAudioPlaying(false);
      } else {
        audioElement
          .play()
          .then(() => {
            setAudioPlaying(true);
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
          });
      }
    } else {
      // Create new audio element
      const audio = new Audio(candle.audioUrl);
      audio.addEventListener("ended", () => {
        setAudioPlaying(false);
      });
      audio.addEventListener("error", () => {
        console.error("Error loading audio");
        setAudioPlaying(false);
      });
      setAudioElement(audio);
      audio
        .play()
        .then(() => {
          setAudioPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    }
  };

  const getSpotifyEmbedUrl = (audioUrl: string) => {
    // Extract Spotify track ID from URL
    const trackIdMatch = audioUrl.match(/track\/([a-zA-Z0-9]+)/);
    if (trackIdMatch) {
      return `https://open.spotify.com/embed/track/${trackIdMatch[1]}?utm_source=generator&theme=0`;
    }
    return null;
  };

  // Cleanup audio element on component unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
    };
  }, [audioElement]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-amber-600" />
          <p className="text-lg text-amber-800">
            Cargando tu vela personalizada...
          </p>
        </div>
      </div>
    );
  }

  if (error || !candle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-800">
            {error || "Vela no encontrada"}
          </h1>
          <p className="text-red-600">
            Lo sentimos, no pudimos encontrar la información de esta vela.
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-red-600 hover:bg-red-700"
          >
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  const isSpotifyUrl = candle.audioUrl?.includes("spotify.com");
  const spotifyEmbedUrl = isSpotifyUrl
    ? getSpotifyEmbedUrl(candle.audioUrl!)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-amber-500" />
              <h1 className="text-3xl font-bold text-gray-800">
                Experiencia Aromática
              </h1>
              <Sparkles className="h-8 w-8 text-amber-500" />
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                "{candle.name}"
              </h2>
              <p className="text-lg text-amber-700 italic">
                {getMainOptionMessage(candle.name)}
              </p>
            </div>
          </div>

          {/* Candle Visual */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Candle 3D Viewer */}
                <div className="flex-shrink-0">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Box className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Modelo 3D de tu Vela
                      </h3>
                    </div>

                    <CandleViewer
                      waxColor={candle.aroma?.color || "#F5F5F5"}
                      labelImageUrl={candle.label?.imageUrl}
                      messageText={candle.message}
                      showQR={!!candle.audioUrl}
                      qrUrl={
                        candle.qrUrl ||
                        candle.qrCodeUrl ||
                        "https://via.placeholder.com/100x100/000000/ffffff?text=QR"
                      }
                      width={320}
                      height={400}
                      autoRotate={true}
                      className="shadow-lg"
                    />

                    <p className="text-xs text-muted-foreground max-w-xs">
                      Puedes arrastrar para rotar la vela y usar la rueda del
                      ratón para hacer zoom
                    </p>
                  </div>
                </div>

                {/* Candle Details */}
                <div className="flex-1 space-y-6">
                  {/* Description */}
                  {candle.description && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Descripción
                      </h3>
                      <p className="text-gray-600">{candle.description}</p>
                    </div>
                  )}

                  {/* Fragrance */}
                  {candle.aroma && (
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-gray-200 shadow-sm"
                        style={{
                          backgroundColor: candle.aroma.color || "#F5F5F5",
                        }}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {candle.aroma.name}
                        </h3>
                        {candle.aroma.description && (
                          <p className="text-gray-600">
                            {candle.aroma.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Container */}
                  {candle.container && (
                    <div className="flex items-center gap-4">
                      {candle.container.imageUrl && (
                        <Image
                          src={candle.container.imageUrl}
                          width={48}
                          height={48}
                          alt={candle.container.name}
                          className="rounded-lg shadow-sm"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {candle.container.name}
                        </h3>
                        {candle.container.description && (
                          <p className="text-gray-600">
                            {candle.container.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  {candle.message && (
                    <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-amber-600" />
                        <h3 className="text-lg font-semibold text-amber-800">
                          Mensaje Especial
                        </h3>
                      </div>
                      <p className="text-amber-700 font-medium italic text-lg">
                        "{candle.message}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Section */}
          {candle.audioUrl && (
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-6 w-6 text-purple-500" />
                  Experiencia Sonora
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Esta vela incluye una experiencia sonora especial para
                  acompañar tu momento de relajación.
                </p>

                {isSpotifyUrl && spotifyEmbedUrl ? (
                  <div className="w-full">
                    <iframe
                      src={spotifyEmbedUrl}
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleAudioPlay}
                      className={`${
                        audioPlaying
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-purple-500 hover:bg-purple-600"
                      } text-white`}
                    >
                      {audioPlaying ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Pausar Audio
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Reproducir Audio
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Volume2 className="h-4 w-4" />
                      <span>Audio personalizado incluido</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <p className="text-gray-600 mb-4">
                ¡Disfruta de tu experiencia aromática personalizada!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Explorar más velas
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>AromaLife - Creando momentos especiales a través del aroma</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
