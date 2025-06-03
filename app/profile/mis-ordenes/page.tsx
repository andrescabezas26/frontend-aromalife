"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, ShoppingBag, Eye, Calendar, CreditCard, MapPin, User, Clock } from "lucide-react";
import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import { OrderService } from "@/services/orders/order.service";
import { Order, OrderStatus } from "@/types/order";

export default function MisOrdenesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esperar a que termine de cargar la autenticación
    if (authLoading) return;
    
    if (!user) {
      router.push("/login");
      return;
    }
    loadOrders();
  }, [user, authLoading, router]);

  const loadOrders = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userOrders = await OrderService.getByUser(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus órdenes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case OrderStatus.PROCESSING:
        return <Package className="h-4 w-4" />;
      case OrderStatus.SHIPPED:
        return <ShoppingBag className="h-4 w-4" />;
      case OrderStatus.DELIVERED:
        return <Package className="h-4 w-4" />;
      case OrderStatus.CANCELLED:
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>{authLoading ? "Verificando autenticación..." : "Cargando tus órdenes..."}</span>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mis Órdenes</h1>
          <p className="text-muted-foreground">
            Aquí puedes ver el estado de todas tus órdenes
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No tienes órdenes aún</h2>
              <p className="text-muted-foreground mb-6">
                Cuando realices tu primera compra, aparecerá aquí
              </p>
              <Button onClick={() => router.push("/home")}>
                Explorar Productos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Orden #{order.id.slice(-8)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`${OrderService.getStatusColor(order.status)} font-medium`}
                      >
                        {OrderService.getStatusLabel(order.status)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/profile/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="md:col-span-2">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Artículos ({order.items.length})
                      </h4>
                      <div className="space-y-3">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`p-2 rounded-lg ${item.candle ? 'bg-orange-100' : 'bg-purple-100'}`}>
                              {item.candle ? (
                                <Package className="h-4 w-4 text-orange-600" />
                              ) : (
                                <ShoppingBag className="h-4 w-4 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {item.candle?.name || item.gift?.name || `Artículo #${index + 1}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Cantidad: {item.quantity} • {OrderService.formatPrice(item.unitPrice)} c/u
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm">
                                {OrderService.formatPrice(item.totalPrice)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            +{order.items.length - 3} artículo(s) más
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4">
                      {/* Total */}
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total:</span>
                          <span className="text-xl font-bold text-orange-600">
                            {OrderService.formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Dirección de Envío
                        </h5>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{order.shippingAddress.street}</p>
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </p>
                          <p>
                            {order.shippingAddress.country} {order.shippingAddress.zipCode}
                          </p>
                        </div>
                      </div>

                      {/* Payment Details */}
                      {order.paymentDetails && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Pago
                          </h5>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Método: {order.paymentDetails.method}</p>
                            <div className="flex items-center justify-between">
                              <span>Estado:</span>
                              <Badge variant="outline" className="text-xs">
                                {order.paymentDetails.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
