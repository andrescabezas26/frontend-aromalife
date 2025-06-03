"use client"

import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Settings, Home } from "lucide-react"

export function AdminNavItems() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/admin/dashboard">
        <Button variant="ghost" className={cn(pathname === "/admin/dashboard" && "bg-muted")}>
          Dashboard
        </Button>
      </Link>
      
      <Link href="/home">
        <Button variant="ghost" className={cn("text-muted-foreground hover:text-foreground")}>
          <Home className="h-4 w-4 mr-2" />
          Ir a Tienda
        </Button>
      </Link>

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={user?.profilePicture || ''} 
                alt={user?.name || 'Administrador'} 
              />
              <AvatarFallback>
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
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
              </p>
              <p className="text-xs text-orange-600 font-medium">
                Administrador
              </p>
            </div>
          </div>
          <DropdownMenuItem asChild>
            <Link href={`/profile/${user?.id}`} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
