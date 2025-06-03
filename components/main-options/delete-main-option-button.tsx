import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { MainOptionService } from "@/services/main-option/main-option.service"
import { MainOption } from "@/types/main-option"

interface DeleteMainOptionButtonProps {
  mainOption: MainOption
  onDelete: () => void
}

export function DeleteMainOptionButton({ mainOption, onDelete }: DeleteMainOptionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      if (!mainOption.id) {
        throw new Error("La opción principal no tiene un ID válido")
      }
      await MainOptionService.delete(mainOption.id)
      toast({
        title: "Opción principal eliminada",
        description: "La opción principal ha sido eliminada correctamente",
      })
      onDelete()
    } catch (error: any) {
      console.error("Error deleting main option:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la opción principal, asegúrate de que no esté siendo utilizada por ningún impacto. En tal caso, elimina primero los impactos relacionados o asócialos a otra categororía.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la opción principal
            {mainOption && ` "${mainOption.name}"`}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
