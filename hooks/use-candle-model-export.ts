import { useCallback } from "react";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

interface ExportCandleModelParams {
  waxColor?: string;
  labelImageUrl?: string;
  messageText?: string;
  showQR?: boolean;
  qrUrl?: string;
}

export const useCandleModelExport = () => {
  // Helper function to optimize texture size
  const optimizeTexture = (
    texture: THREE.Texture,
    maxSize: number = 512
  ): THREE.Texture => {
    if (!texture.image) return texture;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return texture;

    // Calculate optimal size while maintaining aspect ratio
    const { width, height } = texture.image;
    const scale = Math.min(maxSize / width, maxSize / height);

    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);

    // Draw optimized image
    ctx.drawImage(texture.image, 0, 0, canvas.width, canvas.height);

    // Create new texture from optimized canvas
    const optimizedTexture = new THREE.CanvasTexture(canvas);
    optimizedTexture.format = THREE.RGBAFormat;
    optimizedTexture.generateMipmaps = false;
    optimizedTexture.minFilter = THREE.LinearFilter;
    optimizedTexture.magFilter = THREE.LinearFilter;

    return optimizedTexture;
  };

  // Helper function to simplify geometry
  const simplifyGeometry = (
    geometry: THREE.BufferGeometry
  ): THREE.BufferGeometry => {
    // Remove unnecessary attributes to reduce file size
    const simplifiedGeometry = geometry.clone();

    // Keep only essential attributes
    const attributesToKeep = ["position", "normal", "uv"];
    const attributeNames = Object.keys(simplifiedGeometry.attributes);

    attributeNames.forEach((name) => {
      if (!attributesToKeep.includes(name)) {
        simplifiedGeometry.deleteAttribute(name);
      }
    });

    return simplifiedGeometry;
  };

  const exportCandleModel = useCallback(
    async (params: ExportCandleModelParams): Promise<File> => {
      try {
        console.log("Starting candle model export with params:", params);

        // Crear un loader para cargar el modelo base
        const loader = new GLTFLoader();

        // Cargar el modelo base desde Cloudinary
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            "https://res.cloudinary.com/dti5zalsf/image/upload/v1748546484/free_frosted_glass_candle_low_poly_blank_label_ssrsrx.glb",
            resolve,
            undefined,
            reject
          );
        });

        console.log("Base model loaded successfully");

        // Clonar la escena para no modificar el original
        const scene = new THREE.Scene();
        const clonedModel = gltf.scene.clone();

        // Optimize the base model to reduce file size
        clonedModel.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            // Simplify geometry
            if (child.geometry) {
              child.geometry = simplifyGeometry(child.geometry);
            }

            // Optimize materials
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    // Disable unnecessary features to reduce complexity
                    mat.roughness = 0.5;
                    mat.metalness = 0.1;
                    if (mat.map) {
                      mat.map = optimizeTexture(mat.map, 256);
                    }
                  }
                });
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.roughness = 0.5;
                child.material.metalness = 0.1;
                if (child.material.map) {
                  child.material.map = optimizeTexture(child.material.map, 256);
                }
              }
            }

            // Apply wax color optimization
            if (
              child.name.toLowerCase().includes("wax") ||
              child.name.toLowerCase().includes("cera") ||
              child.material?.name?.toLowerCase().includes("wax")
            ) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material = child.material.clone();
                child.material.color.setHex(
                  new THREE.Color(params.waxColor || "#F5F5F5").getHex()
                );
                // Remove unnecessary textures to reduce size
                child.material.map = null;
                child.material.normalMap = null;
                child.material.roughnessMap = null;
                child.material.metalnessMap = null;
              }
            }
          }
        });

        // Agregar el modelo a la escena
        scene.add(clonedModel);

        // Si hay una imagen de etiqueta, crearla como textura optimizada
        if (params.labelImageUrl) {
          try {
            console.log("Adding optimized label image:", params.labelImageUrl);

            // Cargar la textura de la etiqueta
            const textureLoader = new THREE.TextureLoader();
            const originalTexture = await new Promise<THREE.Texture>(
              (resolve, reject) => {
                textureLoader.load(
                  params.labelImageUrl!,
                  resolve,
                  undefined,
                  reject
                );
              }
            );

            // Optimize the label texture for smaller file size
            const optimizedLabelTexture = optimizeTexture(originalTexture, 512);
            optimizedLabelTexture.flipY = false; // Ensure proper orientation in GLB

            // Create label geometry with optimized settings
            const labelGeometry = new THREE.PlaneGeometry(0.8, 0.6, 1, 1); // Reduced segments
            const labelMaterial = new THREE.MeshStandardMaterial({
              map: optimizedLabelTexture,
              transparent: true,
              opacity: 0.95,
              alphaTest: 0.1, // Improve rendering performance
              side: THREE.DoubleSide, // Ensure visibility from both sides
              roughness: 0.1,
              metalness: 0.0,
            });

            const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
            labelMesh.position.set(0, 0.6, 0.52);
            labelMesh.scale.set(4.5, 4.5, 4.5);
            labelMesh.name = "personalized_label"; // Add name for identification

            // Add the label directly to the cloned model instead of scene
            // This ensures it's properly embedded in the GLB export
            clonedModel.add(labelMesh);
            console.log("Optimized label image embedded in model");
          } catch (error) {
            console.warn("Failed to load label image:", error);
          }
        }

        // Si hay mensaje de texto, agregarlo como geometría optimizada
        if (params.messageText) {
          console.log("Adding optimized message text:", params.messageText);

          // Crear un plano de fondo optimizado para el mensaje
          const messageBackgroundGeometry = new THREE.PlaneGeometry(
            1,
            0.4,
            1,
            1
          ); // Reduced segments
          const messageBackgroundMaterial = new THREE.MeshStandardMaterial({
            color: "white",
            transparent: true,
            opacity: 0.9,
            alphaTest: 0.1,
            roughness: 0.1,
            metalness: 0.0,
          });
          const messageBackground = new THREE.Mesh(
            messageBackgroundGeometry,
            messageBackgroundMaterial
          );
          messageBackground.position.set(0, 0.2, 0.52);
          messageBackground.scale.set(4.5, 4.5, 4.5);
          messageBackground.name = "message_background";

          // Add to the model instead of scene for proper embedding
          clonedModel.add(messageBackground);
          console.log("Optimized message background embedded in model");
        }

        // Agregar luces básicas a la escena (optimizado)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        // Escalar todo el modelo
        clonedModel.scale.set(4.5, 4.5, 4.5);

        console.log("Scene prepared with optimizations, starting export...");

        // Exportar la escena como GLB con configuraciones optimizadas
        const exporter = new GLTFExporter();

        const gltfData = await new Promise<ArrayBuffer>((resolve, reject) => {
          exporter.parse(
            scene,
            (result) => {
              if (result instanceof ArrayBuffer) {
                resolve(result);
              } else {
                reject(
                  new Error("Expected ArrayBuffer but got different format")
                );
              }
            },
            (error) => reject(error),
            {
              binary: true, // Export as GLB (binary) for smaller size
              embedImages: true, // Embed images to ensure they're included
              maxTextureSize: 512, // Limit texture size for smaller files
              includeCustomExtensions: false, // Remove unnecessary extensions
              truncateDrawRange: true, // Optimize geometry
              trs: false, // Use matrices instead of TRS for smaller size
              onlyVisible: true, // Only export visible objects
              animations: [], // Remove animations to reduce size
            }
          );
        });

        console.log(
          "Model exported successfully, size:",
          gltfData.byteLength,
          "bytes"
        );
        console.log(
          "Model size in MB:",
          (gltfData.byteLength / (1024 * 1024)).toFixed(2)
        );

        // Crear un File objeto desde el ArrayBuffer
        const blob = new Blob([gltfData], { type: "model/gltf-binary" });
        const file = new File([blob], "personalized-candle.glb", {
          type: "model/gltf-binary",
        });

        console.log(
          "File created:",
          file.name,
          "Size:",
          (file.size / (1024 * 1024)).toFixed(2),
          "MB"
        );

        // Verify file size is under the limit
        const maxSizeBytes = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSizeBytes) {
          console.warn(
            `Warning: File size (${(file.size / (1024 * 1024)).toFixed(
              2
            )}MB) exceeds the 10MB limit`
          );
        } else {
          console.log("✅ File size is within the 10MB limit");
        }

        return file;
      } catch (error) {
        console.error("Error exporting candle model:", error);
        throw new Error(
          `Failed to export candle model: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    []
  );

  return { exportCandleModel };
};
