"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MainOptionService } from "@/services/main-option/main-option.service"
import { MainOption } from "@/types/main-option"
import { MainOptionsTable } from "@/components/main-options/main-options-table"

export default function MainOptionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mainOptions, setMainOptions] = useState<MainOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMainOptions()
  }, [])

  const loadMainOptions = async () => {
    try {
      setIsLoading(true)
      const data = await MainOptionService.getAll()
      setMainOptions(data)
    } catch (error) {
      console.error("Error loading main options:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las opciones principales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (mainOption: MainOption) => {
    try {
      if (!mainOption.id) {
        throw new Error("La opción principal no tiene un ID válido");
      }

      await MainOptionService.delete(mainOption.id)

      toast({
        title: "Opción principal eliminada",
        description: "La opción principal ha sido eliminada correctamente",
      })

      loadMainOptions()
    } catch (error) {
      console.error("Error deleting main option:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la opción principal, asegúrate de que no esté siendo utilizada por ningún impacto. En tal caso, elimina primero los impactos relacionados o asócialos a otra categororía.",
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
            <span>Cargando opciones principales...</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
            <p className="text-muted-foreground">
              Gestiona las opciones principales para la categorización de experiencias
            </p>
          </div>
          <Button onClick={() => router.push("/admin/management/main-options/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Opción Principal
          </Button>
        </div>

        <MainOptionsTable 
          mainOptions={mainOptions}
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  )
}
