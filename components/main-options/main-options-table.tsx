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
import { MainOption } from "@/types/main-option"

interface MainOptionsTableProps {
  mainOptions: MainOption[]
  onDelete: (mainOption: MainOption) => Promise<void>
}

export function MainOptionsTable({ mainOptions, onDelete }: MainOptionsTableProps) {
  const router = useRouter()
  const [mainOptionToDelete, setMainOptionToDelete] = useState<MainOption | null>(null)

  const handleDelete = async () => {
    if (!mainOptionToDelete) return

    try {
      await onDelete(mainOptionToDelete)
    } finally {
      setMainOptionToDelete(null)
    }
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Emoji</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mainOptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay categorías disponibles
                </TableCell>
              </TableRow>
            ) : (
              mainOptions.map((mainOption) => (
                <TableRow key={mainOption.id}>
                  <TableCell className="font-medium">{mainOption.name}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">
                      {mainOption.description || "Sin descripción"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{mainOption.emoji}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {mainOption.createdAt 
                      ? new Date(mainOption.createdAt).toLocaleDateString('es-CO')
                      : "Fecha no disponible"
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/main-options/${mainOption.id}`)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/main-options/${mainOption.id}/edit`)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMainOptionToDelete(mainOption)}
                        title="Eliminar"
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

      <AlertDialog open={!!mainOptionToDelete} onOpenChange={() => setMainOptionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la opción principal
              {mainOptionToDelete && ` "${mainOptionToDelete.name}"`}.
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
