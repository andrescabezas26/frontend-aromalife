import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PlaceService } from "@/services/places/place.service"
import { Place } from "@/types/place"
import { PlaceForm } from "./place-form"

interface EditPlaceFormProps {
  placeId: string
}

export function EditPlaceForm({ placeId }: EditPlaceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [place, setPlace] = useState<Place | null>(null)

  useEffect(() => {
    const loadPlace = async () => {
      try {
        setIsLoadingData(true)
        const data = await PlaceService.getById(placeId)
        setPlace(data)
      } catch (error: any) {
        console.error("Error loading place:", error)
        toast({
          title: "Error al cargar lugar",
          description: error.message || "No se pudo cargar la información del lugar",
          variant: "destructive",
        })
        router.push("/admin/management/places")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (placeId) {
      loadPlace()
    }
  }, [placeId, toast, router])

  const handleSubmit = async (data: Place) => {
    try {
      setIsLoading(true)
      await PlaceService.update(placeId, data)
      toast({
        title: "¡Lugar actualizado exitosamente!",
        description: `El lugar "${data.name}" ha sido actualizado correctamente.`,
      })
      router.push("/admin/management/places")
    } catch (error: any) {
      console.error("Error updating place:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al actualizar lugar",
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
          <span>Cargando lugar...</span>
        </div>
      </div>
    )
  }

  if (!place) {
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
          <h1 className="text-3xl font-bold">Editar Lugar</h1>
          <p className="text-muted-foreground mt-2">
            Modifica la información del lugar
          </p>
        </div>
      </div>

      <PlaceForm 
        place={place}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
