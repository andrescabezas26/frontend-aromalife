'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Candle } from '@/types/candle';
import { Flame } from 'lucide-react';

interface AddToCartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candle: Candle | null;
  onConfirm: (quantity: number, unitPrice: number, totalPrice: number) => void;
}

export function AddToCartModal({
  open,
  onOpenChange,
  candle,
  onConfirm,
}: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);
  
  if (!candle) return null;
  
  // Asegurar que el precio sea un número
  const unitPrice = typeof candle.price === 'string' 
    ? parseFloat(candle.price) || 0
    : Number(candle.price) || 0;
  
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    if (quantity > 0 && unitPrice > 0) {
      onConfirm(quantity, unitPrice, totalPrice);
      onOpenChange(false);
      setQuantity(1); // Reset quantity
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  };
  const handleCloseChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setQuantity(1); // Reset quantity when closing
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Añadir al carrito
          </DialogTitle>
          <DialogDescription>
            Selecciona la cantidad de "{candle.name}" que deseas añadir al carrito.
          </DialogDescription>
        </DialogHeader>
          <div className="grid gap-4 py-4">
          {/* Información de la vela */}
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <Flame className="w-12 h-12 text-orange-500" />
            <div>
              <h3 className="font-medium text-gray-900">{candle.name}</h3>
              {candle.description && (
                <p className="text-sm text-gray-600">{candle.description}</p>
              )}
            </div>
          </div>

          {/* Campo de cantidad */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right font-medium">
              Cantidad
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="col-span-3"
              placeholder="Ingresa la cantidad"
            />
          </div>
          
          {/* Precio unitario */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Precio unitario:</Label>
            <span className="col-span-3 font-medium text-gray-900">
              ${unitPrice.toFixed(2)}
            </span>
          </div>
          
          {/* Total */}
          <div className="grid grid-cols-4 items-center gap-4 border-t pt-3">
            <Label className="text-right font-medium">Total:</Label>
            <span className="col-span-3 font-bold text-lg text-orange-600">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
          <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={quantity <= 0 || unitPrice <= 0}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Añadir al carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
