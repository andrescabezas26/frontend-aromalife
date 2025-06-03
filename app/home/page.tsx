"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RoleGuard } from "@/components/auth/role-guard";
import { MainLayout } from "@/components/layouts/main-layout";

export default function HomePage() {
  const router = useRouter();

  return (
    <RoleGuard>
      <MainLayout showBackButton={false}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">Bienvenido a AromaLife</h1>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Opción 1: Personalización */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Personaliza tu vela</CardTitle>
                <CardDescription>
                  Crea una vela única con tus propias especificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src="https://res.cloudinary.com/dti5zalsf/image/upload/v1748382732/Captura_de_pantalla_2025-05-27_165114_gcflkf.png"
                      alt="Vela personalizada"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-gray-600">
                    Diseña tu vela desde cero eligiendo:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Forma y tamaño</li>
                    <li>Color y fragancia</li>
                    <li>Decoraciones personalizadas</li>
                    <li>Etiquetas y empaque</li>
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={() => router.push("/personalization/welcome")}
                  >
                    Comenzar personalización
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Opción 2: Catálogo */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Elige del catálogo</CardTitle>
                <CardDescription>
                  Explora nuestra colección de velas artesanales predefinidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src="https://res.cloudinary.com/dti5zalsf/image/upload/v1748381965/7505316-1536x749_cwqp2d.webp"
                      alt="Catálogo de velas"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-gray-600">
                    Descubre nuestras velas artesanales:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Diseños exclusivos</li>
                    <li>Fragancias seleccionadas</li>
                    <li>Alta calidad garantizada</li>
                    <li>Entrega inmediata</li>
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={() => window.open("https://www.velasaromatizadas.com/velas-aromaticas-artesanales/", "_blank")}
                  >
                    Ver catálogo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </RoleGuard>
  );
} 