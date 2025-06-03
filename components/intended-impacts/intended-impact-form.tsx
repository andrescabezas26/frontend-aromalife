import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IntendedImpact } from "@/types/intended-impact"
import { MainOption } from "@/types/main-option"
import { MainOptionService } from "@/services/main-option/main-option.service"
import { Loader2, Target, Hash, Type, FileText } from "lucide-react"

interface IntendedImpactFormProps {
  intendedImpact?: IntendedImpact
  onSubmit: (data: IntendedImpact) => Promise<void>
  isLoading?: boolean
}

interface IntendedImpactFormData extends Omit<IntendedImpact, "id" | "createdAt" | "updatedAt"> {
  // No additional fields needed since we only use name, icon, description, mainOptionId
}

export function IntendedImpactForm({ intendedImpact, onSubmit, isLoading }: IntendedImpactFormProps) {
  const [formData, setFormData] = useState<IntendedImpactFormData>({
    name: intendedImpact?.name || "",
    icon: intendedImpact?.icon || "",
    description: intendedImpact?.description || "",
    mainOptionId: intendedImpact?.mainOptionId || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [mainOptions, setMainOptions] = useState<Array<MainOption & { id: string }>>([])
  const [isLoadingMainOptions, setIsLoadingMainOptions] = useState(true)

  // Fetch mainOptions on component mount
  useEffect(() => {
    const fetchMainOptions = async () => {
      try {
        setIsLoadingMainOptions(true)
        const options = await MainOptionService.getAll()
        console.log("Loaded main options:", options)
        // Filter out options without valid IDs
        const validOptions = options.filter(option => option.id) as Array<MainOption & { id: string }>
        setMainOptions(validOptions)
      } catch (error) {
        console.error("Error loading main options:", error)
      } finally {
        setIsLoadingMainOptions(false)
      }
    }

    fetchMainOptions()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.icon.trim()) {
      newErrors.icon = "El icono es requerido"
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida"
    }

    if (!formData.mainOptionId.trim()) {
      newErrors.mainOptionId = "La opción principal es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const submitData: IntendedImpact = {
      ...formData,
      ...(intendedImpact?.id && { id: intendedImpact.id })
    }

    // Debug: verificar que mainOptionId sea un UUID válido
    console.log("Submitting data:", submitData)
    console.log("mainOptionId:", submitData.mainOptionId)

    await onSubmit(submitData)
  }

  const handleInputChange = (field: keyof IntendedImpactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Nombre *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Relajación"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Icono *
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleInputChange("icon", e.target.value)}
                placeholder="Ej: 🧘‍♀️"
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
              Usa un emoji que represente el impacto 
            </p>
          </div>

          {/* Main Option */}
          <div className="space-y-2">
            <Label htmlFor="mainOption" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Opción Principal *
            </Label>
            <Select
              value={formData.mainOptionId}
              onValueChange={(value) => handleInputChange("mainOptionId", value)}
              disabled={isLoadingMainOptions}
            >
              <SelectTrigger className={errors.mainOptionId ? "border-red-500" : ""}>
                <SelectValue 
                  placeholder={
                    isLoadingMainOptions ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando...
                      </div>
                    ) : (
                      "Selecciona una opción principal"
                    )
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {mainOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center gap-2">
                      <span>{option.emoji}</span>
                      <span>{option.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.mainOptionId && <p className="text-sm text-red-500">{errors.mainOptionId}</p>}
            <p className="text-sm text-muted-foreground">
              Selecciona la opción principal asociada a este impacto
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Descripción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe el impacto  que produce este elemento..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-sm text-muted-foreground">
              Proporciona una descripción detallada del impacto 
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            <>
              {intendedImpact ? "Actualizar" : "Crear"} Impacto 
            </>
          )}
        </Button>
      </div>
    </form>
  )
}