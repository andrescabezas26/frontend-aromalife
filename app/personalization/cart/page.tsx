"use client";

import { Progress } from "@/components/ui/progress";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePersonalizationStore } from "@/stores/personalization-store";
import { usePreviewNavigation } from "@/hooks/use-preview-navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Gift,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  ArrowLeft,
} from "lucide-react";

export default function CarritoPage() {
  const router = useRouter();
  const { fromPreview, handleNext } = usePreviewNavigation();
  const {
    container,
    intendedImpact,
    message,
    fragrance,
    label,
    place,
    getProgress,
  } = usePersonalizationStore();

  const [quantity, setQuantity] = useState(1);
  const [subscription, setSubscription] = useState(false);
  const [addons, setAddons] = useState<string[]>([]);
  const [packSize, setPackSize] = useState<number>(1);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  const handleAddonToggle = (addon: string) => {
    if (addons.includes(addon)) {
      setAddons(addons.filter((a) => a !== addon));
    } else {
      setAddons([...addons, addon]);
    }
  };

  const calculateTotal = () => {
    let total = 35 * quantity * packSize; // Base price

    // Add price for addons
    if (addons.includes("jabones")) total += 15;
    if (addons.includes("flores")) total += 20;
    if (addons.includes("chocolates")) total += 18;
    if (addons.includes("religiosa")) total += 12;

    return total;
  };

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Finaliza tu pedido</h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">Paso 10 de 10</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <h2 className="text-xl font-semibold">Tu carrito</h2>
                <ShoppingCart className="ml-auto h-5 w-5" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center relative">
                    <div
                      className="w-8 h-20 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: fragrance?.color || "#f3f4f6" }}
                    >
                      {label?.imageUrl && (
                        <div
                          className="w-full h-8 bg-center bg-cover rounded-t-full"
                          style={{ backgroundImage: `url(${label.imageUrl})` }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">
                      Vela Personalizada - {fragrance?.name || "Sin fragancia"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Contenedor: {container?.name || "No seleccionado"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mensaje: "{message || "Sin mensaje"}"
                    </p>
                    {place && (
                      <p className="text-sm text-muted-foreground">
                        Lugar: {place.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$35.00</p>
                    <div className="flex items-center mt-2 border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => handleQuantityChange(-1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => handleQuantityChange(1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Selección de caja</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Card
                      className={`cursor-pointer ${
                        packSize === 1 ? "border-primary" : ""
                      }`}
                      onClick={() => setPackSize(1)}
                    >
                      <CardContent className="p-4 text-center">
                        <p className="font-medium">Individual</p>
                        <p className="text-2xl font-bold mt-1">$35</p>
                        <p className="text-xs text-muted-foreground">1 vela</p>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer ${
                        packSize === 5 ? "border-primary" : ""
                      }`}
                      onClick={() => setPackSize(5)}
                    >
                      <CardContent className="p-4 text-center">
                        <p className="font-medium">Pack</p>
                        <p className="text-2xl font-bold mt-1">$150</p>
                        <p className="text-xs text-muted-foreground">5 velas</p>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer ${
                        packSize === 9 ? "border-primary" : ""
                      }`}
                      onClick={() => setPackSize(9)}
                    >
                      <CardContent className="p-4 text-center">
                        <p className="font-medium">Caja</p>
                        <p className="text-2xl font-bold mt-1">$250</p>
                        <p className="text-xs text-muted-foreground">9 velas</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3">Agregar regalos extra</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="jabones"
                        checked={addons.includes("jabones")}
                        onCheckedChange={() => handleAddonToggle("jabones")}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="jabones">Jabones aromáticos</Label>
                        <p className="text-sm text-muted-foreground">+$15.00</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="flores"
                        checked={addons.includes("flores")}
                        onCheckedChange={() => handleAddonToggle("flores")}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="flores">Flores secas</Label>
                        <p className="text-sm text-muted-foreground">+$20.00</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="chocolates"
                        checked={addons.includes("chocolates")}
                        onCheckedChange={() => handleAddonToggle("chocolates")}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="chocolates">
                          Chocolates artesanales
                        </Label>
                        <p className="text-sm text-muted-foreground">+$18.00</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="religiosa"
                        checked={addons.includes("religiosa")}
                        onCheckedChange={() => handleAddonToggle("religiosa")}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="religiosa">Imagen religiosa</Label>
                        <p className="text-sm text-muted-foreground">+$12.00</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="subscription"
                    checked={subscription}
                    onCheckedChange={() => setSubscription(!subscription)}
                  />
                  <div className="grid gap-1.5">
                    <Label htmlFor="subscription">Suscripción mensual</Label>
                    <p className="text-sm text-muted-foreground">
                      Deseo recibir una vela personalizada cada mes con un 15%
                      de descuento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Información de envío</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" placeholder="tu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" placeholder="Tu número de teléfono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input id="address" placeholder="Calle y número" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" placeholder="Tu ciudad" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Código postal</Label>
                    <Input id="postal" placeholder="Código postal" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Input
                    id="notes"
                    placeholder="Instrucciones especiales para la entrega"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <h2 className="text-xl font-semibold">Resumen del pedido</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Vela personalizada ({quantity} x {packSize})
                    </span>
                    <span>${(35 * quantity * packSize).toFixed(2)}</span>
                  </div>

                  {/* Show personalization summary */}
                  <div className="text-xs text-muted-foreground space-y-1 pl-2 border-l-2 border-muted">
                    <div>Fragancia: {fragrance?.name || "No seleccionada"}</div>
                    <div>
                      Contenedor: {container?.name || "No seleccionado"}
                    </div>
                    {intendedImpact && (
                      <div>Propósito: {intendedImpact.name}</div>
                    )}
                    {place && <div>Lugar: {place.name}</div>}
                  </div>

                  {addons.includes("jabones") && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Jabones aromáticos
                      </span>
                      <span>$15.00</span>
                    </div>
                  )}

                  {addons.includes("flores") && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Flores secas
                      </span>
                      <span>$20.00</span>
                    </div>
                  )}

                  {addons.includes("chocolates") && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Chocolates artesanales
                      </span>
                      <span>$18.00</span>
                    </div>
                  )}

                  {addons.includes("religiosa") && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Imagen religiosa
                      </span>
                      <span>$12.00</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span>$8.00</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>${(calculateTotal() + 8).toFixed(2)}</span>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <div className="flex items-start gap-2">
                    <Gift className="h-4 w-4 mt-0.5 text-primary" />
                    <p>Envío gratis en pedidos superiores a $100</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Tiempo estimado de entrega: 3-5 días
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagar ahora
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Al completar tu compra, aceptas nuestros términos y
                  condiciones
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          {fromPreview && (
            <Button
              variant="outline"
              onClick={() => handleNext("/personalization/preview")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Preview
            </Button>
          )}
          {!fromPreview && (
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
          )}

          <div className="flex gap-4">
            {/* The "Pagar ahora" button is already inside the card above */}
          </div>
        </div>
      </div>
    </div>
  );
}
