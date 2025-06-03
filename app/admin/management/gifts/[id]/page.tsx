"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Gift as GiftIcon} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GiftService } from "@/services/gifts/gift.service"
import { Gift } from "@/types/gift"

export default function GiftViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [gift, setGift] = useState<Gift | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const giftId = params.id as string

  useEffect(() => {
    if (giftId) {
      loadGift()
    }
  }, [giftId])

  const loadGift = async () => {
    try {
      setIsLoading(true)
      const data = await GiftService.getById(giftId)
      setGift(data)
    } catch (error) {
      console.error("Error loading gift:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el regalo",
        variant: "destructive",
      })
      router.push("/admin/management/gifts")
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
            <span>Cargando regalo...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!gift) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Regalo no encontrado</h2>
            <p className="text-gray-600 mt-2">El regalo solicitado no existe</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push("/admin/management/gifts")}
            >
              Volver a Regalos
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
            onClick={() => router.push("/admin/management/gifts")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{gift.name}</h1>
            <p className="text-muted-foreground">
              Detalles del regalo
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GiftIcon className="h-5 w-5" />
                Imagen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden">
                {gift.imageUrl && !imageError ? (
                  <Image
                    src={gift.imageUrl}
                    alt={gift.name || "Nombre no disponible"}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <GiftIcon className="h-12 w-12 mx-auto mb-2" />
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
              <CardTitle>Información del Regalo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre</h3>
                <p className="text-lg font-semibold">{gift.name}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                <p className="text-gray-900 leading-relaxed">
                  {gift.description || "Sin descripción disponible"}
                </p>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Precio Base</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(gift.price)}
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                

                <Button 
                  onClick={() => router.push(`/admin/management/gifts/${gift.id}/edit`)}
                  className="w-fit"
                >
                  Editar Regalo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
