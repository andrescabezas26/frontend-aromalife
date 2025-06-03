import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AromaService } from "@/services/aromas/aroma.service"
import { Aroma } from "@/types/aroma"
import { AromaForm } from "./aroma-form"

interface EditAromaFormProps {
  aromaId: string
}

export function EditAromaForm({ aromaId }: EditAromaFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [aroma, setAroma] = useState<Aroma | null>(null)

  useEffect(() => {
    const loadAroma = async () => {
      try {
        setIsLoadingData(true)
        const data = await AromaService.getById(aromaId)
        setAroma(data)
      } catch (error: any) {
        console.error("Error loading aroma:", error)
        toast({
          title: "Error al cargar aroma",
          description: error.message || "No se pudo cargar la información del aroma",
          variant: "destructive",
        })
        router.push("/admin/management/aromas")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (aromaId) {
      loadAroma()
    }
  }, [aromaId, toast, router])
  const handleSubmit = async (data: Aroma) => {
    try {
      setIsLoading(true)
      await AromaService.update(aromaId, data)
      toast({
        title: "¡Aroma actualizado exitosamente!",
        description: `El aroma "${data.name}" ha sido actualizado correctamente.`,
      })
      router.push("/admin/management/aromas")
    } catch (error: any) {
      console.error("Error updating aroma:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al actualizar aroma",
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
          <span>Cargando aroma...</span>
        </div>
      </div>
    )
  }

  if (!aroma) {
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
          <h1 className="text-3xl font-bold">Editar Aroma</h1>
          <p className="text-muted-foreground mt-2">
            Modifica la información del aroma
          </p>
        </div>
      </div>

      <AromaForm 
        aroma={aroma}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
} 