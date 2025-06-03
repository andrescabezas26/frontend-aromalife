"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Text, Html } from "@react-three/drei";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

interface CandleViewerProps {
  waxColor?: string;
  labelImageUrl?: string;
  labelText?: string;
  messageText?: string;
  showQR?: boolean;
  qrUrl?: string;
  width?: number;
  height?: number;
  autoRotate?: boolean;
  className?: string;
  customModelUrl?: string;
}

// Error Boundary para el Canvas 3D
class Canvas3DErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    onError?: (error: Error) => void;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error en renderizado 3D:", error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center p-4">
            <div className="text-red-500 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.888-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Error en renderizado 3D
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              No se pudo cargar el modelo 3D
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function LabelWithImage({
  imageUrl,
  position,
  rotation, // <-- Añadida prop de rotación
}: {
  imageUrl: string;
  position: [number, number, number];
  rotation: [number, number, number]; // <-- Tipo para la prop de rotación
}) {
  const [error, setError] = useState<string | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null);
      setError(null); // Limpiar error si no hay URL
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace; // Ensure correct color space
        setTexture(loadedTexture);
        setError(null);
      },
      undefined,
      (err) => {
        console.error(`Error cargando textura: ${imageUrl}`, err); // Log imageUrl on error
        setError("Error al cargar imagen");
      }
    );
  }, [imageUrl]);

  if (error && imageUrl) {
    // Mostrar error solo si había una imageUrl
    return (
      <group position={position} rotation={rotation}>
        {" "}
        {/* Usar rotación también para el placeholder de error */}
        <mesh>
          <planeGeometry args={[0.22, 0.16]} /> {/* Mantener el mismo tamaño */}
          <meshStandardMaterial
            color="#f3f4f6"
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.03}
          color="red"
          anchorX="center"
          anchorY="middle"
        >
          Error imagen
        </Text>
      </group>
    );
  }

  if (!texture && imageUrl) {
    // Mostrar cargando solo si había una imageUrl
    return (
      <group position={position} rotation={rotation}>
        {" "}
        {/* Usar rotación también para el placeholder de carga */}
        <mesh>
          <planeGeometry args={[0.22, 0.16]} /> {/* Mantener el mismo tamaño */}
          <meshStandardMaterial
            color="#e5e7eb"
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.03}
          color="#6b7280"
          anchorX="center"
          anchorY="middle"
        >
          Cargando...
        </Text>
      </group>
    );
  }

  if (!texture) return null; // No renderizar nada si no hay textura (y no hay error/carga)

  return (
    <group position={position} rotation={rotation}>
      {" "}
      {/* <-- Usar la prop de rotación */}
      <mesh>
        <planeGeometry args={[0.22, 0.16]} />{" "}
        {/* Etiqueta más pequeña para quedar más integrada */}
        <meshStandardMaterial
          map={texture}
          transparent={true}
          side={THREE.DoubleSide}
          color="white"
          polygonOffset // <-- Añadido
          polygonOffsetFactor={-2} // <-- Más agresivo para evitar z-fighting
        />
      </mesh>
    </group>
  );
}

