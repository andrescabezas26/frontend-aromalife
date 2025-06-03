"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Loader2, 
  Save,
  MapPin,
  CreditCard
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { OrderService } from "@/services/orders/order.service"
import { Order, OrderStatus } from "@/types/order"

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    status: OrderStatus.PENDING,
    totalAmount: 0,
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    paymentDetails: {
      method: "",
      transactionId: "",
      status: "",
    }
  })

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
      setFormData({
        status: data.status,
        totalAmount: data.totalAmount,
        shippingAddress: data.shippingAddress,
        paymentDetails: data.paymentDetails || {
          method: "",
          transactionId: "",
          status: "",
        }
      })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!order) return

    // Si el nuevo estado es CANCELLED, mostrar confirmación
    if (formData.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      setShowCancelConfirmation(true)
      return
    }

    await saveOrder()
  }

  const saveOrder = async () => {
    if (!order) return

    try {
      setIsSaving(true)
      
      const updateData = {
        status: formData.status,
        shippingAddress: formData.shippingAddress,
      }

      await OrderService.update(order.id, updateData)
      
      toast({
        title: "Orden actualizada",
        description: "La orden se ha actualizado correctamente",
      })
      
      router.push(`/admin/management/orders/${order.id}`)
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la orden",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmCancellation = async () => {
    setShowCancelConfirmation(false)
    await saveOrder()
  }

  const handleInputChange = (field: string, value: any, nested?: string) => {
    setFormData(prev => {
      if (nested) {
        const nestedObj = prev[nested as keyof typeof prev] as any
        return {
          ...prev,
          [nested]: {
            ...nestedObj,
            [field]: value
          }
        }
      }
      return {
        ...prev,
        [field]: value
      }
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

  // Check if order is cancelled
  if (order.status === OrderStatus.CANCELLED) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Orden Cancelada</h2>
          <p className="text-muted-foreground mb-6">
            Esta orden ha sido cancelada y no se puede editar.
          </p>
          <Button onClick={() => router.push(`/admin/management/orders/${order.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Detalles
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
            onClick={() => router.push(`/admin/management/orders/${order.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Detalles
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar Orden #{order.id.slice(-8)}
            </h1>
            <p className="text-muted-foreground">
              Modifica los detalles de la orden
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Orden</CardTitle>
              </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value as OrderStatus)}
                  >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OrderStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {OrderService.getStatusLabel(status)}
                    </SelectItem>
                    ))}
                  </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                  Si cambias el estado de la orden desde aquí, el cliente <strong>no será notificado</strong>. 
                  Si deseas notificarlo, cambia el estado desde la tabla de órdenes o desde la vista de detalles de la orden.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total (COP)</Label>
                  <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  disabled
                  className="bg-muted"
                  />
                </div>
                </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Detalles de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pago</Label>
                  <Input
                    id="paymentMethod"
                    value={formData.paymentDetails.method}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">ID de Transacción</Label>
                  <Input
                    id="transactionId"
                    value={formData.paymentDetails.transactionId}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Estado del Pago</Label>
                  <Input
                    id="paymentStatus"
                    value={formData.paymentDetails.status}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Dirección</Label>
                  <Textarea
                    id="street"
                    value={formData.shippingAddress.street}
                    onChange={(e) => handleInputChange("street", e.target.value, "shippingAddress")}
                    placeholder="Calle, número, apartamento, etc."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleInputChange("city", e.target.value, "shippingAddress")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Departamento/Estado</Label>
                  <Input
                    id="state"
                    value={formData.shippingAddress.state}
                    onChange={(e) => handleInputChange("state", e.target.value, "shippingAddress")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.shippingAddress.country}
                    onChange={(e) => handleInputChange("country", e.target.value, "shippingAddress")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Código Postal</Label>
                  <Input
                    id="zipCode"
                    value={formData.shippingAddress.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value, "shippingAddress")}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/management/orders/${order.id}`)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

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
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Confirmar Cancelación"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
