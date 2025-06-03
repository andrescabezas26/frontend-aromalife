import axios, { AxiosError, AxiosRequestConfig } from "axios";

// Extender la interfaz de AxiosRequestConfig para incluir metadata
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: {
      entityName?: string;
    };
  }
}

// Interfaz para el error del servidor
interface ServerErrorResponse {
  message?: string;
  error?: string;
}

// Función global para traducir errores HTTP a mensajes en español
export const translateError = (
  error: AxiosError<ServerErrorResponse>,
  entityName: string = "recurso"
): string => {
  const status = error.response?.status;
  const serverMessage =
    error.response?.data?.message || error.response?.data?.error;

  switch (status) {
    case 400:
      if (serverMessage) {
        if (serverMessage.toLowerCase().includes("name")) {
          return "El nombre no es válido";
        }
        if (serverMessage.toLowerCase().includes("email")) {
          return "El formato del email no es válido";
        }
        if (serverMessage.toLowerCase().includes("price")) {
          return "El precio no es válido";
        }
        if (serverMessage.toLowerCase().includes("stock")) {
          return "El stock no es válido";
        }
        if (serverMessage.toLowerCase().includes("required")) {
          return "Faltan campos obligatorios por completar";
        }
        return serverMessage;
      }
      return "Los datos enviados no son válidos";    case 401:
      // Para errores de autenticación, usar el mensaje del servidor si está disponible
      if (serverMessage) {
        if (serverMessage.toLowerCase().includes("credentials") || 
            serverMessage.toLowerCase().includes("credenciales")) {
          return "Credenciales incorrectas. Verifica tu email y contraseña";
        }
        if (serverMessage.toLowerCase().includes("password") || 
            serverMessage.toLowerCase().includes("contraseña")) {
          return "Email o contraseña incorrectos";
        }
        if (serverMessage.toLowerCase().includes("invalid") ||
            serverMessage.toLowerCase().includes("inválido")) {
          return "Email o contraseña incorrectos";
        }
        // Si el mensaje del servidor es específico, úsalo
        return serverMessage;
      }
      return "No tienes autorización para realizar esta acción";

    case 403:
      return "No tienes permisos para realizar esta acción";

    case 404:
      return `El ${entityName} no existe`;

    case 409:
      if (serverMessage?.toLowerCase().includes("name")) {
        return `Ya existe un ${entityName} con este nombre`;
      }
      if (serverMessage?.toLowerCase().includes("email")) {
        return "Ya existe una cuenta con este email";
      }
      return "Ya existe un registro con estos datos";

    case 422:
      return "Los datos proporcionados no son válidos";

    case 500:
      return "Error interno del servidor. Intenta más tarde";

    default:
      // Errores de red
      if (error.code === "NETWORK_ERROR" || error.code === "ERR_NETWORK") {
        return "Error de conexión. Verifica tu conexión a internet";
      }
      if (error.code === "ECONNABORTED") {
        return "La conexión ha tardado demasiado. Intenta de nuevo";
      }
      if (error.code === "ENOTFOUND") {
        return "No se pudo conectar al servidor. Verifica tu conexión";
      }

      return serverMessage || "Ha ocurrido un error inesperado";
  }
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001", // Cambia la URL según tu backend
  timeout: 60000, // Tiempo máximo de espera en milisegundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Specialized client for QR-related requests
const qrBaseURL =
  process.env.NEXT_PUBLIC_BACKEND_URL_QR ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3001";

console.log("🎯 QR Client Base URL:", qrBaseURL);
console.log("🔧 Environment variables:", {
  NEXT_PUBLIC_BACKEND_URL_QR: process.env.NEXT_PUBLIC_BACKEND_URL_QR,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const qrApiClient = axios.create({
  baseURL: qrBaseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;

        // Decodificar y mostrar info del token para debug
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(base64));
          
        } catch (e) {
          console.error("❌ Error decodificando token:", e);
        }
      }
    }
    return config;
  },
  (error) => {
    console.error("Error en el interceptor de request:", error);
    return Promise.reject(error);
  }
);

