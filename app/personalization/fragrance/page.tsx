"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft } from "lucide-react";
import { AromaService } from "@/services/aromas/aroma.service";
import { Aroma } from "@/types/aroma";
import { usePersonalizationStore } from "@/stores/personalization-store";
import { usePreviewNavigation } from "@/hooks/use-preview-navigation";
import { CandleViewer } from "@/components/3d/candle-viewer";

export default function FraganciaPage() {
  const router = useRouter();
  const [aromas, setAromas] = useState<Aroma[]>([]);
  const [loading, setLoading] = useState(true);
  const [waxColor, setWaxColor] = useState<string>("#F5F5F5");

  // Zustand store
  const {
    fragrance: selectedFragrance,
    mainOption,
    intendedImpact,
    place,
    setFragrance,
    nextStep,
    getProgress,
  } = usePersonalizationStore();

  // Preview navigation
  const { fromPreview, handleNext, goBackToPreview } = usePreviewNavigation();

  useEffect(() => {
    const fetchAromas = async () => {
      try {
        setLoading(true);
        let data: Aroma[] = [];

        // Priority 1: If we have emotion (intendedImpactId) from complete test, use most specific filtering
        if (intendedImpact?.id) {
          data = await AromaService.getAromasByCompleteTestResults(
            intendedImpact.id,
            mainOption?.id,
            place?.id
          );
        }
        // Priority 2: If we have mainOptionId but no emotion, use partial filtering
        else if (mainOption?.id) {
          data = await AromaService.getAromasByMainOption(
            mainOption.id,
            place?.id
          );
        }
        // Priority 3: Show all aromas if no filtering parameters
        else {
          data = await AromaService.getAll();
        }

        setAromas(data);
      } catch (error) {
        console.error("Error fetching aromas:", error);
        // Fallback to all aromas if filtering fails
        try {
          const fallbackData = await AromaService.getAll();
          setAromas(fallbackData);
        } catch (fallbackError) {
          console.error("Error fetching fallback aromas:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAromas();
  }, [intendedImpact, mainOption, place]);

  // Update wax color when fragrance changes
  useEffect(() => {
    if (selectedFragrance) {
      setWaxColor(selectedFragrance.color || "#F5F5F5");
    }
  }, [selectedFragrance]);

  const handleContinue = () => {
    if (selectedFragrance) {
      if (!fromPreview) {
        nextStep();
      }
      handleNext("/personalization/label");
    }
  };

  const handleSelectFragrance = (aroma: Aroma) => {
    // Ensure all required properties are present for the store Aroma type
    setFragrance(
      {
        id: aroma.id ?? "",
        name: aroma.name,
        description: aroma.description,
        olfativePyramid: aroma.olfativePyramid,
        imageUrl: aroma.imageUrl || "/placeholder.svg",
        color: aroma.color || waxColor,
        createdAt: aroma.createdAt
          ? typeof aroma.createdAt === "string"
            ? aroma.createdAt
            : aroma.createdAt.toISOString()
          : "",
        updatedAt: aroma.updatedAt
          ? typeof aroma.updatedAt === "string"
            ? aroma.updatedAt
            : aroma.updatedAt.toISOString()
          : "",
      },
      aroma.color || waxColor
    );
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
            {fromPreview ? "Editar Fragancia" : "Personaliza tu vela"}
          </h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">
            {fromPreview ? "Modificar selección" : "Paso 4 de 8"}
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">
              {mainOption
                ? "Estas son las fragancias recomendadas"
                : "Escoge la fragancia ideal"}
            </h2>
            {mainOption && (
              <p className="text-sm text-muted-foreground bg-blue-50 px-4 py-2 rounded-lg inline-block">
                ✨ Basadas en tus respuestas anteriores, estas fragancias son
                perfectas para ti
              </p>
            )}
          </div>

          {loading ? (
            <div className="text-center">Cargando fragancias...</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Candle 3D viewer with wax color */}
              <div className="flex-1 flex flex-col items-center">
                <CandleViewer
                  waxColor={selectedFragrance?.color || waxColor}
                  width={320}
                  height={400}
                  autoRotate={true}
                  className="shadow-lg"
                />
                <div className="mt-4 text-center space-y-2">
                  {selectedFragrance ? (
                    <>
                      <p className="text-lg font-medium">
                        {selectedFragrance.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Color de cera: {selectedFragrance.color || waxColor}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Selecciona una fragancia para ver la vela
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground text-center max-w-xs">
                  Vista previa 3D - El color de la cera cambia según la
                  fragancia seleccionada
                </p>
              </div>

              {/* Fragrance selection */}
              <div className="flex-1">
                <div className="grid gap-4">
                  {aromas.map((aroma) => {
                    const waxColor = aroma.color || "#F5F5F5";

                    return (
                      <Card
                        key={aroma.id}
                        className={`cursor-pointer transition-all ${
                          selectedFragrance?.id === aroma.id
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => handleSelectFragrance(aroma)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: waxColor }}
                            >
                              
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-lg">
                                {aroma.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {aroma.description}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Ver más
                            </Button>
                          </div>

                          {selectedFragrance?.id === aroma.id && (
                            <Accordion
                              type="single"
                              collapsible
                              className="mt-4"
                            >
                              <AccordionItem value="notes">
                                <AccordionTrigger>
                                  Pirámide Olfativa
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-medium">
                                        Notas de salida:
                                      </span>{" "}
                                      {aroma.olfativePyramid.salida}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Notas de corazón:
                                      </span>{" "}
                                      {aroma.olfativePyramid.corazon}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Notas de fondo:
                                      </span>{" "}
                                      {aroma.olfativePyramid.fondo}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
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
                disabled={!selectedFragrance || loading}
              >
                {fromPreview
                  ? "Guardar Cambios"
                  : "Siguiente: Imagen de etiqueta"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
