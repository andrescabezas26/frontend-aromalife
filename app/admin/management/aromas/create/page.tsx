"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AromaService } from "@/services/aromas/aroma.service"
import { Aroma } from "@/types/aroma"
import { AromaForm } from "@/components/aromas/aroma-form"

export default function CreateAromaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const handleSubmit = async (data: Aroma) => {
    try {
      setIsLoading(true)
      await AromaService.create(data)
      toast({
        title: "¡Aroma creado exitosamente!",
        description: `El aroma "${data.name}" ha sido creado correctamente.`,
      })
      router.push("/admin/management/aromas")
    } catch (error: any) {
      console.error("Error creating aroma:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al crear aroma",
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
            <h1 className="text-3xl font-bold">Crear Nuevo Aroma</h1>
            <p className="text-muted-foreground mt-2">
              Agrega un nuevo aroma para las velas
            </p>
          </div>
        </div>

        <AromaForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
} 