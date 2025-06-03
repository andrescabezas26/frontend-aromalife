"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { useAuthStore } from "@/stores/auth-store"
import { cn } from "@/lib/utils"

interface CartIconProps {
  className?: string
  variant?: "ghost" | "outline" | "default"
  showText?: boolean
}

export function CartIcon({ className, variant = "ghost", showText = false }: CartIconProps) {
  const { isAuthenticated } = useAuthStore()
  const { getItemCount } = useCartStore()
  
  if (!isAuthenticated) {
    return null
  }

  const itemCount = getItemCount()

  return (
    <Link href="/cart">
      <Button variant={variant} className={cn("relative gap-2", className)}>
        <ShoppingCart className="h-4 w-4" />
        {showText && "Carrito"}
        {itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  )
}
