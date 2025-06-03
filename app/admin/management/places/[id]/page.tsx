"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PlaceService } from "@/services/places/place.service"
import { Place } from "@/types/place"
import { RoleGuard } from "@/components/auth/role-guard"

export default function PlaceViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [place, setPlace] = useState<Place | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const placeId = params.id as string

  useEffect(() => {
    if (placeId) {
      loadPlace()
    }
  }, [placeId])

  const loadPlace = async () => {
    try {
      setIsLoading(true)
      const data = await PlaceService.getById(placeId)
      setPlace(data)
    } catch (error) {
      console.error("Error loading place:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el lugar",
        variant: "destructive",
      })
      router.push("/admin/management/places")
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
            <span>Cargando lugar...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!place) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Lugar no encontrado</h2>
            <p className="text-gray-600 mt-2">El lugar solicitado no existe</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push("/admin/management/places")}
            >
              Volver a Lugares
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }  return (
    <RoleGuard requiredRoles={["admin", "manager"]} hideContent={false}>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/management/places")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{place.name}</h1>
              <p className="text-muted-foreground">
                Detalles del lugar
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Icon Section */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Icono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                  <span className="text-6xl">{place.icon}</span>
                </div>
              </CardContent>
            </Card>

            {/* Details Section */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Información del Lugar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre</h3>
                  <p className="text-lg font-semibold">{place.name}</p>
                </div>

                {/* Icon */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Icono</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{place.icon}</span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <Badge variant="outline" className="w-fit">
                    Creado: {
                      place.createdAt
                        ? new Date(place.createdAt).toLocaleDateString('es-CO')
                        : "Fecha no disponible"
                    }
                  </Badge>

                  <Button 
                    onClick={() => router.push(`/admin/management/places/${place.id}/edit`)}
                    className="w-fit"
                  >
                    Editar Lugar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  )
}
