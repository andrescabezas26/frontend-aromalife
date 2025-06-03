"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Gift as GiftIcon, Plus, Package } from "lucide-react"
import { Gift } from "@/types/gift"
import { GiftService } from "@/services/gifts/gift.service"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface GiftSelectorProps {
  onAddGift: (giftId: string, quantity: number, unitPrice: number) => Promise<void>
  isLoading?: boolean
}

export function GiftSelector({ onAddGift, isLoading = false }: GiftSelectorProps) {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [selectedGiftId, setSelectedGiftId] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [loadingGifts, setLoadingGifts] = useState(false)
  const [addingGift, setAddingGift] = useState(false)
  const { toast } = useToast()
  // Cargar la lista de gifts disponibles
  useEffect(() => {
    const loadGifts = async () => {
      setLoadingGifts(true)
      try {
        const availableGifts = await GiftService.getAll()
        
        setGifts(availableGifts)
      } catch (error) {
        console.error("❌ Error cargando gifts:", error)
        toast({
          title: "Error",
        description: "No se pudieron cargar los regalos disponibles.",
          variant: "destructive",
        })
      } finally {
        setLoadingGifts(false)
      }
    }

    loadGifts()
  }, [toast])

  const selectedGift = gifts.find(gift => gift.id === selectedGiftId)

  const handleAddToCart = async () => {
    if (!selectedGift || quantity < 1) return

    setAddingGift(true)
    try {
      await onAddGift(selectedGift.id, quantity, selectedGift.price)
      
      // Resetear formulario
      setSelectedGiftId("")
      setQuantity(1)
      
      toast({
        title: "Regalo agregado",
        description: `${selectedGift.name} se ha agregado al carrito.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el regalo al carrito.",
        variant: "destructive",
      })
    } finally {
      setAddingGift(false)
    }
  }

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 1
    setQuantity(Math.min(Math.max(1, newQuantity), 99)) // Limitar entre 1 y 99
  }

  const getTotalPrice = () => {
    if (!selectedGift) return 0
    return selectedGift.price * quantity
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GiftIcon className="h-5 w-5 text-purple-600" />
          Agregar Regalo al Carrito
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingGifts ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Package className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" />
              <p className="text-sm text-muted-foreground">Cargando regalos disponibles...</p>
            </div>
          </div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay regalos disponibles en este momento.</p>
          </div>
        ) : (
          <>
            {/* Selector de regalo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Seleccionar Regalo</label>
              <Select value={selectedGiftId} onValueChange={setSelectedGiftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige un regalo..." />
                </SelectTrigger>                <SelectContent>
                  {gifts.map((gift) => (
                    <SelectItem key={gift.id} value={gift.id}>
                      <div className="flex items-center gap-3 w-full">
                        {gift.imageUrl && (
                          <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={gift.imageUrl}
                              alt={gift.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate">{gift.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              ${gift.price}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>            {/* Detalles del regalo seleccionado */}
            {selectedGift && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div className="flex items-start gap-4">
                  {/* Imagen del regalo */}
                  {selectedGift.imageUrl && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-purple-200">
                      <Image
                        src={selectedGift.imageUrl}
                        alt={selectedGift.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Información del regalo */}
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium text-lg">{selectedGift.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {selectedGift.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        Precio: ${selectedGift.price}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selector de cantidad y botón agregar */}
            {selectedGift && (
              <div className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Cantidad</label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total</label>
                  <div className="h-10 flex items-center">
                    <Badge variant="default" className="text-base px-3 py-1">
                      ${getTotalPrice().toFixed(2)}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!selectedGiftId || quantity < 1 || addingGift || isLoading}
                  className="h-10"
                >
                  {addingGift ? (
                    <>
                      <Plus className="h-4 w-4 mr-2 animate-spin" />
                      Agregando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar al Carrito
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
