"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PlaceService } from "@/services/places/place.service"
import { Place } from "@/types/place"
import { PlaceForm } from "@/components/places/place-form"
import { RoleGuard } from "@/components/auth/role-guard"

export default function CreatePlacePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: Place) => {
    try {
      setIsLoading(true)
      await PlaceService.create(data)
      toast({
        title: "¡Lugar creado exitosamente!",
        description: `El lugar "${data.name}" ha sido creado correctamente.`,
      })
      router.push("/admin/management/places")
    } catch (error: any) {
      console.error("Error creating place:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al crear lugar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <RoleGuard requiredRoles={["admin", "manager"]} hideContent={false}>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Crear Nuevo Lugar</h1>
              <p className="text-muted-foreground mt-2">
                Agrega un nuevo lugar para las velas aromáticas
              </p>
            </div>
          </div>

          <PlaceForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </RoleGuard>
  )
}
