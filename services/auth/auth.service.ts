import { createRequestWithEntity, translateError as globalTranslateError } from "@/lib/axios";
import { AxiosError } from "axios";
import { LoginRequest, RegisterRequest, RegisterClientRequest, AuthResponse } from "@/types/auth";

// Crear cliente HTTP específico para autenticación
const authApi = createRequestWithEntity("usuario");

// Interfaz para el error del servidor
interface ServerErrorResponse {
  message?: string;
  error?: string;
}

// Función especializada para errores de autenticación (mantiene compatibilidad)
export const translateError = (
  error: AxiosError<ServerErrorResponse>
): string => {
  const status = error.response?.status;
  console.log("Error status:", status);
  const serverMessage =
    error.response?.data?.message || error.response?.data?.error;

  // Casos específicos de autenticación
  if (status === 401) {
    console.log(serverMessage)
    if (serverMessage?.toLowerCase().includes("credentials")) {
      return "Credenciales incorrectas. Verifica tu email y contraseña";
    }
    return "Email o contraseña incorrectos";
  }

  if (status === 400 && serverMessage) {
    // Casos específicos de registro
    if (serverMessage.toLowerCase().includes("password")) {
      return "La contraseña no cumple con los requisitos";
    }
    if (serverMessage.toLowerCase().includes("lastname")) {
      return "El apellido no es válido";
    }
    if (serverMessage.toLowerCase().includes("phone")) {
      return "El número de teléfono no es válido";
    }
    if (serverMessage.toLowerCase().includes("phonecountrycode")) {
      return "El código de país no es válido";
    }
    if (serverMessage.toLowerCase().includes("city")) {
      return "La ciudad no es válida";
    }
    if (serverMessage.toLowerCase().includes("country")) {
      return "El país no es válido";
    }
    if (serverMessage.toLowerCase().includes("address")) {
      return "La dirección no es válida";
    }
  }

  // Casos adicionales específicos de auth
  if (status === 429) {
    return "Demasiados intentos. Intenta de nuevo en unos minutos";
  }
  if (status === 502) {
    return "Problema de conectividad del servidor. Intenta más tarde";
  }
  if (status === 503) {
    return "Servicio no disponible temporalmente";
  }
  if (status === 504) {
    return "El servidor tardó demasiado en responder. Intenta de nuevo";
  }
  // Usar la función global para el resto de casos
  return globalTranslateError(error, "usuario");
};

export const AuthService = {  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post("/auth/login", data);
      console.log("Login response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      
      // Verificar si es un error traducido del interceptor
      if (error && typeof error === 'object' && 'name' in error && error.name === 'TranslatedAxiosError') {
        console.log("Translated error from interceptor:", (error as Error).message);
        throw error; // Propagar el error traducido tal como viene
      }
      
      // Si es un AxiosError original (por si acaso), traducirlo
      if (error instanceof AxiosError) {
        const translatedError = translateError(error);
        console.log("Translated error locally:", translatedError);
        throw new Error(translatedError);
      }
      
      // Si el error ya tiene un mensaje específico, usarlo
      if (error && typeof error === 'object' && 'message' in error && (error as Error).message) {
        throw error;
      }
      
      throw new Error("Error de conexión inesperado");
    }
  },
  async registerClient(data: RegisterClientRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/register', data);
      return response.data;
    } catch (error) {
      // Verificar si es un error traducido del interceptor
      if (error && typeof error === 'object' && 'name' in error && error.name === 'TranslatedAxiosError') {
        throw error;
      }
      
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.post("/auth/register-client", data);
      return response.data;
    } catch (error) {
      // Verificar si es un error traducido del interceptor
      if (error && typeof error === 'object' && 'name' in error && error.name === 'TranslatedAxiosError') {
        throw error;
      }
      
      if (error instanceof AxiosError) {
        console.log("entre axios");
        throw new Error(translateError(error));
      }
      console.log("entre aqui");
      throw new Error("Error de conexión inesperado");
    }
  },

  async registerWithFile(
    data: RegisterRequest,
    file?: File
  ): Promise<AuthResponse> {
    try {
      const formData = new FormData();

      // Agregar todos los campos del formulario al FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Agregar el archivo si existe
      if (file) {
        formData.append("profilePicture", file);
      }

      const response = await authApi.post(
        "/auth/register-client-with-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error de conexión inesperado");
    }
  },
  async logout(): Promise<void> {
    try {
      await authApi.post("/auth/logout");
    } catch (error) {
      // Verificar si es un error traducido del interceptor
      if (error && typeof error === 'object' && 'name' in error && error.name === 'TranslatedAxiosError') {
        throw error;
      }
      
      if (error instanceof AxiosError) {
        throw new Error(translateError(error));
      }
      throw new Error("Error al cerrar sesión");
    }
  },
};
