import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Eye } from "lucide-react"
import { Container } from "@/types/container"

interface ContainersTableProps {
  containers: Container[]
  onDelete: (container: Container) => Promise<void>
}

export function ContainersTable({ containers, onDelete }: ContainersTableProps) {
  const router = useRouter()
  const [containerToDelete, setContainerToDelete] = useState<Container | null>(null)

  const handleDelete = async () => {
    if (!containerToDelete) return

    try {
      await onDelete(containerToDelete)
    } finally {
      setContainerToDelete(null)
    }
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Precio Base</TableHead>
              <TableHead>Dimensiones</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{containers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay contenedores disponibles
                </TableCell>
              </TableRow>
            ) : (
              containers.map((container) => (<TableRow key={container.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                      {container.imageUrl ? (
                        <img
                          src={container.imageUrl}
                          alt={container.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">Sin imagen</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{container.name}</TableCell>
                  <TableCell>{container.description}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(container.basePrice)}
                  </TableCell>
                  <TableCell>
                    {container.dimensions ? 
                      `${container.dimensions.height}×${container.dimensions.width} cm` : 
                      "No especificado"
                    }
                  </TableCell><TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/containers/${container.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/containers/${container.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setContainerToDelete(container)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!containerToDelete} onOpenChange={() => setContainerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el contenedor
              {containerToDelete && ` "${containerToDelete.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 