"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface RoleGuardProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    requireAuth?: boolean;
    redirectTo?: string;
    hideContent?: boolean; // Nueva prop para controlar si ocultar contenido o redirigir
}

export function RoleGuard({ children, requiredRoles, requireAuth = true, redirectTo = "/login", hideContent = true }: RoleGuardProps) {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    // Sync auth state when storage changes (removed reload to prevent infinite loops)    // Verificación de roles simplificada para evitar re-renders constantes
    useEffect(() => {
        if (isLoading) return;

        // Solo redirigir si no está autenticado y se requiere autenticación
        if (requireAuth && !isAuthenticated) {
            router.replace(redirectTo);
            return;
        }

        // Verificar roles solo si es necesario y evitar redirecciones innecesarias
        if (requiredRoles?.length && isAuthenticated && user) {
            const hasRole = requiredRoles.some(role => {
                    const roleToCheck = role.toLowerCase();
                    const userHasRole = user?.roles?.includes(roleToCheck);
                    return userHasRole;
                });

                if (!hasRole) {
                    console.log("🚫 User doesn't have required role, hideContent:", hideContent);
                    // Si hideContent es false, redirigir a 404 para páginas protegidas
                    if (!hideContent) {
                        console.log("🚫 Redirecting to /not-found");
                        router.replace("/not-found");
                        return;
                    }
                    // Si hideContent es true, usar el redirectTo especificado (para sidebar)
                    if (redirectTo !== "/login") {
                        console.log("🚫 Redirecting to:", redirectTo);
                        router.replace(redirectTo);
                    }
                }
            }
        }, [isAuthenticated, isLoading, user, requiredRoles, requireAuth, redirectTo, router, hideContent]);

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
    }    // Si se requiere autenticación y no está autenticado, no mostrar nada
    if (requireAuth && !isAuthenticated) {
        return null;
    }

    // Verificar roles antes del render para evitar flash de contenido
    if (requiredRoles?.length && isAuthenticated) {
        const hasRole = requiredRoles.some(role => {
            const roleToCheck = role.toLowerCase();
            const userHasRole = user?.roles?.includes(roleToCheck);
            return userHasRole;
        });

        if (!hasRole) {
            // Si hideContent es false (para páginas), mostrar loading mientras redirecciona
            if (!hideContent) {
                return <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>;
            }
            // Si hideContent es true (para sidebar), no mostrar contenido
            return null;
        }
    }

    return <>{children}</>;
}

