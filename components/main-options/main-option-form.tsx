import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MainOption } from "@/types/main-option"

interface MainOptionFormProps {
  mainOption?: MainOption
  onSubmit: (data: MainOption) => Promise<void>
  isLoading?: boolean
}

interface MainOptionFormData extends Omit<MainOption, "id" | "createdAt" | "updatedAt"> {}

export function MainOptionForm({ mainOption, onSubmit, isLoading }: MainOptionFormProps) {
  const [formData, setFormData] = useState<MainOptionFormData>({
    name: mainOption?.name || "",
    description: mainOption?.description || "",
    emoji: mainOption?.emoji || ""
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.emoji?.trim()) {
      newErrors.emoji = "El emoji es requerido"
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
        id: mainOption?.id
      })
    } catch (error) {
      console.error("Error submitting main option form:", error)
    }
  }

  const handleInputChange = (field: keyof MainOptionFormData, value: string) => {
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
          <Label htmlFor="name">Nombre de la Opción Principal</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Ej: Relajación"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe el propósito y uso de esta opción principal..."
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">
            Proporciona una descripción detallada de la opción principal (opcional)
          </p>
        </div>

        {/* Emoji */}
        <div className="space-y-2">
          <Label htmlFor="emoji">Emoji</Label>
          <div className="flex gap-2">
            <Input
              id="emoji"
              type="text"
              value={formData.emoji}
              onChange={(e) => handleInputChange("emoji", e.target.value)}
              placeholder="Ej: 😌, 🧘, 💆, 🌸"
              className={`flex-1 ${errors.emoji ? "border-red-500" : ""}`}
            />
            {formData.emoji && (
              <div className="flex items-center justify-center w-12 h-10 border rounded-md bg-gray-50">
                <span className="text-xl">{formData.emoji}</span>
              </div>
            )}
          </div>
          {errors.emoji && <p className="text-sm text-red-500">{errors.emoji}</p>}
          <p className="text-sm text-muted-foreground">
            Selecciona un emoji representativo. Ejemplos: 😌 (relajación), 🧘 (meditación), 💆 (bienestar), 🌸 (calma)
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Guardando..." : (mainOption ? "Actualizar Opción Principal" : "Crear Opción Principal")}
        </Button>
      </div>
    </form>
  )
}
