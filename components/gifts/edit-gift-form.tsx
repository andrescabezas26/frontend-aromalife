import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GiftService } from "@/services/gifts/gift.service"
import { Gift } from "@/types/gift"
import { GiftForm } from "./gift-form"

interface EditGiftFormProps {
  giftId: string
}

export function EditGiftForm({ giftId }: EditGiftFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [gift, setGift] = useState<Gift | null>(null)

  useEffect(() => {
    const loadGift = async () => {
      try {
        setIsLoadingData(true)
        const data = await GiftService.getById(giftId)
        setGift(data)
      } catch (error: any) {
        console.error("Error loading gift:", error)
        toast({
          title: "Error al cargar regalo",
          description: error.message || "No se pudo cargar la información del regalo",
          variant: "destructive",
        })
        router.push("/admin/management/gifts")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (giftId) {
      loadGift()
    }
  }, [giftId, toast, router])
  const handleSubmit = async (data: Omit<Gift, "id">, file?: File) => {
    try {
      setIsLoading(true)
      
      if (file) {
        await GiftService.updateWithFile(giftId, data, file)
      } else {
        await GiftService.update(giftId, data)
      }
      
      toast({
        title: "¡Regalo actualizado exitosamente!",
        description: `El regalo "${data.name}" ha sido actualizado correctamente.`,
      })
      router.push("/admin/management/gifts")
    } catch (error: any) {
      console.error("Error updating gift:", error)
      toast({
        title: "Error al actualizar regalo",
        description: error.message || "Ha ocurrido un error inesperado",
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
          <span>Cargando regalo...</span>
        </div>
      </div>
    )
  }

  if (!gift) {
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
          <h1 className="text-3xl font-bold">Editar Regalo</h1>
          <p className="text-muted-foreground mt-2">
            Modifica la información del regalo
          </p>
        </div>
      </div>

      <GiftForm 
        gift={gift}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
} 