"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MainOptionService } from "@/services/main-option/main-option.service"
import { MainOption } from "@/types/main-option"
import { MainOptionForm } from "@/components/main-options/main-option-form"

export default function CreateMainOptionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: MainOption) => {
    try {
      setIsLoading(true)
      await MainOptionService.create(data)
      toast({
        title: "¡Opción principal creada exitosamente!",
        description: `La opción principal "${data.name}" ha sido creada correctamente.`,
      })
      router.push("/admin/management/main-options")
    } catch (error: any) {
      console.error("Error creating main option:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al crear opción principal",
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
            <h1 className="text-3xl font-bold">Crear Nueva Opción Principal</h1>
            <p className="text-muted-foreground mt-2">
              Agrega una nueva opción principal para categorizar experiencias
            </p>
          </div>
        </div>

        <MainOptionForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
