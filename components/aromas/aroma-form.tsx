import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Aroma } from "@/types/aroma"

interface AromaFormProps {
  aroma?: Aroma
  onSubmit: (data: Aroma) => Promise<void>
  isLoading?: boolean
}

export function AromaForm({ aroma, onSubmit, isLoading }: AromaFormProps) {
  const [formData, setFormData] = useState<Omit<Aroma, "id" | "createdAt" | "updatedAt">>({
    name: aroma?.name || "",
    description: aroma?.description || "",
    color: aroma?.color || "#000000",
    olfativePyramid: aroma?.olfativePyramid || {
      salida: "",
      corazon: "",
      fondo: ""
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información Básica</h3>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-16 h-10 p-1 border rounded"
              required
            />
            <Input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#000000"
              className="flex-1"
              pattern="^#[0-9A-Fa-f]{6}$"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pirámide Olfativa</h3>

        <div className="space-y-2">
          <Label htmlFor="salida">Notas de Salida</Label>
          <Textarea
            id="salida"
            value={formData.olfativePyramid.salida}
            onChange={(e) => setFormData({
              ...formData,
              olfativePyramid: { ...formData.olfativePyramid, salida: e.target.value }
            })}
            placeholder="Ej: Bergamota, Limón, Pomelo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="corazon">Notas de Corazón</Label>
          <Textarea
            id="corazon"
            value={formData.olfativePyramid.corazon}
            onChange={(e) => setFormData({
              ...formData,
              olfativePyramid: { ...formData.olfativePyramid, corazon: e.target.value }
            })}
            placeholder="Ej: Rosa, Jazmín, Lavanda"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fondo">Notas de Fondo</Label>
          <Textarea
            id="fondo"
            value={formData.olfativePyramid.fondo}
            onChange={(e) => setFormData({
              ...formData,
              olfativePyramid: { ...formData.olfativePyramid, fondo: e.target.value }
            })}
            placeholder="Ej: Sándalo, Vainilla, Almizcle"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : aroma ? "Guardar cambios" : "Crear aroma"}
      </Button>
    </form>
  )
}