"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/layouts/main-layout"

export default function WelcomePage() {
  return (

      <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-10">
        {/* Logo y Marca */}
        <div className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center">
            <Image 
              src="https://res.cloudinary.com/dti5zalsf/image/upload/v1748554391/Dame_ese_logo_azul_s_ql9yey.png" 
              width={120} 
              height={120} 
              alt="Aromalife Logo"
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-[#4BBDB7] text-4xl font-light tracking-wider">AROMALIFE</h1>
            <p className="text-[#333333] text-lg font-light tracking-wide">VELAS DECORATIVAS</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800">
              Bienvenido a AromaLife
            </h2>
            <p className="text-xl text-muted-foreground">
              Descubre el poder de los aromas para transformar tu vida
            </p>
          </div>
        </div>        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <Card className="flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Iniciar Sesión</CardTitle>
              <CardDescription>
                Accede a tu cuenta para gestionar tus pedidos y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <Link href="/login" className="w-full">
                <Button className="w-full bg-[#4BBDB7] hover:bg-[#3A9B96] text-white">Iniciar Sesión</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Registrarse</CardTitle>
              <CardDescription>
                Crea una cuenta para comenzar tu viaje aromático
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full border-[#4BBDB7] text-[#4BBDB7] hover:bg-[#4BBDB7] hover:text-white">
                  Registrarse
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}

