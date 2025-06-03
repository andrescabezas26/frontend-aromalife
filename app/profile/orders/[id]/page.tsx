"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Loader2, 
  MapPin, 
  Package, 
  ShoppingBag, 
  User,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { MainLayout } from "@/components/layouts/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth-store";
import { OrderService } from "@/services/orders/order.service";
import { UserService } from "@/services/users/user.service";
import { Order, OrderStatus } from "@/types/order";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminWhatsApp, setAdminWhatsApp] = useState<string>("");

  const orderId = params.id as string;

  useEffect(() => {
    // Esperar a que termine de cargar la autenticación
    if (authLoading) return;
    
    if (!user) {
      router.push("/login");
      return;
    }
    if (orderId) {
      loadOrder();
      loadAdminWhatsApp();
    }
  }, [user, authLoading, orderId, router]);

  const loadAdminWhatsApp = async () => {
    try {
      const adminPhoneData = await UserService.getAdminPhone();
      setAdminWhatsApp(adminPhoneData.fullPhone);
    } catch (error) {
      console.error("Error loading admin WhatsApp:", error);
      // Fallback to hardcoded number if admin info can't be loaded
      setAdminWhatsApp("573053000000");
    }
  };

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await OrderService.getById(orderId);
      
      // Verificar que la orden pertenece al usuario actual
      if (orderData.userId?.id !== user?.id) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos para ver esta orden",
          variant: "destructive",
        });
        router.push("/profile/mis-ordenes");
        return;
      }
      
      setOrder(orderData);
    } catch (error) {
      console.error("Error loading order:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la orden",
        variant: "destructive",
      });
      router.push("/profile/mis-ordenes");
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
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case OrderStatus.PROCESSING:
        return <Package className="h-5 w-5 text-blue-600" />;
      case OrderStatus.SHIPPED:
        return <Truck className="h-5 w-5 text-purple-600" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case OrderStatus.CANCELLED:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "Tu pedido está pendiente de confirmación. Te contactaremos pronto para confirmar los detalles.";
      case OrderStatus.PROCESSING:
        return "¡Excelente! Tu pedido está siendo preparado con mucho amor. Nuestros artesanos están trabajando en tus velas personalizadas.";
      case OrderStatus.SHIPPED:
        return "🚚 Tu pedido ya está en camino! En breve recibirás el número de seguimiento para que puedas rastrear tu envío.";
      case OrderStatus.DELIVERED:
        return "🎉 ¡Tu pedido ha sido entregado! Esperamos que disfrutes mucho tus nuevas velas aromáticas.";
      case OrderStatus.CANCELLED:
        return "Tu pedido ha sido cancelado. Si tienes alguna pregunta, no dudes en contactarnos.";
      default:
        return "El estado de tu pedido ha sido actualizado.";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando orden...</span>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Orden no encontrada</h2>
            <p className="text-muted-foreground mb-6">
              La orden que buscas no existe o no tienes permisos para verla.
            </p>
            <Button onClick={() => router.push("/profile/mis-ordenes")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Órdenes
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/profile/mis-ordenes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Órdenes
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Orden #{order.id.slice(-8)}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Realizada el {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status)}
            <Badge 
              variant="outline" 
              className={`${OrderService.getStatusColor(order.status)} font-medium text-sm px-3 py-1`}
            >
              {OrderService.getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>

        {/* Status Message */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {getStatusIcon(order.status)}
              <div>
                <h3 className="font-semibold mb-2">Estado actual: {OrderService.getStatusLabel(order.status)}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {getStatusMessage(order.status)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Artículos de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
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
                                <p>Aroma: {item.candle.aroma.name}</p>
                              )}
                              {item.candle.container && (
                                <p>Recipiente: {item.candle.container.name}</p>
                              )}
                              {item.candle.label && (
                                <p>Etiqueta: {item.candle.label.name}</p>
                              )}
                              {item.candle.message && (
                                <p>Mensaje: "{item.candle.message}"</p>
                              )}
                            </div>
                          )}
                          {item.gift && (
                            <p className="text-sm text-muted-foreground">
                              {item.gift.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} x {OrderService.formatPrice(item.unitPrice)}
                      </div>
                      <div className="font-semibold">
                        {OrderService.formatPrice(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    {OrderService.formatPrice(order.totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Info Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Dirección de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.country} {order.shippingAddress.zipCode}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  ¿Quieres cambiar tu dirección de envío? Comunícate con nosotros por WhatsApp:&nbsp;
                  <a
                    href={`https://wa.me/${adminWhatsApp || '573053000000'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 underline"
                  >
                    Aromalife WhatsApp
                  </a>
                </p>
              </CardContent>
            </Card>

            {/* Payment Details */}
            {order.paymentDetails && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Información de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Método:</span>
                    <span className="font-medium">{order.paymentDetails.method}</span>
                  </div>
                  {order.paymentDetails.transactionId && (
                    <div className="flex justify-between">
                      <span>ID Transacción:</span>
                      <span className="font-mono text-sm">{order.paymentDetails.transactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <Badge variant="outline">{order.paymentDetails.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Línea de Tiempo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">Orden creada</div>
                    <div className="text-muted-foreground">{formatDate(order.createdAt)}</div>
                  </div>
                </div>
                {order.updatedAt !== order.createdAt && (
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <div className="font-medium">Última actualización</div>
                      <div className="text-muted-foreground">{formatDate(order.updatedAt)}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
