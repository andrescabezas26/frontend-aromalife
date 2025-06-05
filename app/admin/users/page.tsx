"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useAdminUsersStore } from "@/stores/users-store";
import { RoleGuard } from "@/components/auth/role-guard";
import { useToast } from "@/hooks/use-toast";
import { UsersTable } from "@/components/users/users-table";
import { User } from "@/types/user";

export default function AdminUsersPage() {
  const router = useRouter();
  const { users, loading, fetchUsers, deleteUser } = useAdminUsersStore();
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        await fetchUsers();
      } catch (error) {
        if (error instanceof Error) {
          toast({
            title: "Error al cargar usuarios",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Ha ocurrido un error inesperado al cargar los usuarios",
            variant: "destructive",
          });
        }
      }
    };

    loadUsers();
  }, [fetchUsers, toast]);

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user.id);
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando usuarios...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <RoleGuard requiredRoles={["admin"]} hideContent={false}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 data-testid="users-table" className="text-3xl font-bold tracking-tight">Usuarios</h1>
              <p className="text-muted-foreground">
                Gestiona los usuarios del sistema
              </p>
            </div>
            <Button onClick={() => router.push("/admin/users/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>

          {users.length === 0 ? (
            <div className="border rounded p-4 text-center text-muted-foreground">
              <span>No hay usuarios para mostrar.</span>
            </div>
          ) : (
            <UsersTable users={users} onDelete={handleDelete} />
          )}
        </div>
      </AdminLayout>
    </RoleGuard>
  );
}
