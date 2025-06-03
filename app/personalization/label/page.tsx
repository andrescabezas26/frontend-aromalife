"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, Upload, X, ArrowLeft } from "lucide-react";
import { labelsService, Label } from "@/services/labels/labels.service";
import { imageUtils } from "@/lib/image-utils";
import { usePersonalizationStore } from "@/stores/personalization-store";
import { usePreviewNavigation } from "@/hooks/use-preview-navigation";
import { CandleViewer } from "@/components/3d/candle-viewer";

// Extender la interfaz Label para incluir propiedades locales
// Estas propiedades permiten trabajar con etiquetas sin subir al backend
interface ExtendedLabel extends Label {
  isLocal?: boolean; // Indica si es una etiqueta local (no guardada en DB)
  localFile?: File; // Archivo original (se pierde al recargar)
  localPreview?: string; // Preview en base64 (se mantiene al recargar)
  localPrompt?: string; // Prompt de IA (backup)
}
import { useToast } from "@/hooks/use-toast";

export default function EtiquetaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [templateLabels, setTemplateLabels] = useState<Label[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Custom upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Preview navigation
  const { fromPreview, handleNext } = usePreviewNavigation();

  // Zustand store
  const {
    label: selectedLabel,
    container,
    fragrance,
    waxColor,
    setLabel,
    nextStep,
    getProgress,
  } = usePersonalizationStore();

  // Load template labels on component mount
  useEffect(() => {
    const loadTemplateLabels = async () => {
      try {
        setIsLoadingTemplates(true);
        const labels = await labelsService.getTemplateLabels();
        setTemplateLabels(labels);
      } catch (error) {
        console.error("Error loading template labels:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las plantillas de etiquetas",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    loadTemplateLabels();
  }, [toast]);

  // Check if we have a local label that needs to be restored
  useEffect(() => {
    if (
      selectedLabel?.isLocal &&
      !selectedLabel.localFile &&
      selectedLabel.type === "custom"
    ) {
      // Si tenemos una etiqueta local pero no el archivo, mostrar advertencia
      toast({
        title: "Advertencia",
        description:
          "La etiqueta personalizada se mantuvo pero el archivo se perdió al recargar la página. Puedes continuar o seleccionar una nueva etiqueta.",
        variant: "default",
      });
    }
  }, [selectedLabel, toast]);

  // Monitor localStorage usage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        let used = 0;
        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            used += localStorage[key].length;
          }
        }
        const usedMB = used / (1024 * 1024);
        if (usedMB > 3) {
          // Advertir si se usa más de 3MB
          console.warn(
            `LocalStorage usage: ${usedMB.toFixed(
              2
            )}MB - Consider clearing old data`
          );
        }
      } catch (error) {
        console.error("Error checking localStorage usage:", error);
      }
    }
  }, [selectedLabel]);

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description:
          "Por favor, ingresa una descripción para generar la etiqueta",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);

      // Llamar al servicio real de generación de etiquetas con IA
      const generatedLabel = await labelsService.generateLabelWithAI({
        prompt: aiPrompt,
        name: `AI Generated - ${new Date().toLocaleDateString()}`,
      });

      setLabel(generatedLabel);
      toast({
        title: "¡Éxito!",
        description: "Etiqueta creada con IA exitosamente",
      });
    } catch (error) {
      console.error("Error generating AI label:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la etiqueta",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processImageFile(file);
  };

  // Función auxiliar para procesar archivos (compartida entre file select y drag & drop)
  const processImageFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      });
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive",
      });
      return false;
    }

    try {
      setUploadFile(file);

      // Crear una versión de alta calidad para preview (manteniendo mejor resolución)
      const highQualityPreview = await imageUtils.compressImage(
        file,
        600, // Incrementar resolución
        600, // Incrementar resolución
        0.9 // Incrementar calidad
      );

      // Verificar el tamaño de la imagen comprimida
      const compressedSize = imageUtils.getBase64Size(highQualityPreview);
      console.log(
        `Imagen comprimida: ${imageUtils.formatBytes(compressedSize)}`
      );

      // Verificar si podemos almacenar en localStorage
      if (!imageUtils.canStoreInLocalStorage(compressedSize)) {
        toast({
          title: "Advertencia",
          description:
            "La imagen es muy grande y podría no guardarse al recargar la página. Se usará una versión más comprimida.",
          variant: "default",
        });

        // Comprimir de forma más moderada si es necesario
        const moderatePreview = await imageUtils.compressImage(
          file,
          400, // Tamaño moderado
          400, // Tamaño moderado
          0.8 // Calidad moderada
        );
        setUploadPreview(moderatePreview);
      } else {
        setUploadPreview(highQualityPreview);
      }

      // Set default name if empty
      if (!uploadName) {
        setUploadName(file.name.replace(/\.[^/.]+$/, ""));
      }

      return true;
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Error al procesar la imagen. Intenta con otra imagen.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(dragCounter + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(dragCounter - 1);
    if (dragCounter - 1 === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    if (isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0]; // Solo tomar el primer archivo
    await processImageFile(file);
  };

  const handleUploadCustomLabel = async () => {
    if (!uploadFile || !uploadName.trim()) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo y proporciona un nombre",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // MODO LOCAL: Crear etiqueta sin subir al backend
      // La imagen se almacena como base64 en el estado local
      const customLabel: ExtendedLabel = {
        id: `custom-${Date.now()}`, // ID temporal local
        name: uploadName,
        description: uploadDescription || undefined,
        imageUrl: uploadPreview!, // Usar la preview como imageUrl
        type: "custom",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Datos adicionales para el flujo local
        isLocal: true,
        localFile: uploadFile, // Archivo original (se pierde al recargar)
        localPreview: uploadPreview!, // Base64 string (se mantiene al recargar)
      };

      // Verificar tamaño antes de guardar
      const previewSize = imageUtils.getBase64Size(uploadPreview!);
      console.log(
        `Intentando guardar etiqueta con imagen de ${imageUtils.formatBytes(
          previewSize
        )}`
      );

      setLabel(customLabel);
      toast({
        title: "¡Éxito!",
        description: "Etiqueta personalizada creada exitosamente",
      });
    } catch (error) {
      console.error("Error creating custom label:", error);

      // Si el error es de cuota de almacenamiento, intentar con imagen más pequeña
      if (error instanceof Error && error.message.includes("quota")) {
        try {
          // Comprimir más agresivamente
          const ultraCompressed = await imageUtils.compressImage(
            uploadFile,
            150,
            150,
            0.4
          );
          const ultraCompressedLabel: ExtendedLabel = {
            id: `custom-${Date.now()}`,
            name: uploadName,
            description: uploadDescription || undefined,
            imageUrl: ultraCompressed,
            type: "custom",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isLocal: true,
            localFile: uploadFile,
            localPreview: ultraCompressed,
          };

          setLabel(ultraCompressedLabel);
          toast({
            title: "¡Éxito!",
            description:
              "Etiqueta creada con imagen comprimida (para ahorrar espacio)",
            variant: "default",
          });
        } catch (secondError) {
          toast({
            title: "Error",
            description:
              "No se pudo crear la etiqueta. El almacenamiento local está lleno. Intenta refrescar la página.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear la etiqueta personalizada",
          variant: "destructive",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadName("");
    setUploadDescription("");

    // Si teníamos una etiqueta personalizada seleccionada, la removemos también
    if (selectedLabel?.type === "custom" && selectedLabel?.isLocal) {
      setLabel(null);
    }
  };

  const handleContinue = () => {
    if (selectedLabel) {
      if (fromPreview) {
        handleNext("/personalization/preview");
      } else {
        nextStep();
        handleNext("/personalization/message");
      }
    }
  };

  // Función de utilidad para obtener la URL de imagen correcta
  const getLabelImageUrl = (label: Label | ExtendedLabel) => {
    if (label.isLocal && "localPreview" in label && label.localPreview) {
      return label.localPreview;
    }
    return label.imageUrl || "/placeholder.svg";
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">
            {fromPreview ? "Editar Etiqueta" : "Personaliza tu vela"}
          </h1>
          <Progress value={getProgress()} className="w-full max-w-md mx-auto" />
          <p className="text-lg text-muted-foreground">Paso 5 de 8</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Diseña tu etiqueta
          </h2>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Candle 3D viewer */}
            <div className="flex-1 flex flex-col items-center">
              <CandleViewer
                waxColor={fragrance?.color || waxColor || "#F5F5F5"}
                labelImageUrl={
                  selectedLabel ? getLabelImageUrl(selectedLabel) : undefined
                }
                width={320}
                height={400}
                autoRotate={true}
                className="shadow-lg"
              />
              <div className="mt-4 text-center space-y-2">
                {selectedLabel ? (
                  <>
                    <p className="text-lg font-medium">{selectedLabel.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Etiqueta aplicada a la vela
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Selecciona una etiqueta para ver la vela
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground text-center max-w-xs">
                Vista previa 3D - La etiqueta se aplicará a tu vela
                personalizada
                {selectedLabel?.isLocal && (
                  <span className="block mt-2 text-xs text-blue-600 font-medium">
                    ℹ️ Para guardar la etiqueta, debes continuar con el proceso
                    de personalización
                  </span>
                )}
              </p>
            </div>

            {/* Image selection options */}
            <div className="flex-1">
              <Tabs defaultValue="plantillas">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
                  <TabsTrigger value="ia">Crear con IA</TabsTrigger>
                  <TabsTrigger value="personalizada">Subir imagen</TabsTrigger>
                </TabsList>

                <TabsContent value="plantillas" className="mt-4">
                  {isLoadingTemplates ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {templateLabels.map((label) => (
                        <Card
                          key={label.id}
                          className={`cursor-pointer transition-all ${
                            selectedLabel?.id === label.id
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
                          onClick={() => setLabel(label)}
                        >
                          <CardContent className="p-3">
                            <div className="aspect-square w-full flex items-center justify-center bg-gray-50 rounded-md overflow-hidden">
                              <Image
                                src={label.imageUrl || "/placeholder.svg"}
                                width={120}
                                height={120}
                                alt={label.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ia" className="mt-4">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <p className="text-sm">
                          Describe la imagen que deseas crear:
                        </p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ej: Fondo pastel con flores de lavanda..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            disabled={isGenerating}
                          />
                          <Button
                            onClick={handleGenerateAI}
                            disabled={!aiPrompt.trim() || isGenerating}
                          >
                            {isGenerating ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Wand2 className="h-4 w-4 mr-2" />
                            )}
                            {isGenerating ? "Creando..." : "Crear"}
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                        {selectedLabel &&
                        selectedLabel.type === "ai-generated" ? (
                          <div className="text-center space-y-2">
                            <div className="aspect-square w-32 mx-auto bg-gray-50 rounded-md overflow-hidden">
                              <Image
                                src={
                                  selectedLabel.imageUrl || "/placeholder.svg"
                                }
                                width={120}
                                height={120}
                                alt="Imagen generada por IA"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Prompt: {selectedLabel.aiPrompt}
                            </p>
                          </div>
                        ) : isGenerating ? (
                          <div className="text-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground">
                              Creando etiqueta con IA...
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            La etiqueta generada aparecerá aquí
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="personalizada" className="mt-4">
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-4">
                        <div>
                          <UILabel
                            htmlFor="file-upload"
                            className="text-sm font-medium"
                          >
                            Seleccionar imagen
                          </UILabel>
                          <div className="mt-2">
                            {!uploadFile ? (
                              <label
                                htmlFor="file-upload"
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                                  isDragOver
                                    ? "border-blue-400 bg-blue-50 text-blue-600"
                                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                                }`}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload
                                    className={`w-8 h-8 mb-2 ${
                                      isDragOver
                                        ? "text-blue-400"
                                        : "text-gray-400"
                                    }`}
                                  />
                                  <p
                                    className={`mb-2 text-sm ${
                                      isDragOver
                                        ? "text-blue-600"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    <span className="font-semibold">
                                      {isDragOver
                                        ? "Suelta la imagen aquí"
                                        : "Haz clic para subir"}
                                    </span>
                                    {!isDragOver && <> o arrastra y suelta</>}
                                  </p>
                                  <p
                                    className={`text-xs ${
                                      isDragOver
                                        ? "text-blue-500"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    PNG, JPG o JPEG (máx. 5MB)
                                  </p>
                                </div>
                                <input
                                  id="file-upload"
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  disabled={isUploading}
                                />
                              </label>
                            ) : (
                              <div className="relative">
                                <div className="aspect-square w-full bg-gray-50 rounded-md overflow-hidden flex items-center justify-center border-2 border-gray-300">
                                  {uploadPreview && (
                                    <Image
                                      src={uploadPreview}
                                      width={300}
                                      height={300}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                      priority
                                    />
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={handleRemoveFile}
                                  disabled={isUploading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <UILabel
                            htmlFor="upload-name"
                            className="text-sm font-medium"
                          >
                            Nombre de la etiqueta
                          </UILabel>
                          <Input
                            id="upload-name"
                            placeholder="Ej: Mi etiqueta personalizada"
                            value={uploadName}
                            onChange={(e) => setUploadName(e.target.value)}
                            disabled={isUploading}
                          />
                        </div>

                        <div className="space-y-2">
                          <UILabel
                            htmlFor="upload-description"
                            className="text-sm font-medium"
                          >
                            Descripción (opcional)
                          </UILabel>
                          <Textarea
                            id="upload-description"
                            placeholder="Describe tu etiqueta personalizada..."
                            value={uploadDescription}
                            onChange={(e) =>
                              setUploadDescription(e.target.value)
                            }
                            disabled={isUploading}
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={handleUploadCustomLabel}
                          disabled={
                            !uploadFile || !uploadName.trim() || isUploading
                          }
                          className="w-full"
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {isUploading ? "Creando..." : "Crear etiqueta"}
                        </Button>
                      </div>

                      <div className="border rounded-lg p-4 flex items-center justify-center min-h-[100px]">
                        {selectedLabel &&
                        selectedLabel.type === "custom" &&
                        selectedLabel.isLocal ? (
                          <div className="text-center space-y-2">
                            <div className="aspect-square w-32 mx-auto bg-gray-50 rounded-md overflow-hidden">
                              <Image
                                src={
                                  selectedLabel.localPreview ||
                                  "/placeholder.svg"
                                }
                                width={120}
                                height={120}
                                alt="Etiqueta personalizada"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {selectedLabel.name}
                            </p>
                            <p className="text-xs text-green-600">
                              ✓ Etiqueta creada
                            </p>
                          </div>
                        ) : selectedLabel && selectedLabel.type === "custom" ? (
                          <div className="text-center space-y-2">
                            <div className="aspect-square w-32 mx-auto bg-gray-50 rounded-md overflow-hidden">
                              <Image
                                src={
                                  selectedLabel.imageUrl || "/placeholder.svg"
                                }
                                width={120}
                                height={120}
                                alt="Etiqueta personalizada"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {selectedLabel.name}
                            </p>
                          </div>
                        ) : isUploading ? (
                          <div className="text-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground">
                              Creando etiqueta...
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Tu etiqueta personalizada aparecerá aquí
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="flex justify-between items-center mt-8">
            {fromPreview && (
              <Button
                variant="outline"
                onClick={() => handleNext("/personalization/preview")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Preview
              </Button>
            )}
            {!fromPreview && (
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}

            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleContinue}
                disabled={!selectedLabel}
              >
                {fromPreview ? "Guardar Cambios" : "Siguiente: Mensaje"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
