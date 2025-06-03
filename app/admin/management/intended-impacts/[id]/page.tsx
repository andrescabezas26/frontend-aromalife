"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Target, Edit, Hash, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IntendedImpactService } from "@/services/intended-impacts/intended-impact.service"
import { IntendedImpact } from "@/types/intended-impact"

export default function IntendedImpactViewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [intendedImpact, setIntendedImpact] = useState<IntendedImpact | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const intendedImpactId = params.id as string

  useEffect(() => {
    if (intendedImpactId) {
      loadIntendedImpact()
    }
  }, [intendedImpactId])

  const loadIntendedImpact = async () => {
    try {
      setIsLoading(true)
      const data = await IntendedImpactService.getById(intendedImpactId)
      setIntendedImpact(data)
    } catch (error) {
      console.error("Error loading intended impact:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el impacto ",
        variant: "destructive",
      })
      router.push("/admin/management/intended-impacts")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando impacto ...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!intendedImpact) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Impacto  no encontrado</h2>
            <p className="text-muted-foreground">El impacto  que buscas no existe.</p>
            <Button 
              onClick={() => router.push("/admin/management/intended-impacts")}
              className="mt-4"
            >
              Volver a la lista
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
            onClick={() => router.push("/admin/management/intended-impacts")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {intendedImpact.icon} {intendedImpact.name}
            </h1>
            <p className="text-muted-foreground">
              Detalles del impacto 
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Icon Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Icono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-lg border-4 border-gray-200 shadow-lg bg-gray-50 flex items-center justify-center">
                  <span className="text-6xl">{intendedImpact.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Información del Impacto 
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nombre</h3>
                <p className="text-lg font-semibold">{intendedImpact.name}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                <p className="text-gray-900 leading-relaxed">
                  {intendedImpact.description || "Sin descripción disponible"}
                </p>
              </div>

              {/* Main Option Information */}
              {intendedImpact.mainOption && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Opción Principal Asociada</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{intendedImpact.mainOption.emoji}</span>
                      <span className="text-lg font-medium">{intendedImpact.mainOption.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {intendedImpact.mainOption.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button 
                  onClick={() => router.push(`/admin/management/intended-impacts/${intendedImpactId}/edit`)}
                  className="w-fit"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Impacto 
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}