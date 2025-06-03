"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShoppingBag, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { OrderService } from "@/services/orders/order.service"
import { Order, OrderStatus } from "@/types/order"
import { OrdersTable } from "@/components/orders/orders-table"
import { Input } from "@/components/ui/input"

export default function OrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL")
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => {
    loadOrders()
  }, [currentPage, searchTerm, statusFilter]) // Recargar cuando cambien estos valores

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const data = await OrderService.getAll(
        currentPage, 
        limit, 
        searchTerm || undefined, 
        statusFilter !== "ALL" ? statusFilter : undefined
      )
      setOrders(data.orders)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (error) {
      console.error("Error loading orders:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await OrderService.updateStatus(orderId, newStatus)
      await loadOrders() // Recargar la página actual
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
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Resetear a la primera página cuando se busque
  }

  const handleStatusFilterChange = (status: OrderStatus | "ALL") => {
    setStatusFilter(status)
    setCurrentPage(1) // Resetear a la primera página cuando se filtre
  }  
  const getOrderStats = () => {
    // Verificar que orders no sea undefined o null
    const safeOrders = orders || []
    
    // Estos stats ahora solo reflejan la página actual, pero el total es el real
    const stats = {
      total: total, // Total real de la base de datos
      pending: safeOrders.filter(o => o.status === OrderStatus.PENDING).length,
      processing: safeOrders.filter(o => o.status === OrderStatus.PROCESSING).length,
      shipped: safeOrders.filter(o => o.status === OrderStatus.SHIPPED).length,
      delivered: safeOrders.filter(o => o.status === OrderStatus.DELIVERED).length,
      cancelled: safeOrders.filter(o => o.status === OrderStatus.CANCELLED).length,
    }
    return stats
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando órdenes...</span>
          </div>
        </div>
      </AdminLayout>
    )  }

  const stats = getOrderStats()

  return (
    <AdminLayout>
      <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">            <div>
              <h1 className="text-3xl font-bold tracking-tight">Órdenes</h1>
              <p className="text-muted-foreground">
                Gestiona todas las órdenes de los clientes ({total} órdenes total)
              </p>
            </div>
        </div>

        <div className="mt-3 p-4 bg-muted/50 rounded-lg border">
          <h4 className="text-sm font-medium mb-3">Estados de las órdenes:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-md bg-yellow-50 border border-yellow-200">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="flex-1">
                <span className="text-sm font-medium text-yellow-800">Pendiente:</span>
                <span className="text-xs text-yellow-700 ml-2">Orden creada, esperando procesamiento</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-md bg-blue-50 border border-blue-200">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <span className="text-sm font-medium text-blue-800">Procesando:</span>
                <span className="text-xs text-blue-700 ml-2">Orden aceptada, preparando la vela</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-md bg-purple-50 border border-purple-200">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <div className="flex-1">
                <span className="text-sm font-medium text-purple-800">Enviado:</span>
                <span className="text-xs text-purple-700 ml-2">Orden enviada al cliente</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-md bg-green-50 border border-green-200">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <span className="text-sm font-medium text-green-800">Entregado:</span>
                <span className="text-xs text-green-700 ml-2">Orden entregada exitosamente</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-md bg-red-50 border border-red-200">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="flex-1">
                <span className="text-sm font-medium text-red-800">Cancelado:</span>
                <span className="text-xs text-red-700 ml-2">Orden cancelada (no se puede editar)</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> Los clientes serán notificados automáticamente cuando cambies el estado de sus órdenes.
              </p>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />              <Input
                placeholder="Buscar por ID, cliente o email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">            <Button
              variant={statusFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusFilterChange("ALL")}
            >
              Todas
            </Button>
            {Object.values(OrderStatus).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusFilterChange(status)}
              >
                <Badge 
                  variant="outline" 
                  className={`mr-1 ${OrderService.getStatusColor(status)}`}
                >
                  {OrderService.getStatusLabel(status)}
                </Badge>
              </Button>
            ))}
          </div>        </div>        
        
        {/* Orders Table */}
        <OrdersTable 
          orders={orders}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} ({total} órdenes total)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
