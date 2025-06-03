"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RelationsService, RelationData } from "@/services/relations/relations.service"
import { RelationsTable } from "@/components/relations/relations-table"

export default function RelationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [relationData, setRelationData] = useState<RelationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadRelationData()
  }, [])

  const loadRelationData = async () => {
    try {
      setIsLoading(true)
      const data = await RelationsService.getAllRelationsData()
      setRelationData(data)
    } catch (error) {
      console.error("Error loading relation data:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar los datos de relaciones",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRelations = async (intendedImpactId: string, aromaIds: string[]) => {
    try {
      setIsUpdating(true)
      await RelationsService.updateRelations(intendedImpactId, aromaIds)
      toast({
        title: "Éxito",
        description: "Las relaciones se han actualizado correctamente",
      })

      // Update local state to reflect the changes
      if (relationData) {
        const updatedRelations = relationData.intendedImpactAromas.map(relation => {
          if (relation.intendedImpactId === intendedImpactId) {
            return { ...relation, aromaIds }
          }
          return relation
        })

        // If the relation doesn't exist yet, add it
        const relationExists = relationData.intendedImpactAromas.some(rel => rel.intendedImpactId === intendedImpactId)
        if (!relationExists) {
          updatedRelations.push({ intendedImpactId, aromaIds })
        }

        setRelationData({
          ...relationData,
          intendedImpactAromas: updatedRelations
        })
      }
    } catch (error) {
      console.error("Error updating relations:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar las relaciones",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Relaciones</h1>
        </div>

        {/* Texto explicativo */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">¿Cómo funciona esta página?</h3>
              <p className="text-gray-700 mb-3">
                Esta página te permite crear y gestionar las relaciones entre las diferentes entidades de tu aplicación. 
                Funciona como un flujo paso a paso: primero selecciona una <strong>categoría</strong>, luego un <strong>impacto </strong> 
                y finalmente los <strong>aromas</strong> que quieres relacionar.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-1">📖 Guía de colores:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                <li><span className="text-orange-500 font-medium">Color naranja</span>: Estas entidades no cuentan con relaciones en tu página</li>
                <li><span className="text-gray-400 font-medium">Color gris</span>: Entidades que tienen relaciones, pero no con la selección actual</li>
                <li><span className="text-black font-medium">Color negro</span>: Entidades que están relacionadas con tu selección actual</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-1">🔗 Para crear relaciones específicas:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                <li><strong>Entre categorías e impactos</strong>: Ve al menú "Impactos" y edita el que desees</li>
                <li><strong>Entre impactos y aromas</strong>: Utiliza esta página seleccionando el flujo correspondiente</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-1">➕ ¿Necesitas crear nuevas entidades?</h4>
              <p className="text-gray-700">
                Haz clic en los botones <strong>"Agregar"</strong> que aparecen en cada columna para crear nuevas categorías, 
                lugares, impactos o aromas según lo que necesites.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : relationData ? (
          <RelationsTable
            mainOptions={relationData.mainOptions}
            intendedImpacts={relationData.intendedImpacts}
            aromas={relationData.aromas}
            places={relationData.places}
            mainOptionIntendedImpacts={relationData.mainOptionIntendedImpacts}
            intendedImpactAromas={relationData.intendedImpactAromas}
            placeIntendedImpacts={relationData.placeIntendedImpacts}
            onUpdate={handleUpdateRelations}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">No hay datos disponibles</p>
            <Button 
              className="mt-4" 
              onClick={loadRelationData}
            >
              Intentar de nuevo
            </Button>
          </div>
        )}

        {isUpdating && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p>Actualizando relaciones...</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
