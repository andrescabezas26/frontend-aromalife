"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ContainerService } from "@/services/containers/container.service"
import { Container } from "@/types/container"
import { ContainersTable } from "@/components/containers/containers-table"
import { RoleGuard } from "@/components/auth/role-guard"

export default function ContainersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [containers, setContainers] = useState<Container[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadContainers()
  }, [])

  const loadContainers = async () => {
    try {
      setIsLoading(true)
      const data = await ContainerService.getAll()
      setContainers(data)
    } catch (error) {
      console.error("Error loading containers:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los contenedores",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (container: Container) => {
  try {
    if (!container.id) {
      throw new Error("El contenedor no tiene un ID válido");
    }

    await ContainerService.delete(container.id)

    toast({
      title: "Contenedor eliminado",
      description: "El contenedor ha sido eliminado correctamente",
    })

    loadContainers()
  } catch (error) {
    console.error("Error deleting container:", error)
    toast({
      title: "Error",
      description: "No se pudo eliminar el contenedor",
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
            <span>Cargando contenedores...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contenedores</h1>
            <p className="text-muted-foreground">
              Gestiona los contenedores disponibles para las velas
            </p>
          </div>
          <Button onClick={() => router.push("/admin/management/containers/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Contenedor
          </Button>
        </div>

        <ContainersTable 
          containers={containers}
          onDelete={handleDelete}
        />
      </div>
    </AdminLayout>
  )
}