"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { labelsService, Label } from "@/services/labels/labels.service"
import { LabelsTable } from "@/components/labels/labels-table"

export default function LabelsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [labels, setLabels] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLabels()
  }, [])

  const loadLabels = async () => {
    try {
      setIsLoading(true)
      const data = await labelsService.getTemplateLabels()
      setLabels(data)
    } catch (error) {
      console.error("Error loading labels:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las etiquetas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (label: Label) => {
    try {
      if (!label.id) {
        throw new Error("La etiqueta no tiene un ID válido");
      }

      await labelsService.deleteLabel(label.id)

      toast({
        title: "Etiqueta eliminada",
        description: "La etiqueta ha sido eliminada correctamente",
      })

      loadLabels()
    } catch (error) {
      console.error("Error deleting label:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la etiqueta. Asegúrate de que no esté siendo utilizada por ninguna vela.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando etiquetas...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Etiquetas Plantilla</h1>
            <p className="text-muted-foreground">
              Gestiona las plantillas que el cliente puede escoger por defecto para su vela
            </p>
          </div>
          <Button onClick={() => router.push("/admin/management/labels/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Etiqueta
          </Button>
        </div>

        <LabelsTable 
          labels={labels}
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  )
}
