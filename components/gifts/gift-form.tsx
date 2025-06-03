import { useState } from "react"
import { Gift } from "@/types/gift"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { GiftImageUpload } from "@/components/ui/gift-image-upload"

interface GiftFormData extends Omit<Gift, "id" | "price"> {
  price: string
}

interface GiftFormProps {
  gift?: Gift
  onSubmit: (data: Omit<Gift, "id">, file?: File) => Promise<void>
  isLoading?: boolean
}

export function GiftForm({ gift, onSubmit, isLoading = false }: GiftFormProps) {  const [formData, setFormData] = useState<GiftFormData>({
    name: gift?.name || "",
    description: gift?.description || "",
    price: gift?.price?.toString() || "0",
    imageUrl: gift?.imageUrl || "",
  })
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...formData,
      price: parseFloat(formData.price) || 0, 
    }, selectedFile || undefined)
  }

  const handleNumericInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "price"
  ) => {
    const value = e.target.value
    // Permitir solo números y un punto decimal
    if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            required
          />
        </div>        <div>
          <Label htmlFor="price">Precio Base</Label>
          <Input
            id="price"
            type="text"
            value={formData.price}
            onChange={(e) => handleNumericInput(e, "price")}
            required
          />
        </div>

        <div>
          <Label htmlFor="image">Imagen del Regalo</Label>
          <GiftImageUpload
            value={selectedFile || formData.imageUrl}
            onChange={handleFileChange}
            onRemove={handleFileRemove}
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : gift ? "Actualizar" : "Crear"}
      </Button>
    </form>
  )
} 