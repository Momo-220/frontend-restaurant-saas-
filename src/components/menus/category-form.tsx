"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, FolderOpen, Upload, Image as ImageIcon } from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";

export interface CategoryFormData {
  name: string;
  description: string;
  backgroundImage?: string;
  backgroundImageFile?: File;
  order: number;
}

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  mode: 'create' | 'edit';
  initialData?: CategoryFormData;
  sectionName: string;
}

const GRADIENT_PRESETS = [
  {
    name: "Bleu Violet",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    name: "Rose Orange",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    name: "Bleu Cyan",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    name: "Rose Jaune",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  {
    name: "Vert Menthe",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  },
  {
    name: "Orange Pêche",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
  },
  {
    name: "Violet Indigo",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    name: "Rouge Corail",
    gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
  }
];

export default function CategoryForm({ isOpen, onClose, onSubmit, mode, initialData, sectionName }: CategoryFormProps) {
  const { showError } = useGlobalToast();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    backgroundImage: GRADIENT_PRESETS[0].gradient,
    order: 1
  });

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'gradient' | 'image'>('gradient');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.backgroundImageFile) {
        setUploadType('image');
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(initialData.backgroundImageFile);
      } else {
        setUploadType('gradient');
        setImagePreview(null);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        backgroundImage: GRADIENT_PRESETS[0].gradient,
        order: 1
      });
      setUploadType('gradient');
      setImagePreview(null);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.order < 1) {
      newErrors.order = 'L\'ordre doit être supérieur à 0' as any;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation du fichier
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        showError('Fichier trop volumineux', 'L\'image ne doit pas dépasser 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showError('Format invalide', 'Veuillez sélectionner un fichier image');
        return;
      }

      setFormData(prev => ({ 
        ...prev, 
        backgroundImageFile: file,
        backgroundImage: undefined 
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setUploadType('image');
    }
  };

  const switchToGradient = () => {
    setUploadType('gradient');
    setImagePreview(null);
    setFormData(prev => ({ 
      ...prev, 
      backgroundImageFile: undefined,
      backgroundImage: GRADIENT_PRESETS[0].gradient
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-gray-900">
                {mode === 'create' ? 'Nouvelle Catégorie' : 'Modifier la Catégorie'}
              </CardTitle>
              <p className="text-gray-600">
                Section : <span className="font-bold text-blue-600">{sectionName}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom de la catégorie */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-gray-900">
                Nom de la catégorie *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Entrées, Plats Principaux, Pizzas..."
                className={`rounded-2xl ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-bold text-gray-900">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Décrivez cette catégorie..."
                rows={3}
                className={`rounded-2xl ${errors.description ? 'border-red-500' : ''}`}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Type d'arrière-plan */}
            <div className="space-y-4">
              <Label className="text-sm font-bold text-gray-900">
                Arrière-plan de la catégorie *
              </Label>
              
              {/* Sélecteur de type */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={uploadType === 'gradient' ? 'default' : 'outline'}
                  onClick={switchToGradient}
                  className="flex-1 rounded-2xl"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Dégradé
                </Button>
                <Button
                  type="button"
                  variant={uploadType === 'image' ? 'default' : 'outline'}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 rounded-2xl"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Image personnalisée
                </Button>
              </div>

              {/* Upload d'image */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Sélection de dégradé */}
              {uploadType === 'gradient' && (
                <div className="grid grid-cols-4 gap-3">
                  {GRADIENT_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleInputChange('backgroundImage', preset.gradient)}
                      className={`h-16 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                        formData.backgroundImage === preset.gradient
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      style={{ background: preset.gradient }}
                      title={preset.name}
                    />
                  ))}
                </div>
              )}

              {/* Aperçu image uploadée */}
              {uploadType === 'image' && imagePreview && (
                <div className="relative">
                  <div 
                    className="h-32 rounded-2xl bg-cover bg-center border-2 border-blue-500"
                    style={{ backgroundImage: `url(${imagePreview})` }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={switchToGradient}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Ordre */}
            <div className="space-y-2">
              <Label htmlFor="order" className="text-sm font-bold text-gray-900">
                Ordre d'affichage *
              </Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                className={`rounded-2xl w-32 ${errors.order ? 'border-red-500' : ''}`}
              />
              {errors.order && (
                <p className="text-sm text-red-600">{errors.order}</p>
              )}
            </div>

            {/* Aperçu */}
            <div className="space-y-3">
              <Label className="text-sm font-bold text-gray-900">
                Aperçu de la catégorie
              </Label>
              <Card className="overflow-hidden rounded-3xl shadow-lg">
                <CardContent className="p-0 relative h-48">
                  {/* Background */}
                  <div 
                    className="absolute inset-0 opacity-90"
                    style={uploadType === 'image' && imagePreview ? {
                      backgroundImage: `url(${imagePreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    } : {
                      background: formData.backgroundImage || GRADIENT_PRESETS[0].gradient
                    }}
                  />
                  
                  {/* Overlay sombre */}
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Contenu */}
                  <div className="relative h-full flex flex-col justify-end p-6 text-white">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {formData.name || 'Nom de la catégorie'}
                      </h3>
                      <p className="text-white/90 text-sm mb-2">
                        {formData.description || 'Description de la catégorie'}
                      </p>
                      <p className="text-white/80 text-xs">
                        0 plat
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl font-medium"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-300"
              >
                {mode === 'create' ? 'Créer la Catégorie' : 'Modifier la Catégorie'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



