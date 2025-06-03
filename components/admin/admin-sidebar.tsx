"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Users,
  Settings,
  Container,
  ChevronRight,
  Gift,
  Flower,
  Target,
  MapPin,
  List,
  Link2,
  ShoppingBag,
  Tag,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useState } from "react"
import { RoleGuard } from "@/components/auth/role-guard"

export function AdminSidebar() {
  const pathname = usePathname()
  const [isManagementOpen, setIsManagementOpen] = useState(true)

  return (
    <div className="w-64 border-r bg-background h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Panel de Control
          </h2>
          <div className="space-y-1">     
              <Link href="/admin/dashboard">
                <Button
                  variant={pathname === "/admin/dashboard" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            <RoleGuard requiredRoles={["admin"]}>
              <Link href="/admin/users">
                <Button
                  variant={pathname === "/admin/users" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Usuarios
                </Button>
              </Link>    
            </RoleGuard>       
              <Collapsible
                open={isManagementOpen}
                onOpenChange={setIsManagementOpen}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Management
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isManagementOpen && "rotate-90"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1">
                <Link href="/admin/management/places">
                  <Button
                    variant={pathname === "/admin/management/places" ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Lugares
                  </Button>
                </Link>
                <Link href="/admin/management/main-options">
                  <Button
                    variant={pathname === "/admin/management/main-options" ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                  >
                    <List className="mr-2 h-4 w-4" />
                    Categorías
                  </Button>
                </Link>
                <Link href="/admin/management/intended-impacts">
                  <Button
                    variant={pathname === "/admin/management/intended-impacts" ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    ¿Qué quiero provocar?
                  </Button>
                </Link>
                <Link href="/admin/management/containers">
                  <Button
                    variant={pathname === "/admin/management/containers" ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                  >
                    <Container className="mr-2 h-4 w-4" />
                    Contenedores
                  </Button>
                </Link>
                <Link href="/admin/management/aromas">
                  <Button
                    variant={pathname === "/admin/management/aromas" ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                  >
                    <Flower className="mr-2 h-4 w-4" />
                    Aromas
                  </Button>
                </Link>                <Link href="/admin/management/gifts">
                  <Button
                    variant={pathname === "/admin/management/gifts" ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Regalos
                  </Button>
                </Link>
                <Link href="/admin/management/labels">
                  <Button
                    variant={pathname === "/admin/management/labels" ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Etiquetas
                  </Button>
                </Link>
                <Link href="/admin/management/orders">
                  <Button
                    variant={pathname === "/admin/management/orders" ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Órdenes
                  </Button>
                </Link>
                <Link href="/admin/management/relations">
                  <Button
                    variant={pathname === "/admin/management/relations" ? "secondary" : "ghost"}
                    className="w-full justify-start pl-8"
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Relaciones
                  </Button>                </Link>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  )
}