"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Wand2, Loader2, ArrowLeft } from "lucide-react";
import { aiService } from "@/services/ai/ai.service";
import { AromaService } from "@/services/aromas/aroma.service";
import { IntendedImpactService } from "@/services/intended-impacts/intended-impact.service";
import { usePersonalizationStore } from "@/stores/personalization-store";
import { usePreviewNavigation } from "@/hooks/use-preview-navigation";
import { CandleViewer } from "@/components/3d/candle-viewer";

export default function MensajePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  // Preview navigation
  const { fromPreview, handleNext } = usePreviewNavigation();

  // Zustand store - Sin más searchParams
  const {
    message,
    customPrompt,
    aromaData,
    emotionData,
    contextLoading,
    fragrance,
    waxColor,
    mainOption,
    intendedImpact,
    place,
    container,
    label,
    setMessage,
    setCustomPrompt,
    setAromaData,
    setEmotionData,
    setContextLoading,
    getProgress,
    nextStep,
    canContinueFromStep,
  } = usePersonalizationStore();

  // Fetch context data for better AI prompts - solo usando store
  useEffect(() => {
    const fetchContextData = async () => {
      try {
        setContextLoading(true);
        const promises = [];

        // Solo usar valores del store
        const currentFragrance = fragrance?.id;
        const currentEmotion = intendedImpact?.id;

        // Fetch aroma data if available
        if (currentFragrance) {
          promises.push(
            AromaService.getById(currentFragrance)
              .then((data: any) => setAromaData(data))
              .catch((err: any) =>
                console.warn("Could not fetch aroma data:", err)
              )
          );
        }

        // Fetch emotion/intended impact data if available
        if (currentEmotion) {
          promises.push(
            IntendedImpactService.getById(currentEmotion)
              .then((data: any) => setEmotionData(data))
              .catch((err: any) =>
                console.warn("Could not fetch emotion data:", err)
              )
          );
        }

        // Wait for all data fetching attempts
        await Promise.allSettled(promises);
      } catch (error) {
        console.error("Error fetching context data:", error);
      } finally {
        setContextLoading(false);
      }
    };

    fetchContextData();
  }, [fragrance, intendedImpact]);

  // First-person inspirational messages
  const firstPersonMessages = [
    "Hoy elijo crear mi propio espacio de paz y tranquilidad",
    "Respiro profundo y me permito sentir calma en cada momento",
    "Transformo mi energía en luz que ilumina mi camino",
    "Me rodeo de aromas que elevan mi espíritu y nutren mi alma",
    "Cada día es una nueva oportunidad para brillar con luz propia",
  ];

  const handleGenerateAI = async () => {
    try {
      setIsGenerating(true);

      // Build context from available data
      const context = {
        fragrance: fragrance?.id,
        aromaName: aromaData?.name,
        aromaDescription: aromaData?.description,
        emotion: intendedImpact?.id,
        emotionName: emotionData?.name,
        mainOptionId: mainOption?.id,
        placeId: place?.id,
        container: container?.id,
        waxColor: waxColor || undefined,
      };

      // Use custom prompt if provided, otherwise use context-aware generation
      const generatedMessage = customPrompt.trim()
        ? await aiService.generateText(customPrompt)
        : await aiService.generateInspirationalMessage(context);

      setMessage(generatedMessage);
    } catch (error) {
      console.error("Error generating AI message:", error);
      // Fallback to a default message on error
      setMessage("Hoy elijo crear mi propio espacio de paz y tranquilidad");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    if (fromPreview) {
      handleNext("/personalization/preview");
    } else {
      nextStep();
      handleNext("/personalization/audio");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">
            {fromPreview ? "Editar Mensaje" : "Personaliza tu vela"}
          </h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">Paso 6 de 8</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Mensaje Inspirador
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Candle 3D viewer */}
            <div className="flex-1 flex flex-col items-center">
              <CandleViewer
                waxColor={fragrance?.color || waxColor || "#F5F5F5"}
                labelImageUrl={label?.imageUrl}
                messageText={message}
                width={320}
                height={400}
                autoRotate={true}
                className="shadow-lg"
              />
              <div className="mt-4 text-center space-y-2">
                {message ? (
                  <>
                    <p className="text-lg font-medium">Mensaje aplicado</p>
                    <p className="text-sm text-muted-foreground italic">
                      "{message}"
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Agrega un mensaje personalizado
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center max-w-xs">
                Vista previa 3D - El mensaje aparecerá en la etiqueta de tu vela
              </p>
            </div>

            {/* Message input */}
            <div className="flex-1">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Mensaje inspirador en primera persona: *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Ej: Hoy elijo crear mi propio espacio de paz y tranquilidad..."
                      className="min-h-[120px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>
                        El mensaje debe estar en primera persona para crear una
                        conexión personal
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* AI Generation Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customPrompt">
                        Prompt personalizado (opcional):
                      </Label>
                      <Input
                        id="customPrompt"
                        placeholder="Ej: Genera un mensaje sobre encontrar paz interior..."
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {customPrompt.trim() ? (
                          "Se usará tu prompt personalizado"
                        ) : contextLoading ? (
                          "Cargando contexto..."
                        ) : (
                          <>
                            Se generará con contexto:
                            <br />
                            {emotionData?.name && (
                              <>
                                <strong>• Emoción:</strong> {emotionData.name}
                                <br />
                              </>
                            )}
                            {aromaData?.name && (
                              <>
                                <strong>• Fragancia:</strong> {aromaData.name}
                                <br />
                              </>
                            )}
                            {aromaData?.description && (
                              <>
                                <strong>• Descripción:</strong> "
                                {aromaData.description}"
                                <br />
                              </>
                            )}
                            {!emotionData?.name &&
                              !aromaData?.name &&
                              !aromaData?.description && (
                                <>
                                  <strong>• Contexto básico</strong>
                                </>
                              )}
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleGenerateAI}
                        disabled={isGenerating || contextLoading}
                        className="min-w-[140px]"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generar con IA
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Sugerencias predefinidas:</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {firstPersonMessages.map((msg, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="justify-start text-xs h-auto py-2 px-3 whitespace-normal text-left"
                          onClick={() => setMessage(msg)}
                        >
                          {msg}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
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
                disabled={!message.trim()}
                className={
                  !message.trim() ? "opacity-50 cursor-not-allowed" : ""
                }
              >
                {fromPreview ? "Guardar Cambios" : "Siguiente: Audio"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
