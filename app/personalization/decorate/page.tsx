"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { Place } from "@/types/place";
import { PlaceService } from "@/services/places/place.service";
import { usePersonalizationStore } from "@/stores/personalization-store";
import { usePreviewNavigation } from "@/hooks/use-preview-navigation";

export default function DecorarPage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // Preview navigation
  const { fromPreview, handleNext } = usePreviewNavigation();

  // Zustand store
  const {
    place: selectedPlace,
    setPlace,
    nextStep,
    getProgress,
  } = usePersonalizationStore();

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        const data = await PlaceService.getAll();
        setSpaces(data);
      } catch (error) {
        console.error("Error fetching spaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  const handleContinue = () => {
    if (selectedPlace) {
      if (fromPreview) {
        handleNext("/personalization/preview");
      } else {
        nextStep();
        handleNext("/personalization/impact");
      }
    }
  };

  const handleSelectSpace = (space: Place) => {
    setPlace({
      id: space.id!,
      name: space.name,
      description: space.name,
      imageUrl: space.icon, // Using icon as imageUrl since store expects imageUrl
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">
            {fromPreview ? "Editar Lugar" : "Personaliza tu vela"}
          </h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">Paso 1 de 8</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            ¿Dónde la vas a usar?
          </h2>

          {loading ? (
            <div className="text-center">Cargando opciones...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {spaces.map((space) => (
                <Card
                  key={space.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlace?.id === space.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelectSpace(space)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <span className="text-4xl">{space.icon}</span>
                    <h3 className="font-medium text-lg">{space.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

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
                disabled={!selectedPlace}
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
