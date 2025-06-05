import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* Logo y Marca */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Image 
              src="https://res.cloudinary.com/dti5zalsf/image/upload/v1748554391/Dame_ese_logo_azul_s_ql9yey.png" 
              width={80} 
              height={80} 
              alt="Aromalife Logo"
              className="object-contain"
              priority
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-[#4BBDB7] text-2xl font-light tracking-wider">AROMALIFE</h1>
            <p className="text-[#333333] text-sm font-light tracking-wide">VELAS DECORATIVAS</p>
          </div>
        </div>

        {/* Tarjeta de Login */}
        <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl text-center text-gray-800">Iniciar sesión</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LoginForm />            <div className="text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" data-testid="register-link" className="text-[#4BBDB7] hover:text-[#3A9B96] font-medium transition-colors">
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 AromaLife. Todos los derechos reservados.</p>
        </div>
        
      </div>
    </div>
  )
}
