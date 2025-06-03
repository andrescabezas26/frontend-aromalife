import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Place } from "@/types/place"

interface PlaceFormProps {
  place?: Place
  onSubmit: (data: Place) => Promise<void>
  isLoading?: boolean
}

interface PlaceFormData extends Omit<Place, "id" | "createdAt" | "updatedAt"> {}

export function PlaceForm({ place, onSubmit, isLoading }: PlaceFormProps) {
  const [formData, setFormData] = useState<PlaceFormData>({
    name: place?.name || "",
    icon: place?.icon || ""
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.icon?.trim()) {
      newErrors.icon = "El icono es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        ...formData,
        id: place?.id
      })
    } catch (error) {
      console.error("Error submitting place form:", error)
    }
  }

  const handleInputChange = (field: keyof PlaceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Lugar</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Ej: Sala de estar"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label htmlFor="icon">Icono</Label>
          <div className="flex gap-2">
            <Input
              id="icon"
              type="text"
              value={formData.icon}
              onChange={(e) => handleInputChange("icon", e.target.value)}
              placeholder="Ej: 🏠, 🛋️, 🛏️, 🍽️"
              className={`flex-1 ${errors.icon ? "border-red-500" : ""}`}
            />
            {formData.icon && (
              <div className="flex items-center justify-center w-12 h-10 border rounded-md bg-gray-50">
                <span className="text-xl">{formData.icon}</span>
              </div>
            )}
          </div>
          {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
          <p className="text-sm text-muted-foreground">
            Puedes usar emojis como iconos. Ejemplos: 🏠 (hogar), 🛋️ (sala), 🛏️ (dormitorio), 🍽️ (comedor)
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Guardando..." : (place ? "Actualizar Lugar" : "Crear Lugar")}
        </Button>
      </div>
    </form>
  )
}
