import { create } from "zustand";
import { AuthService } from "@/services/auth/auth.service";
import { AuthResponse } from "@/types/auth";
import { CartService } from "@/services/cart/cart.service";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearSession: () => void;
  setUserFromToken: (token: string) => void;
  initializeAuth: () => void;
  updateProfilePicture: (profilePicture: string) => void;
  initializeUserCart: (userId: string) => Promise<void>;
}

function decodeToken(token: string): AuthUser | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    let roles = payload.roles || [];
    if (!roles.length && typeof window !== "undefined") {
      try {
        const lastLogin = localStorage.getItem("lastLoginResponse");
        if (lastLogin) {
          const parsed = JSON.parse(lastLogin);
          roles = parsed.roles || [];
        }
      } catch (e) {
        console.error("Error parsing last login:", e);
      }
    }    return {
      id: payload.sub || payload.id || "",
      name: payload.name || "",
      email: payload.email || "",
      roles: roles.map((r: string) => r.toLowerCase()),
      profilePicture: payload.profilePicture || "",
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Inicialmente en estado de carga
  error: null,  initializeAuth: () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      
      const user = decodeToken(token);
      
      const storedResponse = localStorage.getItem("lastLoginResponse");
      
      
      let roles = user?.roles || [];
      let userId = user?.id || "";
      let profilePicture = user?.profilePicture || "";

      if (storedResponse) {
        const parsedResponse = JSON.parse(storedResponse);
        roles = parsedResponse.roles || roles;
        userId = parsedResponse.user_id || userId; // Usar el user_id de la respuesta
        profilePicture = parsedResponse.profilePicture || profilePicture; // Usar profilePicture de la respuesta
      }

      const finalUser = user ? { ...user, roles, id: userId, profilePicture } : null;

      set({
        user: finalUser,
        token,
        isAuthenticated: !!user,
        isLoading: false,
      });

      // Inicializar carrito si el usuario está autenticado
      if (finalUser?.id) {
        get().initializeUserCart(finalUser.id);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ isLoading: false });
    }
  },login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login({ email, password });
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("lastLoginResponse", JSON.stringify(response));

      const user = decodeToken(response.token);
      
      const finalUser = user
        ? {
            ...user,
            id: response.user_id, // Usar el user_id de la respuesta
            profilePicture: response.profilePicture || user.profilePicture, // Usar profilePicture de la respuesta
            roles: response.roles?.map((r) => r.toLowerCase()) || user.roles,
          }
        : null;

      set({
        user: finalUser,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      if (finalUser?.id) {
        console.log("🚀 Login exitoso, inicializando carrito para usuario:", finalUser.id);
        await get().initializeUserCart(finalUser.id);
      }
    } catch (error: any) {
      set({
        error: error.message || "Error de autenticación",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    console.log("🚪 Logging out - clearing all auth data");
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("lastLoginResponse");
      console.log("🧹 LocalStorage cleared");
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },
  
  // Función para limpiar completamente la sesión
  clearSession: () => {
    console.log("🧹 Clearing complete session");
    if (typeof window !== "undefined") {
      localStorage.clear(); // Limpia todo el localStorage
      sessionStorage.clear(); // También limpia sessionStorage
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
    });
  },

  setUserFromToken: (token) => {
    try {
      const user = decodeToken(token);
      set({
        user,
        token,
        isAuthenticated: !!user,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error setting user from token:", error);
      set({ isLoading: false });
    }
  },
  updateProfilePicture: (profilePicture: string) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          profilePicture,
        },
      });
    }
  },
  // Función para inicializar el carrito del usuario
  initializeUserCart: async (userId: string) => {
    try {
      const existingCart = await CartService.getByUser(userId);
      
      if (!existingCart) {
        const newCart = await CartService.create({
          userId: userId,
          checkedOut: false
        });
      }
    } catch (error) {
      console.error("❌ Error inicializando carrito:", error);
      
      // Log adicional para debugging
      if (error instanceof Error) {
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
      }
      
      // Si el error es un AxiosError, log más detalles
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error("❌ Axios error details:", {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          config: {
            method: axiosError.config?.method,
            url: axiosError.config?.url,
            data: axiosError.config?.data
          }
        });
      }
    }
  },
}));

// Removed automatic initialization to prevent side effects
// Auth will be initialized by AuthProvider component
