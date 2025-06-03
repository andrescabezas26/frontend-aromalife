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
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye } from "lucide-react"
import { Label } from "@/services/labels/labels.service"
import Image from "next/image"

interface LabelsTableProps {
  labels: Label[]
  onDelete: (label: Label) => Promise<void>
}

export function LabelsTable({ labels, onDelete }: LabelsTableProps) {
  const router = useRouter()
  const [labelToDelete, setLabelToDelete] = useState<Label | null>(null)

  const handleDelete = async () => {
    if (!labelToDelete) return

    try {
      await onDelete(labelToDelete)
    } finally {
      setLabelToDelete(null)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "template":
        return "bg-blue-100 text-blue-800"
      case "ai-generated":
        return "bg-purple-100 text-purple-800"
      case "custom":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "template":
        return "Plantilla"
      case "ai-generated":
        return "IA"
      case "custom":
        return "Personalizada"
      default:
        return type
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
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay etiquetas disponibles
                </TableCell>
              </TableRow>
            ) : (
              labels.map((label) => (
                <TableRow key={label.id}>
                  <TableCell>
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden border">
                      <Image
                        src={label.imageUrl}
                        alt={label.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{label.name}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">
                      {label.description || "Sin descripción"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(label.type)}>
                      {getTypeLabel(label.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {label.createdAt 
                      ? new Date(label.createdAt).toLocaleDateString('es-CO')
                      : "Fecha no disponible"
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/labels/${label.id}`)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/labels/edit/${label.id}`)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLabelToDelete(label)}
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

      <AlertDialog open={!!labelToDelete} onOpenChange={() => setLabelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la etiqueta
              {labelToDelete && ` "${labelToDelete.name}"`}.
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

