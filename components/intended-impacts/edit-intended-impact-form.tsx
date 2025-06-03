import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IntendedImpactService } from "@/services/intended-impacts/intended-impact.service"
import { IntendedImpact } from "@/types/intended-impact"
import { IntendedImpactForm } from "./intended-impact-form"

interface EditIntendedImpactFormProps {
  intendedImpactId: string
}

export function EditIntendedImpactForm({ intendedImpactId }: EditIntendedImpactFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [intendedImpact, setIntendedImpact] = useState<IntendedImpact | null>(null)

  useEffect(() => {
    const loadIntendedImpact = async () => {
      try {
        setIsLoadingData(true)
        const data = await IntendedImpactService.getById(intendedImpactId)
        setIntendedImpact(data)
      } catch (error: any) {
        console.error("Error loading intended impact:", error)
        toast({
          title: "Error al cargar impacto ",
          description: error.message || "No se pudo cargar la información del impacto ",
          variant: "destructive",
        })
        router.push("/admin/management/intended-impacts")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (intendedImpactId) {
      loadIntendedImpact()
    }
  }, [intendedImpactId, toast, router])

  const handleSubmit = async (data: IntendedImpact) => {
    try {
      setIsLoading(true)
      
      await IntendedImpactService.update(intendedImpactId, data)
      
      toast({
        title: "¡Impacto  actualizado exitosamente!",
        description: `El impacto  "${data.name}" ha sido actualizado correctamente.`,
      })
      router.push("/admin/management/intended-impacts")
    } catch (error: any) {
      console.error("Error updating intended impact:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al actualizar impacto ",
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
          <span>Cargando impacto ...</span>
        </div>
      </div>
    )
  }

  if (!intendedImpact) {
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
          <h1 className="text-3xl font-bold">Editar Impacto </h1>
          <p className="text-muted-foreground mt-2">
            Modifica la información del impacto  "{intendedImpact.name}"
          </p>
        </div>
      </div>

      <IntendedImpactForm 
        intendedImpact={intendedImpact}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}