function CandleModel({
  waxColor = "#F5F5F5",
  labelImageUrl,
  labelText,
  messageText,
  showQR = false,
  qrUrl = "https://via.placeholder.com/100x100/000000/ffffff?text=QR",
  customModelUrl,
}: Omit<CandleViewerProps, "width" | "height" | "autoRotate" | "className">) {
  const meshRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);

  const modelUrl =
    customModelUrl ||
    "https://res.cloudinary.com/dti5zalsf/image/upload/v1748546484/free_frosted_glass_candle_low_poly_blank_label_ssrsrx.glb";

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        try {
          const clonedScene = gltf.scene.clone();

          // Centrar el modelo calculando su bounding box
          const box = new THREE.Box3().setFromObject(clonedScene);
          const center = box.getCenter(new THREE.Vector3());
          clonedScene.position.sub(center); // Mover el modelo para centrarlo

          setModel(clonedScene);
          setModelError(null);
          clonedScene.traverse((child: THREE.Object3D) => {
            try {
              if (child instanceof THREE.Mesh) {
                if (
                  child.name.toLowerCase().includes("wax") ||
                  child.name.toLowerCase().includes("cera") ||
                  child.material?.name?.toLowerCase().includes("wax")
                ) {
                  if (child.material instanceof THREE.MeshStandardMaterial) {
                    child.material = child.material.clone();
                    child.material.color.setHex(
                      new THREE.Color(waxColor).getHex()
                    );
                  }
                }
              }
            } catch (error) {
              console.warn("Error procesando material del modelo:", error);
            }
          });
        } catch (error) {
          console.error("Error procesando modelo 3D:", error);
          setModelError("Error procesando modelo");
        }
      },
      undefined,
      (error) => {
        console.error("Error cargando modelo 3D:", error);
        setModelError("Error cargando modelo 3D");
      }
    );
  }, [modelUrl, waxColor]);

  useFrame((state) => {
    try {
      if (meshRef.current) {
        meshRef.current.rotation.y =
          Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      }
    } catch (error) {
      console.warn("Error en animación:", error);
    }
  });

  // --- INICIO DE CÁLCULOS DE ROTACIÓN ---
  const labelBaseX = 0.21; // Prácticamente pegado a la vela
  const labelBaseZ = 0.01; // Casi tocando la superficie de la vela
  const qrBaseX = -0.21; // Lado opuesto para el QR, igual de pegado
  const qrBaseZ = 0.01; // Misma distancia de la vela que la etiqueta

  let labelImagePos: [number, number, number] = [0, 0, 0];
  let labelImageRotation: [number, number, number] = [0, 0, 0];
  if (labelImageUrl) {
    labelImagePos = [labelBaseX, 0.12, labelBaseZ];
    const labelImageAngleY = Math.atan2(labelImagePos[0], labelImagePos[2]);
    labelImageRotation = [0, labelImageAngleY, 0];
  }

  let textLabelPos: [number, number, number] = [0, 0, 0];
  let textLabelRotation: [number, number, number] = [0, 0, 0];
  if (labelText && !labelImageUrl) {
    // Solo si hay texto de etiqueta Y NO imagen de etiqueta
    textLabelPos = [labelBaseX, 0.23, labelBaseZ]; // Misma altura que la imagen
    const textLabelAngleY = Math.atan2(textLabelPos[0], textLabelPos[2]);
    textLabelRotation = [0, textLabelAngleY, 0];
  }

  let messageTextPos: [number, number, number] = [0, 0, 0];
  let messageTextRotation: [number, number, number] = [0, 0, 0];
  if (messageText) {
    // Mensaje pegado justo arriba de la etiqueta de imagen
    messageTextPos = [labelBaseX, 0.22, labelBaseZ]; // Pegado arriba de la etiqueta (0.15 + altura etiqueta/2 + altura mensaje/2)
    const messageTextAngleY = Math.atan2(messageTextPos[0], messageTextPos[2]);
    messageTextRotation = [0, messageTextAngleY, 0];
  }

  // Posición del QR en el lado opuesto
  let qrPos: [number, number, number] = [qrBaseX, 0.15, qrBaseZ]; // Misma altura que la etiqueta
  const qrAngleY = Math.atan2(qrPos[0], qrPos[2]);
  let qrRotation: [number, number, number] = [0, qrAngleY, 0];
  // --- FIN DE CÁLCULOS DE ROTACIÓN ---

  if (modelError) {
    return (
      <group ref={meshRef}>
        <mesh position={[0, 0, 0]} scale={[0.5, 1, 0.5]}>
          <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
          <meshStandardMaterial color={waxColor} />
        </mesh>
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.1}
          color="red"
          anchorX="center"
          anchorY="middle"
        >
          Modelo no disponible
        </Text>
        {/* Fallback para la imagen de etiqueta si el modelo falla */}
        {labelImageUrl && (
          <Suspense fallback={null}>
            <LabelWithImage
              imageUrl={labelImageUrl}
              position={labelImagePos} // Usar posición calculada
              rotation={labelImageRotation} // Usar rotación calculada
            />
          </Suspense>
        )}
        {/* Fallback para el texto de etiqueta si el modelo falla */}
        {labelText && !labelImageUrl && (
          <Text
            position={textLabelPos} // Usar posición calculada
            rotation={textLabelRotation} // Usar rotación calculada
            fontSize={0.06}
            color="black"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
          >
            {labelText}
          </Text>
        )}
        {/* Fallback para QR si el modelo falla */}
        {showQR && (
          <group position={qrPos} rotation={qrRotation}>
            <mesh>
              <planeGeometry args={[0.18, 0.18]} />{" "}
              {/* Mantener el mismo tamaño */}
              <meshStandardMaterial
                color="white"
                polygonOffset
                polygonOffsetFactor={-2}
              />
            </mesh>
            <Text
              position={[0, 0, 0.001]}
              fontSize={0.03}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              QR Code
            </Text>
          </group>
        )}
      </group>
    );
  }

  return (
    <group ref={meshRef}>
      {model && (
        <primitive
          object={model}
          scale={[4.5, 4.5, 4.5]}
          position={[0, 0, 0]}
        />
      )}

      {/* Label con imagen */}
      {labelImageUrl && (
        <Suspense fallback={null}>
          <LabelWithImage
            imageUrl={labelImageUrl}
            position={labelImagePos}
            rotation={labelImageRotation} // <-- Pasar la rotación calculada
          />
        </Suspense>
      )}

      {/* Label con texto (solo si no hay imagen de etiqueta) */}
      {labelText && !labelImageUrl && (
        <Text
          position={textLabelPos} // <-- Usar la posición calculada
          rotation={textLabelRotation} // <-- Usar la rotación calculada
          fontSize={0.06}
          color="black"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.8}
          // Añadir polygonOffset si el texto tuviera un fondo o para consistencia,
          // pero Text de Drei usualmente maneja bien su renderizado sobre otros objetos.
          // Si se añade un plano de fondo para este texto, ese plano necesitaría polygonOffset.
        >
          {labelText}
        </Text>
      )}

      {/* Mensaje personalizado */}
      {messageText && (
        <group position={messageTextPos} rotation={messageTextRotation}>
          {" "}
          {/* <-- Aplicar rotación */}
          <mesh>
            <planeGeometry args={[0.22, 0.04]} />{" "}
            {/* Más pequeño para quedar más integrado */}
            <meshStandardMaterial
              color="white"
              transparent
              opacity={0.95}
              polygonOffset // <-- Añadido
              polygonOffsetFactor={-2} // <-- Más agresivo para evitar z-fighting
            />
          </mesh>
          <Text
            position={[0, 0, 0.002]} // Pequeño offset en Z local para el texto sobre el plano
            fontSize={0.012} // Texto más pequeño
            color="#333"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.2}
            textAlign="center"
          >
            {messageText}
          </Text>
        </group>
      )}

      {/* QR Code - Ahora en el lado opuesto a la etiqueta */}
      {showQR && (
        <group position={qrPos} rotation={qrRotation}>
          <mesh>
            <planeGeometry args={[0.18, 0.18]} />{" "}
            {/* QR más pequeño para quedar más integrado */}
            <meshStandardMaterial
              transparent
              polygonOffset
              polygonOffsetFactor={-2} // Más agresivo para evitar z-fighting
            >
              <canvasTexture
                attach="map"
                image={(() => {
                  try {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                      canvas.width = 128;
                      canvas.height = 128;
                      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                      ctx.fillRect(0, 0, canvas.width, canvas.height);

                      const blockSize = 4;
                      const pattern = [
                        /* ... tu patrón de QR ... */
                        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
                        [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
                        [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
                        [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1],
                        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                        [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
                        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
                        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                        [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
                        [0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0],
                        [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1],
                        [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0],
                        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1],
                        [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1],
                        [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0],
                        [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1],
                        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
                      ];
                      ctx.fillStyle = "black";
                      const startX =
                        (canvas.width - pattern[0].length * blockSize) / 2;
                      const startY =
                        (canvas.height - pattern.length * blockSize) / 2;
                      for (let row = 0; row < pattern.length; row++) {
                        for (let col = 0; col < pattern[row].length; col++) {
                          if (pattern[row][col] === 1) {
                            ctx.fillRect(
                              startX + col * blockSize,
                              startY + row * blockSize,
                              blockSize,
                              blockSize
                            );
                          }
                        }
                      }
                    }
                    return canvas;
                  } catch (error) {
                    console.error("Error generando QR:", error);
                    const fallbackCanvas = document.createElement("canvas");
                    fallbackCanvas.width = 128;
                    fallbackCanvas.height = 128;
                    return fallbackCanvas;
                  }
                })()}
              />
            </meshStandardMaterial>
          </mesh>
        </group>
      )}
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>{" "}
        {/* Asumiendo que tienes 'border-primary' definido en tu CSS/Tailwind */}
        <span className="ml-2 text-sm text-muted-foreground">
          {" "}
          {/* Asumiendo clases de Tailwind */}
          Cargando modelo 3D...
        </span>
      </div>
    </Html>
  );
}

