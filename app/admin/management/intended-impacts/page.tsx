"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Loader2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IntendedImpactService } from "@/services/intended-impacts/intended-impact.service"
import { IntendedImpactTableView } from "@/types/intended-impact"
import { IntendedImpactsTable } from "@/components/intended-impacts/intended-impacts-table"

export default function IntendedImpactsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [intendedImpacts, setIntendedImpacts] = useState<IntendedImpactTableView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadIntendedImpacts()
  }, [])

  const loadIntendedImpacts = async () => {
    try {
      setIsLoading(true)
      const data = await IntendedImpactService.getAllWithMainOptions()
      setIntendedImpacts(data)
    } catch (error) {
      console.error("Error loading intended impacts:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los impactos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (intendedImpact: IntendedImpactTableView) => {
    try {
      if (!intendedImpact.id) {
        throw new Error("El impacto no tiene un ID válido");
      }

      await IntendedImpactService.delete(intendedImpact.id)

      toast({
        title: "Impacto  eliminado",
        description: "El impacto  ha sido eliminado correctamente",
      })

      loadIntendedImpacts()
    } catch (error) {
      console.error("Error deleting intended impact:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el impacto, asegúrate de que no esté asociado a ningún aroma. En tal caso, desvincula el impacto de los aromas antes de eliminarlo en el menú Relaciones.",
        variant: "destructive",      })
    }
  }
  // Filtrar impactos por nombre o por opción principal
  const filteredIntendedImpacts = intendedImpacts.filter((impact) => {
    const searchTerm = searchQuery.toLowerCase()
    const matchesName = impact.name.toLowerCase().includes(searchTerm)
    const matchesMainOption = impact.mainOptionName?.toLowerCase().includes(searchTerm) || false
    return matchesName || matchesMainOption
  })

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando impactos...</span>
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
            <h1 className="text-3xl font-bold tracking-tight">Impactos</h1>
            <p className="text-muted-foreground">
              Gestiona los impactos disponibles para las velas
            </p>
          </div>
          <Button onClick={() => router.push("/admin/management/intended-impacts/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Impacto 
          </Button>        </div>

        {/* Barra de búsqueda */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />            <Input
              placeholder="Buscar por nombre o opción principal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <IntendedImpactsTable 
          intendedImpacts={filteredIntendedImpacts}
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  )
}