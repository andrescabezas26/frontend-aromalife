"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GiftService } from "@/services/gifts/gift.service"
import { Gift } from "@/types/gift"
import { GiftForm } from "@/components/gifts/gift-form"

export default function CreateGiftPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (data: Omit<Gift, "id">, file?: File) => {
    try {
      setIsLoading(true)
      
      if (file) {
        await GiftService.createWithFile(data, file)
      } else {
        await GiftService.create(data)
      }
      
      toast({
        title: "¡Regalo creado exitosamente!",
        description: `El regalo "${data.name}" ha sido creado correctamente.`,
      })
      router.push("/admin/management/gifts")
    } catch (error: any) {
      console.error("Error creating gift:", error)
      toast({
        title: "Error al crear regalo",
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
            <h1 className="text-3xl font-bold">Crear Nuevo Regalo</h1>
            <p className="text-muted-foreground mt-2">
              Agrega un nuevo regalo al catálogo
            </p>
          </div>
        </div>

        <GiftForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 