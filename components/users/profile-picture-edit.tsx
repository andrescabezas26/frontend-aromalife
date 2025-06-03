"use client"

import React, { useState } from 'react';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-upload';
import { useUserProfileStore } from '@/stores/users-store';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfilePictureEditProps {
  user: User;
}

export const ProfilePictureEdit: React.FC<ProfilePictureEditProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadProfilePicture, removeProfilePicture, uploadingImage } = useUserProfileStore();

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };
  const handleUpload = async () => {
    if (!selectedFile || !user.id) return;

    try {
      await uploadProfilePicture(user.id, selectedFile);
      toast({
        title: "Éxito",
        description: "Foto de perfil actualizada correctamente",
      });
      setIsOpen(false);
      setSelectedFile(null);
    } catch (error) {
      let errorMessage = "Error al subir la imagen";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Personalizar mensajes específicos según el tipo de error
        if (error.message.includes("Tipo de archivo no permitido")) {
          errorMessage = "Solo se permiten imágenes JPG, JPEG, PNG y WEBP";
        } else if (error.message.includes("muy grande")) {
          errorMessage = "La imagen es muy grande. Máximo 5MB permitido";
        } else if (error.message.includes("corrupto")) {
          errorMessage = "El archivo de imagen está corrupto o es inválido";
        } else if (error.message.includes("pequeña")) {
          errorMessage = "La imagen es muy pequeña. Mínimo 50x50 píxeles";
        }
      }
      
      toast({
        title: "Error al subir imagen",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user.id) return;

    try {
      await removeProfilePicture(user.id);
      toast({
        title: "Éxito",
        description: "Foto de perfil eliminada correctamente",
      });
      setIsOpen(false);
      setSelectedFile(null);
    } catch (error) {
      let errorMessage = "Error al eliminar la imagen";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error al eliminar imagen",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Camera className="w-4 h-4 mr-2" />
          Cambiar foto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar foto de perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <ImageUpload
            value={selectedFile || user.profilePicture || user.imageUrl}
            onChange={handleFileChange}
            onRemove={handleRemoveFile}
            disabled={uploadingImage}
          />
            <div className="flex justify-between space-x-2">
            {/* Botón de eliminar foto (solo si tiene foto de perfil) */}
            {(user.profilePicture || user.imageUrl) && (
              <Button
                variant="destructive"
                onClick={handleRemoveProfilePicture}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar foto'
                )}
              </Button>
            )}
            
            <div className="flex space-x-2 ml-auto">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={uploadingImage}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
