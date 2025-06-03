"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, Heart, Home, ArrowLeft } from "lucide-react";
import { usePersonalizationStore } from "@/stores/personalization-store";

export default function WelcomePage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  // Initialize store for fresh start
  const { reset } = usePersonalizationStore();

  const handleStart = async () => {
    setIsStarting(true);
    // Reset personalization state for a fresh start
    reset();
    // Small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/personalization");
  };

  const steps = [
    {
      icon: <Heart className="w-5 h-5" />,
      title: "¿Cómo te quieres sentir?",
      description: "Te preguntaremos sobre el estado de ánimo que buscas",
    },
    {
      icon: <Home className="w-5 h-5" />,
      title: "¿Dónde la vas a usar?",
      description: "Conoceremos el espacio donde disfrutarás tu vela",
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Personalización completa",
      description: "Elegiremos fragancia, contenedor y etiqueta perfectos",
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Personalización Inteligente
            </Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            ¡Vamos a crear tu vela perfecta!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Te haremos unas preguntas sencillas para recomendarte la combinación
            ideal de fragancia, contenedor y diseño que se adapte perfectamente
            a ti.
          </p>
        </div>

        {/* Process Steps */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-800">
              ¿Cómo funciona?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-3"
                >
                  <div className="relative">
                    <div className="bg-white rounded-full p-4 shadow-md text-blue-600">
                      {step.icon}
                    </div>
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Lo que obtendrás:
            </h3>
            <div className="space-y-3">
              {[
                "Recomendaciones personalizadas basadas en tus preferencias",
                "Fragancias que conectan con tu estado de ánimo deseado",
                "Diseño único que refleja tu personalidad",
                "Una vela completamente tuya en solo unos minutos",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
            <div className="text-center space-y-3">
              <div className="text-3xl">🕯️</div>
              <h4 className="font-semibold text-gray-800">
                ¡Solo toma 3-5 minutos!
              </h4>
              <p className="text-sm text-gray-600">
                Nuestro proceso inteligente hace que crear tu vela perfecta sea
                rápido y divertido.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-6">
          {/* Navigation */}

          <div className="text-center space-y-4">
            <Button
              size="lg"
              onClick={handleStart}
              disabled={isStarting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              {isStarting ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Comenzar Personalización
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500">
              Proceso completamente gratuito
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
