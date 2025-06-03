"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X, User, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value?: File | string
  onChange: (file: File | null) => void
  onRemove: () => void
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Validaciones más estrictas de tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert('Tipo de archivo no permitido. Solo se admiten archivos JPG, JPEG, PNG y WEBP.')
        // Limpiar el input
        if (event.target) {
          event.target.value = ''
        }
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 5MB permitido.')
        if (event.target) {
          event.target.value = ''
        }
        return
      }      // Validar dimensiones de imagen (opcional)
      const img = document.createElement('img') as HTMLImageElement
      const imageValidation = new Promise<boolean>((resolve, reject) => {
        img.onload = () => {
          // Verificar que la imagen tenga dimensiones válidas
          if (img.width < 50 || img.height < 50) {
            reject(new Error('La imagen es muy pequeña. Mínimo 50x50 píxeles.'))
            return
          }
          if (img.width > 4000 || img.height > 4000) {
            reject(new Error('La imagen es muy grande. Máximo 4000x4000 píxeles.'))
            return
          }
          resolve(true)
        }
        img.onerror = () => {
          reject(new Error('Archivo de imagen corrupto o inválido.'))
        }
      })

      // Crear URL temporal para validar la imagen
      const objectUrl = URL.createObjectURL(file)
      img.src = objectUrl

      // Esperar a que se valide la imagen
      await imageValidation
      
      // Limpiar URL temporal
      URL.revokeObjectURL(objectUrl)

      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.onerror = () => {
        alert('Error al leer el archivo.')
        if (event.target) {
          event.target.value = ''
        }
      }
      reader.readAsDataURL(file)

      // Pasar el archivo al formulario
      onChange(file)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al procesar la imagen.')
      // Limpiar el input en caso de error
      if (event.target) {
        event.target.value = ''
      }
      setPreview(null)
    }
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
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
              <Image
                src={displayImage}
                alt="Foto de perfil"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                onClick={handleRemove}
                variant="destructive"
                size="sm"
                className="absolute top-0 right-0 rounded-full w-6 h-6 p-0"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <User className="h-8 w-8 text-gray-400" />
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
          {displayImage ? 'Cambiar foto' : 'Subir foto de perfil'}
        </Button>
          <Input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        
        <p className="text-xs text-gray-500 text-center">
          Formatos admitidos: JPG, JPEG, PNG, WEBP. Máximo 5MB.
        </p>
      </div>
    </div>
  )
}