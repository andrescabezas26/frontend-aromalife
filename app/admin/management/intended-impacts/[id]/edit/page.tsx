"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { IntendedImpactService } from "@/services/intended-impacts/intended-impact.service"
import { IntendedImpact } from "@/types/intended-impact"
import { EditIntendedImpactForm } from "@/components/intended-impacts/edit-intended-impact-form"

export default function EditIntendedImpactPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [intendedImpact, setIntendedImpact] = useState<IntendedImpact | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const intendedImpactId = params.id as string

  useEffect(() => {
    if (intendedImpactId) {
      loadIntendedImpact()
    }
  }, [intendedImpactId])

  const loadIntendedImpact = async () => {
    try {
      setIsLoading(true)
      const data = await IntendedImpactService.getById(intendedImpactId)
      setIntendedImpact(data)
    } catch (error) {
      console.error("Error loading intended impact:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el impacto ",
        variant: "destructive",
      })
      router.push("/admin/management/intended-impacts")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando impacto ...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!intendedImpact) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Impacto  no encontrado</h2>
            <p className="text-muted-foreground">El impacto  que buscas no existe.</p>
            <Button 
              onClick={() => router.push("/admin/management/intended-impacts")}
              className="mt-4"
            >
              Volver a la lista
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="space-y-6">

          <EditIntendedImpactForm intendedImpactId={intendedImpactId} />
        </div>
      </div>
    </AdminLayout>
  )
}