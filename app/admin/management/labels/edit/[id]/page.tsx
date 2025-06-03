"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { labelsService, Label } from "@/services/labels/labels.service"
import { LabelForm } from "@/components/labels/label-form"

interface EditLabelPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditLabelPage({ params }: EditLabelPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const resolvedParams = use(params)
  const [label, setLabel] = useState<Label | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadLabel()
  }, [resolvedParams.id])

  const loadLabel = async () => {
    try {
      setIsLoading(true)
      const data = await labelsService.getLabelById(resolvedParams.id)
      setLabel(data)
    } catch (error) {
      console.error("Error loading label:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la etiqueta",
        variant: "destructive",
      })
      router.push("/admin/management/labels")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: Label, file?: File) => {
    if (!label) return

    try {
      setIsSubmitting(true)
      await labelsService.updateTemplateLabel(label.id, data, file)
      toast({
        title: "¡Etiqueta actualizada exitosamente!",
        description: `La etiqueta "${data.name}" ha sido actualizada correctamente.`,
      })
      router.push("/admin/management/labels")
    } catch (error: any) {
      console.error("Error updating label:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al actualizar etiqueta",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando etiqueta...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!label) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Etiqueta no encontrada</h2>
          <p className="text-muted-foreground mb-6">
            La etiqueta que buscas no existe o ha sido eliminada.
          </p>
          <Button onClick={() => router.push("/admin/management/labels")}>
            Volver a Etiquetas
          </Button>
        </div>
      </div>
    )
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
              Editar Etiqueta
            </h1>
            <p className="text-muted-foreground">
              Modifica los detalles de la etiqueta "{label.name}"
            </p>
          </div>
        </div>

        {/* Form */}
        <LabelForm 
          label={label}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}
