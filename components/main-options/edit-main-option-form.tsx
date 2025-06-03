import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MainOptionService } from "@/services/main-option/main-option.service"
import { MainOption } from "@/types/main-option"
import { MainOptionForm } from "./main-option-form"

interface EditMainOptionFormProps {
  mainOptionId: string
}

export function EditMainOptionForm({ mainOptionId }: EditMainOptionFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [mainOption, setMainOption] = useState<MainOption | null>(null)

  useEffect(() => {
    const loadMainOption = async () => {
      try {
        setIsLoadingData(true)
        const data = await MainOptionService.getById(mainOptionId)
        setMainOption(data)
      } catch (error: any) {
        console.error("Error loading main option:", error)
        toast({
          title: "Error al cargar opción principal",
          description: error.message || "No se pudo cargar la información de la opción principal",
          variant: "destructive",
        })
        router.push("/admin/management/main-options")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (mainOptionId) {
      loadMainOption()
    }
  }, [mainOptionId, toast, router])

  const handleSubmit = async (data: MainOption) => {
    try {
      setIsLoading(true)
      
      await MainOptionService.update(mainOptionId, data)
      
      toast({
        title: "¡Opción principal actualizada exitosamente!",
        description: `La opción principal "${data.name}" ha sido actualizada correctamente.`,
      })
      router.push("/admin/management/main-options")
    } catch (error: any) {
      console.error("Error updating main option:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al actualizar opción principal",
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
          <span>Cargando opción principal...</span>
        </div>
      </div>
    )
  }

  if (!mainOption) {
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
          <h1 className="text-3xl font-bold">Editar Opción Principal</h1>
          <p className="text-muted-foreground mt-2">
            Modifica la información de la opción principal
          </p>
        </div>
      </div>

      <MainOptionForm 
        mainOption={mainOption}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
