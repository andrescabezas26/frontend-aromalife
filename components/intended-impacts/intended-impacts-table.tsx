import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { IntendedImpactTableView } from "@/types/intended-impact"

interface IntendedImpactsTableProps {
  intendedImpacts: IntendedImpactTableView[]
  onDelete: (intendedImpact: IntendedImpactTableView) => Promise<void>
}

export function IntendedImpactsTable({ intendedImpacts, onDelete }: IntendedImpactsTableProps) {
  const router = useRouter()
  const [intendedImpactToDelete, setIntendedImpactToDelete] = useState<IntendedImpactTableView | null>(null)

  const handleDelete = async () => {
    if (!intendedImpactToDelete) return

    try {
      await onDelete(intendedImpactToDelete)
    } finally {
      setIntendedImpactToDelete(null)
    }
  }

  console.log("Intended impacts:", intendedImpacts)

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icono</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Opción Principal</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intendedImpacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay impactos disponibles
                </TableCell>
              </TableRow>
            ) : (
              intendedImpacts.map((intendedImpact) => (
                <TableRow key={intendedImpact.id}>
                  <TableCell>
                    <div className="text-2xl">{intendedImpact.icon}</div>
                  </TableCell>
                  <TableCell className="font-medium">{intendedImpact.name}</TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={intendedImpact.description}>
                      {intendedImpact.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    {intendedImpact.mainOptionName ? (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <span>{intendedImpact.mainOptionEmoji || '📌'}</span>
                        <span>{intendedImpact.mainOptionName}</span>
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin asociar</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/intended-impacts/${intendedImpact.id}`)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/management/intended-impacts/${intendedImpact.id}/edit`)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIntendedImpactToDelete(intendedImpact)}
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

      <AlertDialog open={!!intendedImpactToDelete} onOpenChange={() => setIntendedImpactToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el impacto 
              {intendedImpactToDelete && ` "${intendedImpactToDelete.name}"`}.
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