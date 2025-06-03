"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AromaService } from "@/services/aromas/aroma.service"
import { Aroma } from "@/types/aroma"
import { AromasTable } from "@/components/aromas/aromas-table"
import { RoleGuard } from "@/components/auth/role-guard"

export default function AromasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [aromas, setAromas] = useState<Aroma[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAromas()
  }, [])

  const loadAromas = async () => {
    try {
      setIsLoading(true)
      const data = await AromaService.getAll()
      setAromas(data)
    } catch (error) {
      console.error("Error loading aromas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los aromas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (aroma: Aroma) => {
    try {
      await AromaService.delete(aroma.id)
      toast({
        title: "Aroma eliminado",
        description: "El aroma ha sido eliminado correctamente",
      })
      loadAromas()
    } catch (error) {
      console.error("Error deleting aroma:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el aroma",
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
            <span>Cargando aromas...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aromas</h1>
            <p className="text-muted-foreground">
              Gestiona los aromas disponibles para las velas
            </p>
          </div>
          <Button onClick={() => router.push("/admin/management/aromas/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Aroma
          </Button>
        </div>

        <AromasTable 
          aromas={aromas}
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  )
} 