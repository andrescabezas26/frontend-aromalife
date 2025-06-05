"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Package } from "lucide-react";
import { CartIcon } from "./cart-icon";

export function NavItems() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost">Iniciar Sesión</Button>
        </Link>
        <Link href="/register">
          <Button>Registrarse</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4">
      <Link href="/home">
        <Button
          variant="ghost"
          className={cn(pathname === "/home" && "bg-muted")}
        >
          Inicio
        </Button>
      </Link>{" "}
      <Link href="/home">
        <Button
          variant="ghost"
          className={cn(pathname.startsWith("/candle-selection") && "bg-muted")}
        >
          Crear Vela
        </Button>
      </Link>{" "}
      <Link href="/mis-velas">
        <Button
          variant="ghost"
          className={cn(pathname === "/mis-velas" && "bg-muted")}
        >
          Mis Velas
        </Button>
      </Link>
      <Link href="/profile/mis-ordenes">
        <Button
          variant="ghost"
          className={cn(
            pathname.startsWith("/profile/mis-ordenes") && "bg-muted"
          )}
        >
          Mis Órdenes{" "}
        </Button>
      </Link>
      {(user?.roles.includes("admin") || user?.roles.includes("manager")) && (
        <Link href="/admin/dashboard">
          <Button
            variant="ghost"
            className={cn(pathname.startsWith("/admin") && "bg-muted")}
          >
            Admin
          </Button>
        </Link>
      )}
      {/* Cart Icon */}
      <CartIcon className={cn(pathname === "/cart" && "bg-muted")} />      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full ml-4"
            data-testid="user-menu"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user?.profilePicture || ""}
                alt={user?.name || "Usuario"}
              />
              <AvatarFallback>
                {user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user?.name}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user?.email}
              </p>{" "}
            </div>
          </div>{" "}
          <DropdownMenuItem asChild>
            <Link href={`/profile/${user?.id}`} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/mis-ordenes" className="cursor-pointer">
              <Package className="mr-2 h-4 w-4" />
              Mis Órdenes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" data-testid="logout-button">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
