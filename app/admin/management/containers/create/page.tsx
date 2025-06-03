"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ContainerService} from "@/services/containers/container.service"
import { Container } from "@/types/container"
import { ContainerForm } from "@/components/containers/container-form"

export default function CreateContainerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (data: Container, file?: File) => {
    try {
      setIsLoading(true)
      // Use the appropriate service method based on whether file is provided
      if (file) {
        await ContainerService.createWithFile(data, file)
      } else {
        await ContainerService.create(data)
      }
      toast({
        title: "¡Contenedor creado exitosamente!",
        description: `El contenedor "${data.name}" ha sido creado correctamente.`,
      })
      router.push("/admin/management/containers")
    } catch (error: any) {
      console.error("Error creating container:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al crear contenedor",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
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
            <h1 className="text-3xl font-bold">Crear Nuevo Contenedor</h1>
            <p className="text-muted-foreground mt-2">
              Agrega un nuevo contenedor para las velas
            </p>
          </div>
        </div>

        <ContainerForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}