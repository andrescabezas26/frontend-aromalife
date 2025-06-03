import { Gift } from "@/types/gift"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
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
import { useState } from "react"
import { GiftService } from "@/services/gifts/gift.service"
import { useToast } from "@/components/ui/use-toast"

interface GiftsTableProps {
  gifts: Gift[]
  onGiftDeleted: () => void
}

export function GiftsTable({ gifts, onGiftDeleted }: GiftsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [giftToDelete, setGiftToDelete] = useState<Gift | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!giftToDelete) return

    try {
      setIsDeleting(true)
      await GiftService.delete(giftToDelete.id)
      toast({
        title: "Regalo eliminado",
        description: "El regalo ha sido eliminado correctamente",
      })
      onGiftDeleted()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el regalo",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setGiftToDelete(null)
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
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{gifts.length === 0 ? (<TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay regalos disponibles
                </TableCell>
              </TableRow>
            ) : (
              gifts.map((gift) => (<TableRow key={gift.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                      {gift.imageUrl ? (
                        <img
                          src={gift.imageUrl}
                          alt={gift.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">Sin imagen</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{gift.name}</TableCell>
                  <TableCell>{gift.description}</TableCell>
                  <TableCell>${gift.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/gifts/${gift.id}`)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/gifts/${gift.id}/edit`)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setGiftToDelete(gift)}
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

      <AlertDialog open={!!giftToDelete} onOpenChange={() => setGiftToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el regalo
              {giftToDelete && ` "${giftToDelete.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 