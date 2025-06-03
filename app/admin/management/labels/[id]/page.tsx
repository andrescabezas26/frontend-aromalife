"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { labelsService, Label } from "@/services/labels/labels.service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

interface LabelDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function LabelDetailsPage({ params }: LabelDetailsPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const [label, setLabel] = useState<Label | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  useEffect(() => {
    loadLabel()
  }, [resolvedParams.id])

  const loadLabel = async () => {
    try {
      setIsLoading(true)
      const data = await labelsService.getLabelById(resolvedParams.id)
      setLabel(data)
    } catch (error) {
      console.error("Error loading label:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la etiqueta",
        variant: "destructive",
      })
      router.push("/admin/management/labels")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!label) return

    try {
      await labelsService.deleteLabel(label.id)
      toast({
        title: "Etiqueta eliminada",
        description: "La etiqueta ha sido eliminada correctamente",
      })
      router.push("/admin/management/labels")
    } catch (error) {
      console.error("Error deleting label:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la etiqueta. Asegúrate de que no esté siendo utilizada por ninguna vela.",
        variant: "destructive",
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "template":
        return "bg-blue-100 text-blue-800"
      case "ai-generated":
        return "bg-purple-100 text-purple-800"
      case "custom":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "template":
        return "Plantilla"
      case "ai-generated":
        return "IA"
      case "custom":
        return "Personalizada"
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando etiqueta...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!label) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Etiqueta no encontrada</h2>
          <p className="text-muted-foreground mb-6">
            La etiqueta que buscas no existe o ha sido eliminada.
          </p>
          <Button onClick={() => router.push("/admin/management/labels")}>
            Volver a Etiquetas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/management/labels")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Etiquetas
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {label.name}
              </h1>
              <p className="text-muted-foreground">
                Detalles de la etiqueta
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/admin/management/labels/edit/${label.id}`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirmation(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Label Image */}
            <Card>
              <CardHeader>
                <CardTitle>Imagen de la Etiqueta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80 relative rounded-lg overflow-hidden border">
                  <Image
                    src={label.imageUrl}
                    alt={label.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Label Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-lg font-semibold">{label.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Descripción</label>
                    <p className="text-sm text-gray-700">
                      {label.description || "Sin descripción"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo</label>
                    <div className="mt-1">
                      <Badge className={getTypeColor(label.type)}>
                        {getTypeLabel(label.type)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <div className="mt-1">
                      <Badge variant={label.isActive ? "default" : "secondary"}>
                        {label.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fechas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                    <p className="text-sm">
                      {label.createdAt 
                        ? new Date(label.createdAt).toLocaleString('es-CO')
                        : "Fecha no disponible"
                      }
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Última Actualización</label>
                    <p className="text-sm">
                      {label.updatedAt 
                        ? new Date(label.updatedAt).toLocaleString('es-CO')
                        : "Fecha no disponible"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la etiqueta
              "{label.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
