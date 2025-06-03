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
import { Aroma } from "@/types/aroma"

interface AromasTableProps {
  aromas: Aroma[]
  onDelete: (aroma: Aroma) => Promise<void>
}

export function AromasTable({ aromas, onDelete }: AromasTableProps) {
  const router = useRouter()
  const [aromaToDelete, setAromaToDelete] = useState<Aroma | null>(null)

  const handleDelete = async () => {
    if (!aromaToDelete) return

    try {
      await onDelete(aromaToDelete)
    } finally {
      setAromaToDelete(null)
    }
  }

  return (
    <>
      <div className="border rounded-lg">        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Pirámide Olfativa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aromas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay aromas disponibles
                </TableCell>
              </TableRow>
            ) : (
              aromas.map((aroma) => (
                <TableRow key={aroma.id}>
                  <TableCell className="font-medium">{aroma.name}</TableCell>
                  <TableCell>{aroma.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300" 
                        style={{ backgroundColor: aroma.color }}
                      />
                      <span className="text-sm text-muted-foreground">{aroma.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div><strong>Salida:</strong> {aroma.olfativePyramid.salida}</div>
                      <div><strong>Corazón:</strong> {aroma.olfativePyramid.corazon}</div>
                      <div><strong>Fondo:</strong> {aroma.olfativePyramid.fondo}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/aromas/${aroma.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/aromas/${aroma.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAromaToDelete(aroma)}
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

      <AlertDialog open={!!aromaToDelete} onOpenChange={() => setAromaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el aroma
              {aromaToDelete && ` "${aromaToDelete.name}"`}.
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