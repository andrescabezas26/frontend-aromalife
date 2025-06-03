import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ContainerService } from "@/services/containers/container.service"
import { Container } from "@/types/container"
import { ContainerForm } from "./container-form"

interface EditContainerFormProps {
  containerId: string
}

export function EditContainerForm({ containerId }: EditContainerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [container, setContainer] = useState<Container | null>(null)

  useEffect(() => {
    const loadContainer = async () => {
      try {
        setIsLoadingData(true)
        const data = await ContainerService.getById(containerId)
        setContainer(data)
      } catch (error: any) {
        console.error("Error loading container:", error)
        toast({
          title: "Error al cargar contenedor",
          description: error.message || "No se pudo cargar la información del contenedor",
          variant: "destructive",
        })
        router.push("/admin/management/containers")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (containerId) {
      loadContainer()
    }
  }, [containerId, toast, router])
  const handleSubmit = async (data: Container, file?: File) => {
    try {
      setIsLoading(true)
      
      if (file) {
        await ContainerService.updateWithFile(containerId, data, file)
      } else {
        await ContainerService.update(containerId, data)
      }
      
      toast({
        title: "¡Contenedor actualizado exitosamente!",
        description: `El contenedor "${data.name}" ha sido actualizado correctamente.`,
      })
      router.push("/admin/management/containers")
    } catch (error: any) {
      console.error("Error updating container:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al actualizar contenedor",
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

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando contenedor...</span>
        </div>
      </div>
    )
  }

  if (!container) {
    return null
  }

  return (
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
          <h1 className="text-3xl font-bold">Editar Contenedor</h1>
          <p className="text-muted-foreground mt-2">
            Modifica la información del contenedor
          </p>
        </div>
      </div>      <ContainerForm 
        container={container}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
} 