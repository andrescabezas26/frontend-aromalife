"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  MapPin, 
  Calendar, 
  CreditCard,
  MessageCircle,
  Edit,
  Package,
  ShoppingBag,
  Phone,
  Mail,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { OrderService } from "@/services/orders/order.service"
import { Order, OrderStatus, OrderItem } from "@/types/order"
import { Candle } from "@/types/candle"
import { AdminCandleDetailModal } from "@/components/candles/admin-candle-detail-modal"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [selectedCandle, setSelectedCandle] = useState<OrderItem['candle'] | null>(null)

  const orderId = params.id as string

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      setIsLoading(true)
      const data = await OrderService.getById(orderId)
      setOrder(data)
    } catch (error) {
      console.error("Error loading order:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la orden",
        variant: "destructive",
      })
      router.push("/admin/management/orders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return

    // Si el estado es CANCELLED, mostrar confirmación
    if (newStatus === OrderStatus.CANCELLED) {
      setShowCancelConfirmation(true)
      return
    }

    try {
      setIsUpdatingStatus(true)
      await OrderService.updateStatus(order.id, newStatus)
      setOrder({ ...order, status: newStatus })
      toast({
        title: "Estado actualizado",
        description: "El estado de la orden se ha actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la orden",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleConfirmCancellation = async () => {
    if (!order) return

    try {
      setIsUpdatingStatus(true)
      await OrderService.updateStatus(order.id, OrderStatus.CANCELLED)
      setOrder({ ...order, status: OrderStatus.CANCELLED })
      toast({
        title: "Orden cancelada",
        description: "La orden ha sido cancelada correctamente",
      })
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Error",
        description: "No se pudo cancelar la orden",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
      setShowCancelConfirmation(false)
    }
  }

  const handleWhatsAppContact = () => {
    if (!order?.userId?.phone) return
    
    const whatsappUrl = `https://wa.me/${order.userId.phone}`
    window.open(whatsappUrl, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando orden...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Orden no encontrada</h2>
          <p className="text-muted-foreground mb-6">
            La orden que buscas no existe o ha sido eliminada.
          </p>
          <Button onClick={() => router.push("/admin/management/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Órdenes
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/management/orders")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Órdenes
          </Button>
          <div className="flex-1">
            <h1 data-testid="order-details" className="text-3xl font-bold tracking-tight">
              Orden #{order.id.slice(-8)}
            </h1>
            <p className="text-muted-foreground">
              Creada el {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  disabled={isUpdatingStatus || order.status === OrderStatus.CANCELLED}
                >
                  <Badge 
                    variant="outline" 
                    className={`mr-2 ${OrderService.getStatusColor(order.status)}`}
                  >
                    {OrderService.getStatusLabel(order.status)}
                  </Badge>
                  {order.status === OrderStatus.CANCELLED ? "Estado Final" : "Cambiar Estado"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.values(OrderStatus).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={order.status === status}
                  >
                    <Badge 
                      variant="outline" 
                      className={`mr-2 ${OrderService.getStatusColor(status)}`}
                    >
                      {OrderService.getStatusLabel(status)}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={() => router.push(`/admin/management/orders/${order.id}/edit`)}
              disabled={order.status === OrderStatus.CANCELLED}
            >
              <Edit className="h-4 w-4 mr-2" />
              {order.status === OrderStatus.CANCELLED ? "No Editable" : "Editar"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Artículos de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.candle ? 'bg-orange-100' : 'bg-purple-100'}`}>
                          {item.candle ? (
                            <Package className="h-4 w-4 text-orange-600" />
                          ) : (
                            <ShoppingBag className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {item.candle?.name || item.gift?.name || `Artículo #${index + 1}`}
                          </h4>
                          {item.candle && (
                            <div className="text-sm text-muted-foreground space-y-1">
                              {item.candle.aroma && (
                                <div>Aroma: {item.candle.aroma.name}</div>
                              )}
                              {item.candle.container && (
                                <div>Contenedor: {item.candle.container.name}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold">
                          ${Number(item.totalPrice).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} x ${Number(item.unitPrice).toFixed(2)}
                        </div>
                      </div>                      {/* Eye button only for candles */}
                      {item.candle && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandle(item.candle || null)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    ${Number(order.totalAmount).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Dirección de Envío
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">{order.shippingAddress.street}</div>
                    <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                    <div>{order.shippingAddress.country} - {order.shippingAddress.zipCode}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Detalles de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Método:</span>
                    <span className="font-medium">{order.paymentDetails?.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ID Transacción:</span>
                    <span className="font-mono text-sm">{order.paymentDetails?.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <Badge variant="outline">{order.paymentDetails?.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold text-lg">
                    {order.userId?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cliente
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{order.userId?.email || 'Email no disponible'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {order.userId?.phone || 'Sin teléfono'}
                    </span>
                  </div>
                </div>

                <Separator />

                <Button 
                  onClick={handleWhatsAppContact}
                  className="w-full"
                  variant="outline"
                  disabled={!order.userId?.phone}
                >
                  <WhatsAppIcon className="h-3 w-3 text-green-600" size={12} />
                  <span className="hidden sm:inline">Contactar por WhatsApp</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Historial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Creada:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Última actualización:</span>
                  <span>{formatDate(order.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancel Order Confirmation Dialog */}
        <AlertDialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Cancelación</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas cancelar esta orden? 
                <br />
                <br />
                <strong>Advertencia:</strong> Una vez cancelada, la orden no podrá ser editada ni se podrá cambiar su estado. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowCancelConfirmation(false)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmCancellation} 
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? "Cancelando..." : "Confirmar Cancelación"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>        </AlertDialog>

        {/* Admin Candle Detail Modal */}
        <AdminCandleDetailModal
          candle={selectedCandle}
          open={!!selectedCandle}
          onOpenChange={(open) => !open && setSelectedCandle(null)}
        />
      </div>
    </AdminLayout>
  )
}
