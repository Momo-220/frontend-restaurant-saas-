"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, File } from 'lucide-react';
import { Button } from './button';
import { supabaseStorage } from '@/services/supabase';

interface FileUploadProps {
  onFileSelect: (file: File | null, url?: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  placeholder?: string;
  currentFile?: File | string | null;
  uploadType?: 'logo' | 'banner' | 'menu-item';
  restaurantId?: string;
  itemId?: string;
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  className = "",
  placeholder = "Glissez-déposez votre fichier ici ou cliquez pour sélectionner",
  currentFile,
  uploadType = 'logo',
  restaurantId,
  itemId
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    setIsUploading(true);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('Le fichier est trop volumineux (max 5MB)');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Type de fichier non supporté');
      } else {
        setError('Erreur lors du téléchargement du fichier');
      }
      setIsUploading(false);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      try {
        // Créer un aperçu pour les images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }

        // Upload vers Supabase si on a les paramètres nécessaires
        if (restaurantId && uploadType) {
          let uploadedUrl: string;
          
          switch (uploadType) {
            case 'logo':
              uploadedUrl = await supabaseStorage.uploadLogo(file, restaurantId);
              break;
            case 'banner':
              uploadedUrl = await supabaseStorage.uploadBanner(file, restaurantId);
              break;
            case 'menu-item':
              if (itemId) {
                uploadedUrl = await supabaseStorage.uploadMenuItemImage(file, restaurantId, itemId);
              } else {
                throw new Error('itemId requis pour upload menu-item');
              }
              break;
            default:
              uploadedUrl = await supabaseStorage.uploadFile(file);
          }
          
          onFileSelect(file, uploadedUrl);
        } else {
          // Mode local (pas d'upload)
          onFileSelect(file);
        }
      } catch (uploadError) {
        console.error('Erreur upload:', uploadError);
        setError('Erreur lors de l\'upload du fichier');
        onFileSelect(null);
      } finally {
        setIsUploading(false);
      }
    }
  }, [onFileSelect, restaurantId, uploadType, itemId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept === "image/*" ? {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    } : undefined,
    maxSize,
    multiple: false
  });

  const removeFile = () => {
    onFileSelect(null);
    setPreview(null);
    setError(null);
  };

  const getFileIcon = () => {
    if (currentFile && typeof currentFile === 'object' && 'name' in currentFile) {
      return (currentFile as File).type.startsWith('image/') ? <Image className="h-8 w-8" /> : <File className="h-8 w-8" />;
    }
    return <Upload className="h-8 w-8" />;
  };

  const getFileName = () => {
    if (currentFile && typeof currentFile === 'object' && 'name' in currentFile) {
      return (currentFile as File).name;
    }
    if (typeof currentFile === 'string') {
      return currentFile.split('/').pop() || 'Fichier sélectionné';
    }
    return null;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {preview || (currentFile && typeof currentFile === 'string') ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img 
                src={preview || (currentFile as string)} 
                alt="Aperçu" 
                className="h-24 w-24 object-cover rounded-lg mx-auto"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {getFileName()}
              </p>
              <p className="text-xs text-gray-500">
                Cliquez pour changer
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              {getFileIcon()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isUploading ? 'Upload en cours...' : isDragActive ? 'Déposez le fichier ici' : 'Télécharger un fichier'}
              </p>
              <p className="text-xs text-gray-500">
                {isUploading ? 'Veuillez patienter' : placeholder}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      
      {currentFile && !error && (
        <p className="text-sm text-green-600 flex items-center">
          <Image className="h-4 w-4 mr-1" />
          Fichier sélectionné avec succès
        </p>
      )}
    </div>
  );
}
