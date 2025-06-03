"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GiftService } from "@/services/gifts/gift.service"
import { Gift } from "@/types/gift"
import { GiftsTable } from "@/components/gifts/gifts-table"

export default function GiftsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [gifts, setGifts] = useState<Gift[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadGifts()
  }, [])

  const loadGifts = async () => {
    try {
      setIsLoading(true)
      const data = await GiftService.getAll()
      setGifts(data)
    } catch (error) {
      console.error("Error loading gifts:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los regalos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando regalos...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Regalos</h1>
            <p className="text-muted-foreground">
              Gestiona los regalos disponibles
            </p>
          </div>
          <Button onClick={() => router.push("/admin/management/gifts/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Regalo
          </Button>
        </div>

        <GiftsTable 
          gifts={gifts}
          onGiftDeleted={loadGifts}
        />
      </div>
    </AdminLayout>
  )
} 