// Interceptor para el cliente QR - mismo comportamiento
qrApiClient.interceptors.request.use(
  (config) => {
    console.log(
      "🚀 QR Request URL:",
      (config.baseURL || "") + (config.url || "")
    );
    console.log("🚀 QR Request Config:", {
      baseURL: config.baseURL,
      url: config.url,
    });

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      console.log(
        "🔍 QR Token encontrado en localStorage:",
        token ? token.substring(0, 50) + "..." : "NO TOKEN"
      );
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔗 QR Authorization header configurado");

        // Decodificar y mostrar info del token para debug
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(atob(base64));
          console.log("👤 Usuario en el token QR:", {
            id: payload.sub,
            email: payload.email,
            roles: payload.roles,
          });
        } catch (e) {
          console.error("❌ Error decodificando token QR:", e);
        }
      }
    }
    return config;
  },
  (error) => {
    console.error("Error en el interceptor de request QR:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API Error:", error.response || error.message);
    if (error.response) {
      // Si el error tiene un mensaje del servidor, lo mostramos
    }

    // Si el error tiene una configuración personalizada con entityName, usar esa
    const entityName = error.config?.metadata?.entityName || "recurso";

    if (error instanceof AxiosError) {
      const translatedMessage = translateError(error, entityName);
      // Modificar el error para incluir el mensaje traducido
      const customError = new Error(translatedMessage);
      customError.name = "TranslatedAxiosError";
      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales en el cliente QR
qrApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("QR API Error:", error.response || error.message);
    if (error.response) {
      console.log("QR Error status:", error.response.status);
      console.log("QR Error data:", error.response.data);
      console.log("QR Error headers:", error.response.headers);
    }

    // Si el error tiene una configuración personalizada con entityName, usar esa
    const entityName = error.config?.metadata?.entityName || "recurso";

    if (error instanceof AxiosError) {
      const translatedMessage = translateError(error, entityName);
      // Modificar el error para incluir el mensaje traducido
      const customError = new Error(translatedMessage);
      customError.name = "TranslatedAxiosError";
      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);

// Función helper para realizar peticiones con nombre de entidad
export const createRequestWithEntity = (entityName: string) => {
  return {
    get: (url: string, config = {}) =>
      apiClient.get(url, {
        ...config,
        metadata: { entityName },
      }),
    post: (url: string, data?: any, config = {}) =>
      apiClient.post(url, data, {
        ...config,
        metadata: { entityName },
      }),
    put: (url: string, data?: any, config = {}) =>
      apiClient.put(url, data, {
        ...config,
        metadata: { entityName },
      }),
    delete: (url: string, config = {}) =>
      apiClient.delete(url, {
        ...config,
        metadata: { entityName },
      }),
    patch: (url: string, data?: any, config = {}) =>
      apiClient.patch(url, data, {
        ...config,
        metadata: { entityName },
      }),
  };
};

// Función helper para realizar peticiones QR con nombre de entidad
export const createQRRequestWithEntity = (entityName: string) => {
  return {
    get: (url: string, config = {}) =>
      qrApiClient.get(url, {
        ...config,
        metadata: { entityName },
      }),
    post: (url: string, data?: any, config = {}) =>
      qrApiClient.post(url, data, {
        ...config,
        metadata: { entityName },
      }),
    put: (url: string, data?: any, config = {}) =>
      qrApiClient.put(url, data, {
        ...config,
        metadata: { entityName },
      }),
    delete: (url: string, config = {}) =>
      qrApiClient.delete(url, {
        ...config,
        metadata: { entityName },
      }),
    patch: (url: string, data?: any, config = {}) =>
      qrApiClient.patch(url, data, {
        ...config,
        metadata: { entityName },
      }),
  };
};

export { qrApiClient };
export default apiClient;
