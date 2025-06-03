"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { labelsService, Label } from "@/services/labels/labels.service"
import { LabelForm } from "@/components/labels/label-form"

export default function CreateLabelPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: Label, file?: File) => {
    if (!file) {
      toast({
        title: "Error",
        description: "La imagen es requerida para crear una etiqueta",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await labelsService.createTemplateLabel(file, data.name, data.description)
      toast({
        title: "¡Etiqueta creada exitosamente!",
        description: `La etiqueta "${data.name}" ha sido creada correctamente.`,
      })
      router.push("/admin/management/labels")
    } catch (error: any) {
      console.error("Error creating label:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al crear etiqueta",
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Crear Nueva Etiqueta
            </h1>
            <p className="text-muted-foreground">
              Crea una nueva etiqueta plantilla para las velas
            </p>
          </div>
        </div>

        {/* Form */}
        <LabelForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
