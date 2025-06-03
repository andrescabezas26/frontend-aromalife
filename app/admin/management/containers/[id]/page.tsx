"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Package, Ruler } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ContainerService } from "@/services/containers/container.service"
import { Container } from "@/types/container"

export default function ContainerViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [container, setContainer] = useState<Container | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const containerId = params.id as string

  useEffect(() => {
    if (containerId) {
      loadContainer()
    }
  }, [containerId])

  const loadContainer = async () => {
    try {
      setIsLoading(true)
      const data = await ContainerService.getById(containerId)
      setContainer(data)
    } catch (error) {
      console.error("Error loading container:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el contenedor",
        variant: "destructive",
      })
      router.push("/admin/management/containers")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando contenedor...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!container) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Contenedor no encontrado</h2>
            <p className="text-gray-600 mt-2">El contenedor solicitado no existe</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push("/admin/management/containers")}
            >
              Volver a Contenedores
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
            onClick={() => router.push("/admin/management/containers")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{container.name}</h1>
            <p className="text-muted-foreground">
              Detalles del contenedor
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Imagen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden">
                {container.imageUrl && !imageError ? (
                  <Image
                    src={container.imageUrl}
                    alt={container.name || "Nombre no disponible"}

                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <Package className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Sin imagen</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Información del Contenedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre</h3>
                <p className="text-lg font-semibold">{container.name}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                <p className="text-gray-900 leading-relaxed">
                  {container.description || "Sin descripción disponible"}
                </p>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Precio Base</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(container.basePrice)}
                  </span>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Dimensiones</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Ruler className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Alto</p>
                      <p className="font-semibold">
                        {container.dimensions?.height ? `${container.dimensions.height} cm` : "No especificado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Ruler className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Ancho</p>
                      <p className="font-semibold">
                        {container.dimensions?.width ? `${container.dimensions.width} cm` : "No especificado"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Badge variant="outline" className="w-fit">
                  Creado: {
                    container.createdAt
                      ? new Date(container.createdAt).toLocaleDateString('es-CO')
                      : "Fecha no disponible"
                  }
                </Badge>

                <Button 
                  onClick={() => router.push(`/admin/management/containers/${container.id}/edit`)}
                  className="w-fit"
                >
                  Editar Contenedor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}