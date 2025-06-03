"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { 
  Eye, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Phone,
  Edit,
  Package
} from "lucide-react"
import { Order, OrderStatus } from "@/types/order"
import { OrderService } from "@/services/orders/order.service"
import { useToast } from "@/hooks/use-toast"

interface OrdersTableProps {
  orders: Order[]
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => Promise<void>
}

export function OrdersTable({ orders, onStatusUpdate }: OrdersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // Si el estado es CANCELLED, mostrar confirmación
    if (newStatus === OrderStatus.CANCELLED) {
      setOrderToCancel(orderId)
      setShowCancelConfirmation(true)
      return
    }

    try {
      await onStatusUpdate(orderId, newStatus)
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleConfirmCancellation = async () => {
    if (!orderToCancel) return

    try {
      await onStatusUpdate(orderToCancel, OrderStatus.CANCELLED)
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
      setShowCancelConfirmation(false)
      setOrderToCancel(null)
    }
  }

  const handleWhatsAppContact = (order: Order) => {
    if (!order.userId?.phoneCountryCode || !order.userId?.phone) {
      toast({
        title: "Error",
        description: "No se encontró información de contacto del cliente",
        variant: "destructive",
      })
      return
    }
    
    const whatsappUrl = OrderService.generateWhatsAppUrl(
      order.userId.phoneCountryCode,
      order.userId.phone,
      order.id
    )
    window.open(whatsappUrl, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay órdenes</h3>
          <p className="text-muted-foreground text-center">
            No se encontraron órdenes que coincidan con los filtros aplicados.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Órdenes ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Artículos</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-mono text-sm">
                      #{order.id.slice(-8)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {order.userId?.name || 'N/A'} {order.userId?.lastName || ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.userId?.email || 'Email no disponible'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={order.status === OrderStatus.CANCELLED}
                        >
                          <Badge 
                            variant="outline" 
                            className={`${order.status === OrderStatus.CANCELLED ? '' : 'cursor-pointer'} ${OrderService.getStatusColor(order.status)}`}
                          >
                            {OrderService.getStatusLabel(order.status)}
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {Object.values(OrderStatus).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(order.id, status)}
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
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-semibold">
                      {OrderService.formatPrice(order.totalAmount)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {order.items?.length || 0} artículo{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} unidades
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWhatsAppContact(order)}
                        className="flex items-center gap-1"
                        disabled={!order.userId?.phoneCountryCode || !order.userId?.phone}
                      >
                        <WhatsAppIcon className="h-3 w-3 text-green-600" size={12} />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        {order.userId?.phoneCountryCode || ''} {order.userId?.phone || 'Sin teléfono'}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/management/orders/${order.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/management/orders/${order.id}/edit`)}
                          disabled={order.status === OrderStatus.CANCELLED}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {order.status === OrderStatus.CANCELLED ? "No editable" : "Editar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

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
            >
              Confirmar Cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
