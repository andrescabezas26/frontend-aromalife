"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserProfileStore } from "@/stores/users-store";
import { useToast } from "@/hooks/use-toast";
import UserProfile from "@/components/users/user-profile";
import { MainLayout } from "@/components/layouts/main-layout";

export default function ProfilePage() {
  const params = useParams();
  const { user, loading, error, fetchUser, clearUser } = useUserProfileStore();
  const { toast } = useToast();
  const userId = params?.id as string;

  useEffect(() => {
    if (userId) {
      const loadUser = async () => {
        try {
          await fetchUser(userId);
        } catch (error) {
          if (error instanceof Error) {
            toast({
              title: "Error al cargar el perfil",
              description: error.message,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "Ha ocurrido un error inesperado al cargar el perfil",
              variant: "destructive",
            });
          }
        }
      };

      loadUser();
    }

    // Cleanup al desmontar el componente
    return () => {
      clearUser();
    };
  }, [userId, fetchUser, clearUser, toast]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando perfil...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Usuario no encontrado</h1>
            <p className="text-gray-600 mt-2">
              {error || "El perfil que buscas no existe o ha sido eliminado."}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <UserProfile user={user} />
      </div>
    </MainLayout>
  );
}