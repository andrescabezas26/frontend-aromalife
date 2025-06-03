"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Container, 
  Package, 
  Target,
  MapPin,
  Layers,
  Loader2
} from "lucide-react"
import { UserService } from "@/services/users/user.service"
import { ContainerService } from "@/services/containers/container.service"
import { AromaService } from "@/services/aromas/aroma.service"
import { IntendedImpactService } from "@/services/intended-impacts/intended-impact.service"
import { MainOptionService } from "@/services/main-option/main-option.service"
import { PlaceService } from "@/services/places/place.service"

interface DashboardStats {
  users: number
  containers: number
  aromas: number
  impacts: number
  categories: number
  places: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    containers: 0,
    aromas: 0,
    impacts: 0,
    categories: 0,
    places: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        
        // Fetch count data in parallel for better performance
        const [
          usersCount,
          containersCount,
          aromasCount,
          impactsCount,
          categoriesCount,
          placesCount
        ] = await Promise.all([
          UserService.getCount().catch(() => 0),
          ContainerService.getCount().catch(() => 0),
          AromaService.getCount().catch(() => 0),
          IntendedImpactService.getCount().catch(() => 0),
          MainOptionService.getCount().catch(() => 0),
          PlaceService.getCount().catch(() => 0)
        ])

        setStats({
          users: usersCount,
          containers: containersCount,
          aromas: aromasCount,
          impacts: impactsCount,
          categories: categoriesCount,
          places: placesCount
        })
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
        // Keep default values (0) if there's an error
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, []) // Empty dependency array - only run once on mount

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.users,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Contenedores",
      value: stats.containers,
      icon: Container,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Aromas",
      value: stats.aromas,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Impactos",
      value: stats.impacts,
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Categorías",
      value: stats.categories,
      icon: Layers,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Lugares",
      value: stats.places,
      icon: MapPin,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    }
  ]

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando estadísticas...</span>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard AromaLife</h1>
          <p className="text-muted-foreground">
            Resumen del sistema • {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Total registrados
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}