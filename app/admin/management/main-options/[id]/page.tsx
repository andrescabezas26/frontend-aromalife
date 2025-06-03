"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MainOptionService } from "@/services/main-option/main-option.service"
import { MainOption } from "@/types/main-option"

export default function MainOptionViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [mainOption, setMainOption] = useState<MainOption | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const mainOptionId = params.id as string

  useEffect(() => {
    if (mainOptionId) {
      loadMainOption()
    }
  }, [mainOptionId])

  const loadMainOption = async () => {
    try {
      setIsLoading(true)
      const data = await MainOptionService.getById(mainOptionId)
      setMainOption(data)
    } catch (error) {
      console.error("Error loading main option:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la opción principal",
        variant: "destructive",
      })
      router.push("/admin/management/main-options")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando opción principal...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!mainOption) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Opción principal no encontrada</h2>
            <p className="text-gray-600 mt-2">La opción principal solicitada no existe</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push("/admin/management/main-options")}
            >
              Volver a Opciones Principales
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/management/main-options")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{mainOption.name}</h1>
            <p className="text-muted-foreground">
              Detalles de la opción principal
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Emoji Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Emoji
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                {mainOption.emoji ? (
                  <span className="text-6xl">{mainOption.emoji}</span>
                ) : (
                  <div className="text-center text-gray-400">
                    <Settings className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Sin emoji</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Información de la Opción Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre</h3>
                <p className="text-lg font-semibold">{mainOption.name}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                <p className="text-gray-900 leading-relaxed">
                  {mainOption.description || "Sin descripción disponible"}
                </p>
              </div>

              {/* Emoji Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Emoji</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{mainOption.emoji}</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Badge variant="outline" className="w-fit">
                  Creado: {
                    mainOption.createdAt
                      ? new Date(mainOption.createdAt).toLocaleDateString('es-CO')
                      : "Fecha no disponible"
                  }
                </Badge>

                <Button 
                  onClick={() => router.push(`/admin/management/main-options/${mainOption.id}/edit`)}
                  className="w-fit"
                >
                  Editar Opción Principal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
