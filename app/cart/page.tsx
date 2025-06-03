"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ShoppingCart, 
  Loader2, 
  Trash2, 
  Plus, 
  Minus, 
  Package, 
  Calendar, 
  Palette, 
  Tag,
  Gift,
  ArrowLeft,
  Flame
} from "lucide-react"
import { MainLayout } from "@/components/layouts/main-layout"
import { useAuthStore } from "@/stores/auth-store"
import { useCartStore } from "@/stores/cart-store"
import { useToast } from "@/hooks/use-toast"
import { CartItem } from "@/types/cart"
import { GiftSelector } from "@/components/cart/gift-selector"
import Link from "next/link"
import Image from "next/image"
import apiClient from "@/lib/axios"
import { OrderService } from "@/services/orders/order.service"
import { CartService } from "@/services/cart/cart.service"
import type { CreateOrderRequest } from "@/types/order"

export default function ShoppingCartPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { 
    cart, 
    loading, 
    error, 
    loadUserCart, 
    createCart, 
    updateCartItem, 
    removeCartItem,
    addItemToCart,
    getCartSummary,
    setError
  } = useCartStore()
  const { toast } = useToast()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }

    const initializeCart = async () => {
      try {
        await loadUserCart(user.id)
      } catch (error) {
        // If cart doesn't exist, create one
        try {
          await createCart(user.id)
          toast({
            title: "Carrito creado",
            description: "Se ha creado tu carrito de compras.",
          })
        } catch (createError) {
          console.error("Error creating cart:", createError)
        }
      }
    }

    initializeCart()
  }, [user, isAuthenticated, loadUserCart, createCart, toast])
  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    if (!cart || newQuantity < 1) return

    setUpdatingItems(prev => new Set([...prev, item.id]))
    
    try {
      await updateCartItem(cart.id, item.id, {
        quantity: newQuantity,
        unitPrice: Number(item.unitPrice)
      })
      
      // Recargar el carrito después de actualizar
      await loadUserCart(user!.id)
      
      toast({
        title: "Cantidad actualizada",
        description: "La cantidad del artículo se ha actualizado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la cantidad. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.id)
        return newSet
      })
    }
  }

  const handleRemoveItem = async (item: CartItem) => {
    if (!cart) return

    setUpdatingItems(prev => new Set([...prev, item.id]))
    
    try {
      await removeCartItem(cart.id, item.id)
      
      // Recargar el carrito después de eliminar
      await loadUserCart(user!.id)
      
      toast({
        title: "Artículo eliminado",
        description: "El artículo se ha eliminado del carrito.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el artículo. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(item.id)
        return newSet
      })
    }
  }

  const handleAddGiftToCart = async (giftId: string, quantity: number, unitPrice: number) => {
    if (!cart) return

    try {
      await addItemToCart(cart.id, {
        giftId,
        quantity,
        unitPrice
      })
      
      // Recargar el carrito después de agregar
      await loadUserCart(user!.id)
      
      toast({
        title: "Regalo agregado",
        description: "El regalo se ha agregado al carrito correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el regalo al carrito. Inténtalo de nuevo.",
        variant: "destructive",
      })
      throw error
    }
  }

  const handlePayment = async () => {
    if (!cart || !user) {
      toast({
        title: "Error",
        description: "No se puede procesar el pago sin un carrito o usuario válido.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setProcessingPayment(true);
      
      // 1. Obtener usuario actualizado con su información completa
      console.log("Fetching user data for ID:", user.id);
      const userResponse = await apiClient.get(`auth/users/${user.id}`);
      const userData = userResponse.data;
      
      if (!userData) {
        throw new Error("No se pudo obtener la información del usuario");
      }
      
      console.log("User data:", userData);
      
      // 2. Procesar el pago usando el servicio
      const init_point = await CartService.processPayment(cart.id, userData);
      
      // 3. Redirigir al checkout de Mercado Pago
      window.location.href = init_point;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar el pago. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };
  const renderCartItem = (item: CartItem) => {
    const isUpdating = updatingItems.has(item.id)
    // Mejorar la detección de velas vs regalos
    const isCandle = !!item.candle?.container
    const product = item.candle || item.gift
    return (
      <Card key={item.id} className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Product Image/Icon */}
            <div className={`rounded-lg overflow-hidden ${isCandle ? 'bg-orange-100' : 'bg-purple-100'}`}>
              {isCandle ? (
                item.candle?.label?.imageUrl ? (
                  <div className="relative w-16 h-16">
                    <Image
                      src={item.candle.label.imageUrl}
                      alt={item.candle.label?.name || "Etiqueta de vela"}
                      fill
                      className="object-contain"
                      sizes="(max-width: 64px) 100vw, 64px"
                    />
                  </div>
                ) : (
                  <div className="p-3">
                    <Flame className="h-10 w-10 text-orange-600" />
                  </div>
                )
              ) : (
                item.gift?.imageUrl ? (
                  <div className="relative w-16 h-16">
                    <Image
                      src={item.gift.imageUrl}
                      alt={item.gift.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 64px) 100vw, 64px"
                    />
                  </div>
                ) : (
                  <div className="p-3">
                    <Gift className="h-10 w-10 text-purple-600" />
                  </div>
                )
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {product?.name || `${isCandle ? 'Vela' : 'Regalo'} #${item.id.slice(-6)}`}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    {isCandle ? 'Vela Personalizada' : 'Regalo'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item)}
                  disabled={isUpdating}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Candle Details */}
              {isCandle && item.candle && (
                <div className="mt-3 space-y-3">
                  {/* Información básica de la vela */}
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-3">
                      <Flame className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-800">Vela Personalizada</p>
                        {item.candle.description && (
                          <p className="text-xs text-orange-600 mt-1 line-clamp-2">
                            {item.candle.description}
                          </p>
                        )}
                        {item.candle.message && (
                          <p className="text-xs text-orange-700 mt-1 italic">
                            💌 "{item.candle.message}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalles específicos */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {item.candle.aroma && (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <Palette className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs font-medium">Aroma</p>
                          <p className="text-xs text-muted-foreground">{item.candle.aroma.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {item.candle.container && (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <Package className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-medium">Contenedor</p>
                          <p className="text-xs text-muted-foreground">{item.candle.container.name}</p>
                        </div>
                      </div>
                    )}
                    
                    {item.candle.label && (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <Tag className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs font-medium">Etiqueta</p>
                          <p className="text-xs text-muted-foreground">{item.candle.label.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gift Details */}
              {!isCandle && item.gift && (
                <div className="mt-3">
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <Gift className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-purple-800">Regalo Especial</p>
                        {item.gift.description && (
                          <p className="text-xs text-purple-600 mt-1 line-clamp-2">
                            {item.gift.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Price and Quantity */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      disabled={isUpdating || item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      disabled={isUpdating}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ${(Number(item.unitPrice) || 0).toFixed(2)} c/u
                  </span>
                </div>
                <span className="font-medium">
                  ${(Number(item.totalPrice) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center justify-center min-h-[60vh] py-10">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Carrito de Compras</h1>
            <p className="text-muted-foreground mb-6">
              Debes iniciar sesión para ver tu carrito de compras
            </p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center justify-center min-h-[60vh] py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-4">Cargando tu carrito...</p>
        </div>
      </MainLayout>
    )
  }

  const summary = getCartSummary()

  return (
    <MainLayout>
      <div className="container py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/mis-velas">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Mis Velas
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Carrito de Compras</h1>
            <p className="text-muted-foreground">
              {summary.totalItems > 0 
                ? `${summary.totalItems} artículo${summary.totalItems !== 1 ? 's' : ''} en tu carrito`
                : 'Tu carrito está vacío'
              }
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-2"
              >
                Cerrar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Gift Selector - Always show when authenticated and cart exists */}
        {cart && (
          <GiftSelector 
            onAddGift={handleAddGiftToCart} 
            isLoading={loading}
          />
        )}

        {/* Empty Cart */}
        {!cart || cart.cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-6">
              ¡Agrega algunas velas personalizadas para comenzar!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/mis-velas">
                <Button>
                  <Package className="h-4 w-4 mr-2" />
                  Ver Mis Velas
                </Button>
              </Link>
              <Link href="/personalization/welcome">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nueva Vela
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.cartItems.map(renderCartItem)}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {cart.cartItems.filter(item => item.candle).length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Velas ({cart.cartItems.filter(item => item.candle).length})</span>
                        <span>
                          {cart.cartItems
                            .filter(item => item.candle)
                            .reduce((sum, item) => sum + item.quantity, 0)} artículo{cart.cartItems.filter(item => item.candle).reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {cart.cartItems.filter(item => item.gift).length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Regalos ({cart.cartItems.filter(item => item.gift).length})</span>
                        <span>
                          {cart.cartItems
                            .filter(item => item.gift)
                            .reduce((sum, item) => sum + item.quantity, 0)} artículo{cart.cartItems.filter(item => item.gift).reduce((sum, item) => sum + item.quantity, 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${cart.cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Envío</span>
                      <span>Calculado en checkout</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      ${cart.cartItems.reduce((sum, item) => sum + Number(item.totalPrice), 0).toFixed(2)}
                    </span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    disabled={summary.totalItems === 0 || processingPayment}
                    onClick={handlePayment}
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Proceder al Pago'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link href="/mis-velas">
                      <Button variant="ghost" size="sm" className="text-sm">
                        Continuar comprando
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
