"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  Loader2,
  Wand2,
} from "lucide-react";
import { usePersonalizationStore } from "@/stores/personalization-store";
import { usePreviewNavigation } from "@/hooks/use-preview-navigation";
import { aiService, MessageContext } from "@/services/ai/ai.service";
import { toast } from "@/hooks/use-toast";

export default function CandleNamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localName, setLocalName] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [hasLoadedAI, setHasLoadedAI] = useState(false);

  // Preview navigation
  const { fromPreview, handleNext } = usePreviewNavigation();

  const {
    candleName,
    setCandleName,
    nextStep,
    previousStep,
    getProgress,
    // Store data for AI context
    mainOption,
    intendedImpact,
    place,
    container,
    fragrance,
    waxColor,
  } = usePersonalizationStore();

  useEffect(() => {
    setLocalName(candleName);
  }, [candleName]);

  // Generate AI suggestions based on user's personalization data
  const generateAISuggestions = async () => {
    if (isLoadingAI || hasLoadedAI) return;

    setIsLoadingAI(true);
    try {
      const context: MessageContext = {
        aromaName: fragrance?.name,
        aromaDescription: fragrance?.description,
        emotionName: intendedImpact?.name,
        mainOptionName: mainOption?.name,
        placeName: place?.name,
        containerName: container?.name,
        waxColor: waxColor || undefined,
      };

      const suggestions = await aiService.generateCandleNames(context, 6);
      setAiSuggestions(suggestions);
      setHasLoadedAI(true);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron generar sugerencias automáticas. Puedes escribir tu propio nombre.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Load AI suggestions when component mounts
  useEffect(() => {
    if (!hasLoadedAI && !isLoadingAI) {
      generateAISuggestions();
    }
  }, [hasLoadedAI, isLoadingAI]);

  const handleContinue = () => {
    const trimmedName = localName.trim();

    // Validate that name is not empty
    if (!trimmedName) {
      toast({
        title: "Nombre requerido",
        description:
          "Por favor, ingresa un nombre para tu vela antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Save the candle name
    setCandleName(trimmedName);

    if (fromPreview) {
      handleNext("/personalization/preview");
    } else {
      nextStep();
      handleNext("/personalization/preview");
    }
  };

  const handleBack = () => {
    // Save current name before going back
    setCandleName(localName.trim());

    if (fromPreview) {
      handleNext("/personalization/preview");
    } else {
      previousStep();
      handleNext("/personalization/audio");
    }
  };

  const handleSkip = () => {
    // Removed - name is now required
    toast({
      title: "Nombre requerido",
      description: "El nombre de la vela es obligatorio para continuar.",
      variant: "destructive",
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Personaliza tu vela</h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">Paso 8 de 8</p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Sparkles className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                Dale un nombre especial a tu vela
              </CardTitle>
              <p className="text-muted-foreground">
                Un nombre personalizado es requerido para completar tu vela
                única
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="candle-name" className="text-base font-medium">
                  ¿Cómo quieres llamar a tu vela?
                </Label>

                <Input
                  id="candle-name"
                  placeholder="Ej: Mi vela especial, Recuerdos de hogar, Momento de paz..."
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  maxLength={50}
                  className="text-lg py-6"
                />

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Este campo es obligatorio</span>
                  <span>{localName.length}/50 caracteres</span>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Sugerencias personalizadas con IA:
                  </p>
                  {!hasLoadedAI && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateAISuggestions}
                      disabled={isLoadingAI}
                    >
                      {isLoadingAI ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-3 w-3 mr-2" />
                          Generar con IA
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {isLoadingAI && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Generando nombres únicos para tu vela...
                    </span>
                  </div>
                )}

                {aiSuggestions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <Button
                        key={`ai-${index}`}
                        variant="outline"
                        size="sm"
                        onClick={() => setLocalName(suggestion)}
                        className="justify-start h-auto py-2 px-3 text-left bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                      >
                        <Wand2 className="h-3 w-3 mr-2 text-purple-500" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}

                {!isLoadingAI && aiSuggestions.length === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Mi momento zen",
                      "Recuerdos de casa",
                      "Paz interior",
                      "Aromática especial",
                      "Mi refugio",
                      "Esencia personal",
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setLocalName(suggestion)}
                        className="justify-start h-auto py-2 px-3 text-left"
                      >
                        <Heart className="h-3 w-3 mr-2 text-pink-500" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview */}
              {localName.trim() && (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-muted-foreground mb-1">
                    Vista previa:
                  </p>
                  <p className="text-lg font-medium text-yellow-800">
                    {localName.trim()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 max-w-2xl mx-auto">
          {fromPreview && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="order-2 sm:order-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Preview
            </Button>
          )}
          {!fromPreview && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="order-2 sm:order-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}

          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              onClick={handleContinue}
              disabled={!localName.trim()}
              className={
                !localName.trim() ? "opacity-50 cursor-not-allowed" : ""
              }
            >
              {fromPreview ? "Guardar" : "Siguiente: Vela"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
