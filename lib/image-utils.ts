// Utilidades para el manejo de imágenes locales
export const imageUtils = {
  /**
   * Comprime una imagen a un tamaño máximo específico
   */
  compressImage: (
    file: File,
    maxWidth: number = 400,
    maxHeight: number = 400,
    quality: number = 0.7
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Configurar canvas
        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64 comprimido
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error("Error al cargar la imagen"));

      // Crear URL de objeto para la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Calcula el tamaño de una cadena base64 en bytes
   */
  getBase64Size: (base64String: string): number => {
    // Remover el prefijo data:image/...;base64,
    const base64Data = base64String.split(",")[1] || base64String;
    // Calcular tamaño en bytes (cada carácter base64 = 6 bits, padding considerado)
    return Math.ceil((base64Data.length * 3) / 4);
  },

  /**
   * Convierte bytes a una representación legible
   */
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  /**
   * Verifica si el localStorage puede almacenar más datos
   */
  canStoreInLocalStorage: (dataSize: number): boolean => {
    try {
      // Intentar calcular el espacio usado en localStorage
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }

      // Estimar límite típico de localStorage (5MB)
      const STORAGE_LIMIT = 5 * 1024 * 1024; // 5MB en bytes
      return used + dataSize < STORAGE_LIMIT * 0.8; // Usar solo el 80% del límite
    } catch {
      return false;
    }
  },
};
