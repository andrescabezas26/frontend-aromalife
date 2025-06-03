"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { ContainerService } from "@/services/containers/container.service";
import { Container as ServiceContainer } from "@/types/container";
import {
  usePersonalizationStore,
  Container,
} from "@/stores/personalization-store";
import { usePreviewNavigation } from "@/hooks/use-preview-navigation";

export default function ContenedorPage() {
  const router = useRouter();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);

  // Zustand store
  const {
    container: selectedContainer,
    setContainer,
    nextStep,
    getProgress,
  } = usePersonalizationStore();

  // Preview navigation
  const { fromPreview, handleNext, goBackToPreview } = usePreviewNavigation();

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        setLoading(true);
        const data = await ContainerService.getAll();
        // Map service containers to store containers (add missing fields)
        const mappedContainers: Container[] = data.map((container) => ({
          id: container.id ?? "",
          name: container.name ?? "",
          description: container.description ?? "",
          imageUrl: container.imageUrl || "/placeholder.svg",
          basePrice: container.basePrice ?? 0,
          dimensions: undefined, // Service doesn't provide dimensions
          createdAt: new Date().toISOString(), // Fallback since service doesn't provide
          updatedAt: new Date().toISOString(), // Fallback since service doesn't provide
        }));
        setContainers(mappedContainers);
      } catch (error) {
        console.error("Error fetching containers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContainers();
  }, []);

  const handleContinue = () => {
    if (selectedContainer) {
      if (!fromPreview) {
        nextStep();
      }
      handleNext("/personalization/fragrance");
    }
  };

  const handleSelectContainer = (container: Container) => {
    setContainer(container);
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
            {fromPreview ? "Editar Contenedor" : "Personaliza tu vela"}
          </h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">
            {fromPreview ? "Modificar selección" : "Paso 3 de 8"}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Elige tu contenedor favorito
          </h2>

          {loading ? (
            <div className="text-center">Cargando contenedores...</div>
          ) : (
            <div className="flex flex-col items-center space-y-8">
              {/* Candle mockup */}
              <div className="relative w-72 h-72 border rounded-lg flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 shadow-inner">
                {selectedContainer ? (
                  <div className="text-center space-y-3">
                    <Image
                      src={
                        selectedContainer.imageUrl ||
                        "/placeholder.svg?height=200&width=120"
                      }
                      width={140}
                      height={220}
                      alt={`Contenedor ${selectedContainer.name}`}
                      className="mx-auto object-contain"
                    />
                    <div className="space-y-1">
                      <p className="text-lg font-semibold">
                        {selectedContainer.name}
                      </p>
                      <p className="text-xl font-bold text-primary">
                        ${selectedContainer.basePrice?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-4xl">🕯️</span>
                    </div>
                    <p className="text-muted-foreground">
                      Selecciona un contenedor
                    </p>
                  </div>
                )}
              </div>

              {/* Container selection grid */}
              <div className="w-full max-w-4xl">
                <div className="flex flex-wrap justify-center gap-6">
                  {containers.map((container) => (
                    <div
                      key={container.id}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedContainer?.id === container.id
                          ? "scale-105"
                          : ""
                      }`}
                      onClick={() => handleSelectContainer(container)}
                    >
                      <Card
                        className={`w-56 h-80 ${
                          selectedContainer?.id === container.id
                            ? "ring-2 ring-primary shadow-lg border-primary"
                            : "hover:shadow-md"
                        }`}
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center h-full">
                          <div className="flex-1 flex flex-col justify-center items-center space-y-3">
                            <div className="w-24 h-24 flex items-center justify-center">
                              <Image
                                src={container.imageUrl || "/placeholder.svg"}
                                width={96}
                                height={96}
                                alt={container.name}
                                className="object-contain"
                              />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">
                                {container.name}
                              </h3>
                              {container.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {container.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto pt-4 border-t w-full">
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-primary">
                                ${container.basePrice?.toLocaleString() || "0"}
                              </span>
                              {selectedContainer?.id === container.id && (
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
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
                disabled={!selectedContainer || loading}
              >
                {fromPreview ? "Guardar Cambios" : "Siguiente: Fragancia"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
