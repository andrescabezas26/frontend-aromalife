"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { MainOption } from "@/types/main-option";
import { MainOptionService } from "@/services/main-option/main-option.service";
import { usePersonalizationStore } from "@/stores/personalization-store";

export default function PersonalizarPage() {
  const router = useRouter();
  const [mainOptions, setMainOptions] = useState<MainOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Zustand store
  const {
    mainOption: selectedOption,
    setMainOption,
    setPlace,
    nextStep,
    getProgress,
  } = usePersonalizationStore();

  useEffect(() => {
    const fetchMainOptions = async () => {
      setLoading(true);
      const options = await MainOptionService.getAll();
      setMainOptions(options);
      setLoading(false);
    };

    fetchMainOptions();
  }, []);

  // Reset place when entering personalization to avoid conflicts
  useEffect(() => {
    setPlace(null);
  }, [setPlace]);

  const handleContinue = () => {
    if (!selectedOption) return;

    const optionName = selectedOption.name.toLowerCase();

    if (optionName.includes("sentir") || optionName.includes("emociones")) {
      nextStep();
      router.push(`/personalization/impact?mainOptionId=${selectedOption.id}`);
    } else if (
      optionName.includes("decorar") ||
      optionName.includes("espacios")
    ) {
      // Para el flujo decorar, no avanzamos de paso ya que la selección de lugar es parte del paso 1
      router.push(
        `/personalization/decorate?mainOptionId=${selectedOption.id}`
      );
    } else if (optionName.includes("regalo") || optionName.includes("gift")) {
      nextStep();
      router.push(`/personalization/impact?mainOptionId=${selectedOption.id}`);
    }
  };

  const handleSelectOption = (option: MainOption) => {
    setMainOption({
      id: option.id!,
      name: option.name,
      description: option.description || "",
      emoji: option.emoji || "",
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Personaliza tu vela</h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">Paso 1 de 8</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            ¿Por qué buscas una vela?
          </h2>

          {loading ? (
            <div className="text-center">Cargando opciones...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mainOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all ${
                    selectedOption?.id === option.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => handleSelectOption(option)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    <span className="text-4xl">{option.emoji}</span>
                    <h3 className="font-medium text-lg">{option.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={() => router.push("/personalization/welcome")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selectedOption}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
