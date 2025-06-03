"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IntendedImpactService } from "@/services/intended-impacts/intended-impact.service"
import { IntendedImpact } from "@/types/intended-impact"
import { IntendedImpactForm } from "@/components/intended-impacts/intended-impact-form"

export default function CreateIntendedImpactPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: IntendedImpact) => {
    try {
      setIsLoading(true)
      await IntendedImpactService.create(data)
      toast({
        title: "¡Impacto  creado exitosamente!",
        description: `El impacto  "${data.name}" ha sido creado correctamente.`,
      })
      router.push("/admin/management/intended-impacts")
    } catch (error: any) {
      console.error("Error creating intended impact:", error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Ha ocurrido un error inesperado"
      toast({
        title: "Error al crear impacto ",
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
            <h1 className="text-3xl font-bold">Crear Nuevo Impacto </h1>
            <p className="text-muted-foreground mt-2">
              Agrega un nuevo impacto  para las velas
            </p>
          </div>
        </div>

        <IntendedImpactForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}