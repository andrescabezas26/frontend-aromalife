"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Flower } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AromaService } from "@/services/aromas/aroma.service"
import { Aroma } from "@/types/aroma"

export default function AromaViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [aroma, setAroma] = useState<Aroma | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const aromaId = params.id as string

  useEffect(() => {
    if (aromaId) {
      loadAroma()
    }
  }, [aromaId])

  const loadAroma = async () => {
    try {
      setIsLoading(true)
      const data = await AromaService.getById(aromaId)
      setAroma(data)
    } catch (error) {
      console.error("Error loading aroma:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el aroma",
        variant: "destructive",
      })
      router.push("/admin/management/aromas")
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
            <span>Cargando aroma...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!aroma) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Aroma no encontrado</h2>
            <p className="text-gray-600 mt-2">El aroma solicitado no existe</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push("/admin/management/aromas")}
            >
              Volver a Aromas
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
            onClick={() => router.push("/admin/management/aromas")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 
            data-testid="aroma-details"
            className="text-3xl font-bold tracking-tight">{aroma.name}</h1>
            <p className="text-muted-foreground">
              Detalles del aroma
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Color Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flower className="h-5 w-5" />
                Color
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div 
                  className="w-32 h-32 rounded-lg border-4 border-gray-200 shadow-lg"
                  style={{ backgroundColor: aroma.color }}
                />
                <div className="text-center">
                  <p className="text-sm text-gray-500">Código de color</p>
                  <p className="font-mono text-lg font-semibold">{aroma.color}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle data-testid="aroma-info" >Información del Aroma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre</h3>
                <p className="text-lg font-semibold">{aroma.name}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                <p className="text-gray-900 leading-relaxed">
                  {aroma.description || "Sin descripción disponible"}
                </p>
              </div>

              {/* Pirámide Olfativa */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Pirámide Olfativa</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Notas de Salida</h4>
                    <p className="text-blue-800">{aroma.olfativePyramid.salida || "No especificado"}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Notas de Corazón</h4>
                    <p className="text-purple-800">{aroma.olfativePyramid.corazon || "No especificado"}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-2">Notas de Fondo</h4>
                    <p className="text-amber-800">{aroma.olfativePyramid.fondo || "No especificado"}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Badge variant="outline" className="w-fit">
                  Creado: {
                    aroma.createdAt
                      ? new Date(aroma.createdAt).toLocaleDateString('es-CO')
                      : "Fecha no disponible"
                  }
                </Badge>

                <Button 
                  onClick={() => router.push(`/admin/management/aromas/${aroma.id}/edit`)}
                  className="w-fit"
                >
                  Editar Aroma
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
