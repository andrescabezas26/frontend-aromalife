"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"

interface GiftImageUploadProps {
  value?: File | string
  onChange: (file: File | null) => void
  onRemove: () => void
  disabled?: boolean
}

export function GiftImageUpload({
  value,
  onChange,
  onRemove,
  disabled
}: GiftImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es muy grande. Máximo 5MB permitido.')
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Pasar el archivo al formulario
    onChange(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreview(null)
    onRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayImage = preview || (typeof value === 'string' ? value : null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <div className="relative">
          {displayImage ? (
            <div className="relative w-48 h-36 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={displayImage}
                alt="Vista previa del regalo"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                onClick={handleRemove}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 rounded-full w-6 h-6 p-0"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-48 h-36 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {displayImage ? 'Cambiar imagen' : 'Subir imagen del regalo'}
        </Button>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        
        <p className="text-xs text-gray-500 text-center">
          Formatos admitidos: JPG, PNG, GIF, WEBP. Máximo 5MB.
        </p>
      </div>
    </div>
  )
}
