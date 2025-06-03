import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label as UILabel } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from "lucide-react"
import { Label } from "@/services/labels/labels.service"
import Image from "next/image"

interface LabelFormProps {
  label?: Label
  onSubmit: (data: Label, file?: File) => Promise<void>
  isLoading?: boolean
}

interface LabelFormData extends Omit<Label, "id" | "createdAt" | "updatedAt" | "imageUrl" | "type" | "isActive"> {
  imageUrl?: string
}

export function LabelForm({ label, onSubmit, isLoading }: LabelFormProps) {
  const [formData, setFormData] = useState<LabelFormData>({
    name: label?.name || "",
    description: label?.description || "",
    imageUrl: label?.imageUrl || ""
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(label?.imageUrl || null)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!label && !selectedFile) {
      newErrors.image = "La imagen es requerida"
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
        id: label?.id || "",
        imageUrl: formData.imageUrl || "",
        type: "template", // Always template for admin created labels
        isActive: true,
        createdAt: label?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, selectedFile || undefined)
    } catch (error) {
      console.error("Error submitting label form:", error)
    }
  }

  const handleInputChange = (field: keyof LabelFormData, value: string) => {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        image: "Por favor selecciona un archivo de imagen válido"
      }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        image: "El archivo es muy grande. Máximo 5MB permitido."
      }))
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Clear any image errors
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ""
      }))
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreview(label?.imageUrl || null)
    
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <UILabel htmlFor="name">Nombre de la Etiqueta</UILabel>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Etiqueta Romántica"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <UILabel htmlFor="description">Descripción</UILabel>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe el diseño y uso de esta etiqueta..."
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Proporciona una descripción detallada de la etiqueta (opcional)
            </p>
          </div>
        </div>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Imagen de la Etiqueta</CardTitle>
            <CardDescription>
              Sube una imagen para la etiqueta plantilla
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview ? (
              <div className="relative">
                <div className="w-full h-48 relative rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={preview}
                    alt="Vista previa de la etiqueta"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleRemoveImage}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No hay imagen seleccionada</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {preview ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </Button>
              
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
              
              <p className="text-xs text-gray-500 text-center">
                Formatos admitidos: JPG, PNG, GIF, WEBP. Máximo 5MB.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? "Guardando..." : (label ? "Actualizar" : "Crear")}
        </Button>
      </div>
    </form>
  )
}