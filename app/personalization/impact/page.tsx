"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { IntendedImpact } from "@/types/intended-impact";
import { IntendedImpactService } from "@/services/intended-impacts/intended-impact.service";
import { usePersonalizationStore } from "@/stores/personalization-store";
import { usePreviewNavigation } from "@/hooks/use-preview-navigation";

export default function EmocionPage() {
  const router = useRouter();
  const [emotions, setEmotions] = useState<IntendedImpact[]>([]);
  const [loading, setLoading] = useState(true);

  // Zustand store
  const {
    intendedImpact: selectedEmotion,
    mainOption,
    place,
    setIntendedImpact,
    nextStep,
    getProgress,
  } = usePersonalizationStore();

  // Preview navigation
  const { fromPreview, handleNext, goBackToPreview } = usePreviewNavigation();

  useEffect(() => {
    const fetchEmotions = async () => {
      const currentMainOptionId = mainOption?.id;
      const currentPlaceId = place?.id;

      if (!currentMainOptionId) {
        console.error("No mainOptionId found in store");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await IntendedImpactService.getByMainOption(
          currentMainOptionId,
          currentPlaceId
        );
        setEmotions(data);
      } catch (error) {
        console.error("Error fetching emotions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmotions();
  }, [mainOption, place]);

  const handleContinue = () => {
    if (selectedEmotion) {
      if (!fromPreview) {
        nextStep();
      }
      handleNext("/personalization/container");
    }
  };

  const handleSelectEmotion = (emotion: IntendedImpact) => {
    setIntendedImpact({
      id: emotion.id!,
      name: emotion.name,
      icon: emotion.icon,
      description: emotion.description,
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        {/* Header with preview indicator */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-between mb-4">
            {fromPreview && (
              <Button variant="outline" onClick={goBackToPreview}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Preview
              </Button>
            )}
            <div className="flex-1" />
          </div>

          <h1 className="text-3xl font-bold">
            {fromPreview ? "Editar Emoción" : "Personaliza tu vela"}
          </h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">
            {fromPreview ? "Modificar selección" : "Paso 2 de 8"}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            ¿Qué quieres sentir?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {emotions.map((emotion) => (
              <Card
                key={emotion.id}
                className={`cursor-pointer transition-all ${
                  selectedEmotion?.id === emotion.id
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => handleSelectEmotion(emotion)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <span className="text-4xl">{emotion.icon}</span>
                  <h3 className="font-medium text-lg">{emotion.name}</h3>
                </CardContent>
              </Card>
            ))}
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
                disabled={!selectedEmotion}
              >
                {fromPreview ? "Guardar Cambios" : "Continuar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
