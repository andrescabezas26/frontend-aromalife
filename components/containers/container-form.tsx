import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { ContainerImageUpload } from "@/components/ui/container-image-upload"
import { Container } from "@/types/container"

interface ContainerFormProps {
  container?: Container
  onSubmit: (data: Container, file?: File) => Promise<void>
  isLoading?: boolean
}

interface ContainerFormData extends Omit<Container, "id" | "basePrice" | "createdAt" | "updatedAt"> {
  basePrice: string
}

export function ContainerForm({ container, onSubmit, isLoading }: ContainerFormProps) {
  const [formData, setFormData] = useState<ContainerFormData>({
    name: container?.name || "",
    description: container?.description || "",
    basePrice: container?.basePrice?.toString() || "0",
    imageUrl: container?.imageUrl || "",
    dimensions: container?.dimensions ? {
      height: container.dimensions.height,
      width: container.dimensions.width,
      depth: container.dimensions.depth
    } : {
      height: undefined,
      width: undefined,
      depth: undefined
    }
  })
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que las dimensiones sean obligatorias
    if (!formData.dimensions?.height || !formData.dimensions?.width) {
      alert("Por favor, completa las dimensiones de altura y anchura.")
      return
    }
    
    // Limpiar dimensions para asegurar que se envíen correctamente
    const cleanDimensions = {
      height: formData.dimensions.height,
      width: formData.dimensions.width,
      depth: formData.dimensions.depth || formData.dimensions.width
    }

    await onSubmit({
      ...formData,
      basePrice: parseFloat(formData.basePrice) || 0,
      dimensions: cleanDimensions
    }, imageFile || undefined)
  }

  const handleImageChange = (file: File | null) => {
    setImageFile(file)
  }

  const handleImageRemove = () => {
    setImageFile(null)
    setFormData({ ...formData, imageUrl: "" })
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
        </div>        <div className="space-y-2">
          <Label htmlFor="basePrice">Precio Base</Label>
          <Input
            id="basePrice"
            type="text"
            inputMode="decimal"
            value={formData.basePrice}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '')
              const parts = value.split('.')
              if (parts.length > 2) return // No permitir más de un punto decimal
              if (parts[1]?.length > 2) return // No permitir más de 2 decimales
              setFormData({ ...formData, basePrice: value })
            }}
            required
          />
        </div>                <div className="space-y-2">
          <Label>Subir Imagen</Label>
          <ContainerImageUpload
            value={imageFile || formData.imageUrl}
            onChange={handleImageChange}
            onRemove={handleImageRemove}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            El archivo subido tendrá prioridad.
          </p>
        </div>
      </div>      <div className="space-y-4">        <div>
          <h3 className="text-lg font-medium">Dimensiones</h3>
          <p className="text-sm text-gray-600">Las dimensiones son obligatorias para crear el contenedor</p>
        </div>
          <div className="grid grid-cols-2 gap-4">          <div className="space-y-2">
            <Label htmlFor="height">Alto (cm) *</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0"
              value={formData.dimensions?.height || ""}
              onChange={(e) => {
                const height = e.target.value ? parseFloat(e.target.value) : undefined
                setFormData({
                  ...formData,
                  dimensions: {
                    ...formData.dimensions,
                    height
                  }
                })
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="width">Ancho (cm) *</Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              min="0"
              value={formData.dimensions?.width || ""}
              onChange={(e) => {
                const width = e.target.value ? parseFloat(e.target.value) : undefined
                setFormData({
                  ...formData,
                  dimensions: {
                    ...formData.dimensions,
                    width,
                    depth: width // El depth será igual al width automáticamente
                  }
                })
              }}
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : container ? "Guardar cambios" : "Crear contenedor"}
      </Button>
    </form>
  )
} 