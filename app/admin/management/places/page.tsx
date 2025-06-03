"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PlaceService } from "@/services/places/place.service"
import { Place } from "@/types/place"
import { PlacesTable } from "@/components/places/places-table"
import { RoleGuard } from "@/components/auth/role-guard"

export default function PlacesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPlaces()
  }, [])

  const loadPlaces = async () => {
    try {
      setIsLoading(true)
      const data = await PlaceService.getAll()
      setPlaces(data)
    } catch (error) {
      console.error("Error loading places:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los lugares",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (place: Place) => {
    try {
      if (!place.id) {
        throw new Error("El lugar no tiene un ID válido");
      }

      await PlaceService.delete(place.id)

      toast({
        title: "Lugar eliminado",
        description: "El lugar ha sido eliminado correctamente",
      })

      loadPlaces()
    } catch (error) {
      console.error("Error deleting place:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el lugar",
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
            <span>Cargando lugares...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }  return (
    <RoleGuard requiredRoles={["admin", "manager"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Lugares</h1>
              <p className="text-muted-foreground">
                Gestiona los lugares disponibles para la categoría "Quiero Decorar"
              </p>
            </div>
            <Button onClick={() => router.push("/admin/management/places/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Lugar
            </Button>
          </div>

          <PlacesTable 
            places={places}
            onDelete={handleDelete}
          />
        </div>
      </AdminLayout>
    </RoleGuard>
  )
}
