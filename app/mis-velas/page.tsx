"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Package,
  Calendar,
  Palette,
  Eye,
  Tag,
  ShoppingCart,
  Plus,
  Trash2,
  Box,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MainLayout } from "@/components/layouts/main-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { CandleService } from "@/services/candles/candle.service";
import { Candle } from "@/types/candle";
import { useToast } from "@/hooks/use-toast";
import { CandleDetailModal } from "@/components/candles/candle-detail-modal";
import { AddToCartModal } from "@/components/cart/add-to-cart-modal";
import Link from "next/link";

export default function MisVelasPage() {
  const { user, isAuthenticated } = useAuthStore();
  const {
    cart,
    loading: cartLoading,
    addItemToCart,
    createCart,
    loadUserCart,
    getItemCount,
  } = useCartStore();
  const { toast } = useToast();
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandle, setSelectedCandle] = useState<Candle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const [deletingCandles, setDeletingCandles] = useState<Set<string>>(
    new Set()
  );

  // Estados para el modal de añadir al carrito
  const [addToCartModalOpen, setAddToCartModalOpen] = useState(false);
  const [selectedCandleForCart, setSelectedCandleForCart] =
    useState<Candle | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchUserCandles = async () => {
      try {
        setLoading(true);
        const userCandles = await CandleService.getByUser(user.id);
        setCandles(userCandles);

        // Cargar el carrito del usuario
        await loadUserCart(user.id);
      } catch (error) {
        console.error("Error fetching user candles:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus velas. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserCandles();
  }, [user, isAuthenticated, toast, loadUserCart]);
  const handleCandleClick = (candle: Candle, event: React.MouseEvent) => {
    // Prevent modal from opening if clicking on buttons
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }
    setSelectedCandle(candle);
    setModalOpen(true);
  };

  const handleAddToCart = async (candle: Candle) => {
    setSelectedCandleForCart(candle);
    setAddToCartModalOpen(true);
  };

  const handleConfirmAddToCart = async (
    quantity: number,
    unitPrice: number,
    totalPrice: number
  ) => {
    if (!selectedCandleForCart || !user) return;

    setAddingToCart((prev) => new Set([...prev, selectedCandleForCart.id]));

    try {
      console.log("🛒 Añadiendo al carrito:", {
        candleId: selectedCandleForCart.id,
        quantity,
        unitPrice,
        totalPrice,
      });

      // Si no hay carrito, crear uno
      let currentCartId = cart?.id;
      if (!currentCartId) {
        await createCart(user.id);
        // Después de crear el carrito, necesitamos obtener el ID actualizado
        const state = useCartStore.getState();
        currentCartId = state.cart?.id;
      }

      if (!currentCartId) {
        throw new Error("No se pudo crear o acceder al carrito");
      }

      await addItemToCart(currentCartId, {
        candleId: selectedCandleForCart.id,
        quantity,
        unitPrice,
      });

      toast({
        title: "¡Agregado al carrito!",
        description: `${
          selectedCandleForCart.name || "Vela"
        } se agregó a tu carrito.`,
      });

      setSelectedCandleForCart(null);
      setAddToCartModalOpen(false);
    } catch (error) {
      console.error("❌ Error al añadir vela al carrito:", error);
      toast({
        title: "Error",
        description:
          "No se pudo agregar la vela al carrito. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setAddingToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedCandleForCart.id);
        return newSet;
      });
    }
  };

  const handleDeleteCandle = async (candleId: string, candleName?: string) => {
    if (!user) return;

    setDeletingCandles((prev) => new Set([...prev, candleId]));

    try {
      await CandleService.delete(candleId);

      // Remove candle from local state
      setCandles((prev) => prev.filter((candle) => candle.id !== candleId));

      toast({
        title: "¡Vela eliminada!",
        description: `${
          candleName || "La vela"
        } ha sido eliminada exitosamente.`,
      });
    } catch (error) {
      console.error("❌ Error al eliminar vela:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la vela. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setDeletingCandles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(candleId);
        return newSet;
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center justify-center min-h-[60vh] py-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Mis Velas</h1>
            <p className="text-muted-foreground mb-6">
              Debes iniciar sesión para ver tus velas personalizadas
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center justify-center min-h-[60vh] py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-4">Cargando tus velas...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10">
        {" "}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Mis Velas</h1>
              <p className="text-muted-foreground">
                Aquí puedes ver todas las velas que has personalizado
              </p>
            </div>
          </div>

          <Link href="/cart">
            <Button variant="outline" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Carrito ({getItemCount()})
            </Button>
          </Link>
        </div>
        {candles.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No tienes velas aún</h2>
            <p className="text-muted-foreground mb-6">
              ¡Crea tu primera vela personalizada para comenzar!
            </p>
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <a
                  href="/personalization/welcome"
                  className="inline-block w-full"
                >
                  <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                    Crear mi primera vela
                  </button>
                </a>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candles.map((candle) => (
              <Card
                key={candle.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={(e) => handleCandleClick(candle, e)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 flex items-center gap-2">
                        {candle.name || `Vela #${candle.id}`}
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span title="Ver modelo 3D">
                            <Box className="h-4 w-4 text-blue-500" />
                          </span>
                        </div>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Creada el{" "}
                        {new Date(candle.createdAt).toLocaleDateString("es-ES")}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Personalizada</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Aroma */}
                  {candle.aroma && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Palette className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Aroma</p>
                        <p className="text-sm text-muted-foreground">
                          {candle.aroma.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Contenedor */}
                  {candle.container && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Contenedor</p>
                        <p className="text-sm text-muted-foreground">
                          {candle.container.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Etiqueta */}
                  {candle.label && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Tag className="h-5 w-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Etiqueta</p>
                        <p className="text-sm text-muted-foreground">
                          {candle.label.name}
                        </p>
                        {candle.label.text && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            &quot;
                            {candle.label.text.length > 30
                              ? `${candle.label.text.substring(0, 30)}...`
                              : candle.label.text}
                            &quot;
                          </p>
                        )}
                      </div>
                    </div>
                  )}{" "}
                  {/* Precio Total */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total:
                      </span>
                      <span className="font-bold text-lg text-primary">
                        $
                        {candle.price?.toLocaleString("es-ES") ||
                          "No disponible"}
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={() => handleAddToCart(candle)}
                      disabled={addingToCart.has(candle.id) || !candle.price}
                      className="w-full gap-2"
                    >
                      {addingToCart.has(candle.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      {addingToCart.has(candle.id)
                        ? "Agregando..."
                        : "Agregar al Carrito"}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={deletingCandles.has(candle.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        >
                          {deletingCandles.has(candle.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          {deletingCandles.has(candle.id)
                            ? "Eliminando..."
                            : "Eliminar Vela"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar vela?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará
                            permanentemente la vela{" "}
                            <strong>
                              &quot;{candle.name || `#${candle.id}`}&quot;
                            </strong>{" "}
                            de tu cuenta.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteCandle(candle.id, candle.name)
                            }
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}{" "}
        {/* Modal de detalles */}
        <CandleDetailModal
          candle={selectedCandle}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onDelete={handleDeleteCandle}
          isDeleting={
            selectedCandle ? deletingCandles.has(selectedCandle.id) : false
          }
        />
        {/* Modal de añadir al carrito */}
        <AddToCartModal
          candle={selectedCandleForCart}
          open={addToCartModalOpen}
          onOpenChange={setAddToCartModalOpen}
          onConfirm={handleConfirmAddToCart}
        />
      </div>
    </MainLayout>
  );
}
