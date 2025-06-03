"use client";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* 404 Animation/Icon */}
        <div className="relative">
          <div className="text-9xl font-bold text-teal-200 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-2xl">🕯️</span>
            </div>
          </div>
        </div>        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#333333]">Página no encontrada</h1>
          <p className="text-gray-600">
            Lo sentimos, la página que buscas no existe o no tienes permisos para acceder a ella.
          </p>
        </div>        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2 border-[#4BBDB7] text-[#4BBDB7] hover:bg-[#4BBDB7] hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-[#4BBDB7] hover:bg-[#3A9B96] text-white"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500 mt-8">
          <p>Si crees que esto es un error, contacta al administrador.</p>
        </div>
      </div>
    </div>
  );
}