export function CandleViewer({
  waxColor = "#F5F5F5",
  labelImageUrl,
  labelText,
  messageText,
  showQR = false,
  qrUrl = "https://via.placeholder.com/100x100/000000/ffffff?text=QR", // qrUrl no se usa directamente en la generación del QR actual
  width = 300,
  height = 400,
  autoRotate = true,
  className = "",
  customModelUrl,
}: CandleViewerProps) {
  const [renderError, setRenderError] = useState<string | null>(null);

  const handleRenderError = (error: Error) => {
    setRenderError(error.message);
    console.error("Error en CandleViewer:", error);
  };

  if (renderError) {
    return (
      <div
        className={`border rounded-lg overflow-hidden bg-gray-100 relative flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <div className="text-red-500 mb-2">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.888-.833-2.598 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error de renderizado
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            No se pudo cargar el visor 3D
          </p>
          <button
            onClick={() => setRenderError(null)} // Reintentar limpiando el error
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-lg overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 relative ${className}`}
      style={{ width, height }}
    >
      <Canvas3DErrorBoundary onError={handleRenderError}>
        <Canvas
          camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 1000 }} // Cámara centrada y configuración completa
          gl={{ antialias: true, alpha: true }}
          onCreated={() => console.log("Canvas 3D creado exitosamente")}
        >
          <Suspense fallback={<LoadingFallback />}>
            <ambientLight intensity={0.8} />{" "}
            {/* Aumentar un poco la luz ambiental */}
            <directionalLight position={[10, 10, 5]} intensity={1.2} />{" "}
            {/* Aumentar intensidad direccional */}
            <directionalLight position={[-10, 10, -5]} intensity={0.5} />{" "}
            {/* Luz de relleno */}
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
            <CandleModel
              waxColor={waxColor}
              labelImageUrl={labelImageUrl}
              labelText={labelText}
              messageText={messageText}
              showQR={showQR}
              qrUrl={qrUrl}
              customModelUrl={customModelUrl}
            />
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={1.5}
              target={[0, 0, 0]} // Asegurar que la cámara siempre mire al centro
              minDistance={1.0}
              maxDistance={3.5}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
            />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </Canvas3DErrorBoundary>

      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Arrastra para rotar
      </div>
    </div>
  );
}
