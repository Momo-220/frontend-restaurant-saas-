"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Utensils,
  Edit,
  DollarSign,
  Clock,
  Image as ImageIcon,
  X,
  Save,
  Plus,
  AlertCircle,
  Upload,
  Trash2
} from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";

export interface MenuFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  type: string;
  preparationTime: string;
  image: string;
  imageFile?: File;
}

interface MenuFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuFormData) => void;
  initialData?: Partial<MenuFormData>;
  mode: 'create' | 'edit';
  categories: Array<{ id: number; name: string; description: string; image: string }>;
  types: Array<{ id: number; name: string; categoryId: number; description: string; image: string }>;
}

export default function MenuForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  mode, 
  categories, 
  types 
}: MenuFormProps) {
  const { showError } = useGlobalToast();
  const [formData, setFormData] = useState<MenuFormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    type: "",
    preparationTime: "",
    image: "",
    imageFile: undefined
  });

  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errors, setErrors] = useState<Partial<MenuFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les données existantes
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData, mode]);

  // Reset le formulaire quand il s'ouvre
  useEffect(() => {
    if (isOpen && mode === 'create') {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        type: "",
        preparationTime: "",
        image: "",
        imageFile: undefined
      });
      setErrors({});
      setImagePreview("");
    }
  }, [isOpen, mode]);

  // Plus besoin de filtrer les types - le restaurant saisit librement

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Partial<MenuFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du menu est requis";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    }

    if (!formData.price || parseInt(formData.price) <= 0) {
      newErrors.price = "Le prix doit être supérieur à 0";
    }

    if (!formData.category) {
      newErrors.category = "La catégorie est requise";
    }

    if (!formData.type) {
      newErrors.type = "Le type est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion des changements de catégorie
  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ 
      ...prev, 
      category, 
      type: "" // Reset le type quand la catégorie change
    }));
    setErrors(prev => ({ ...prev, type: undefined }));
  };

  // Gestion des changements de type
  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, type }));
    setErrors(prev => ({ ...prev, type: undefined }));
  };

  // Gestion de l'upload d'images
  const handleImageUpload = (file: File) => {
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      showError('Format invalide', 'Veuillez sélectionner une image valide (JPG, PNG, WebP)');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Fichier trop volumineux', 'L\'image doit faire moins de 5MB');
      return;
    }

    // Créer la prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Mettre à jour le formulaire
    setFormData(prev => ({ 
      ...prev, 
      imageFile: file,
      image: file.name // Garder le nom du fichier
    }));
  };

  // Gestion du drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  // Gestion de la sélection de fichier
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  // Supprimer l'image
  const removeImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      imageFile: undefined,
      image: ""
    }));
    setImagePreview("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                {mode === 'create' ? (
                  <Plus className="h-6 w-6 text-white" />
                ) : (
                  <Edit className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <CardTitle className="text-3xl font-black text-gray-900">
                  {mode === 'create' ? 'Nouveau Menu' : 'Modifier le Menu'}
                </CardTitle>
                <p className="text-gray-600 font-medium">
                  {mode === 'create' 
                    ? 'Créez un nouveau menu pour votre carte' 
                    : 'Modifiez les informations de ce menu'
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nom et Prix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">
                  <span className="text-red-500">*</span> Nom du Menu
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full px-4 py-4 pl-12 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.name 
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300'
                    }`}
                    placeholder="Ex: Pizza Margherita"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <Utensils className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.name && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">
                  <span className="text-red-500">*</span> Prix (FCFA)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, price: e.target.value }));
                      setErrors(prev => ({ ...prev, price: undefined }));
                    }}
                    className={`w-full px-4 py-4 pl-12 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.price 
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300'
                    }`}
                    placeholder="2500"
                    min="0"
                    step="100"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                {errors.price && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.price}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                <span className="text-red-500">*</span> Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  setErrors(prev => ({ ...prev, description: undefined }));
                }}
                className={`w-full px-4 py-4 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                  errors.description 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300'
                }`}
                rows={3}
                placeholder="Description détaillée du menu..."
              />
              {errors.description && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.description}</span>
                </div>
              )}
            </div>

            {/* Catégorie et Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">
                  <span className="text-red-500">*</span> Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`w-full px-4 py-4 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 appearance-none cursor-pointer ${
                    errors.category 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                      : 'border-gray-200 focus:ring-green-500/20 focus:border-green-500 hover:border-green-300'
                  }`}
                >
                  <option value="">🎯 Choisir une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.image} {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.category}</span>
                  </div>
                )}
              </div>

                             <div className="space-y-3">
                 <label className="block text-sm font-bold text-gray-700">
                   <span className="text-red-500">*</span> Type de Plat
                 </label>
                 <div className="relative">
                   <input
                     type="text"
                     value={formData.type}
                     onChange={(e) => handleTypeChange(e.target.value)}
                     disabled={!formData.category}
                     className={`w-full px-4 py-4 pl-12 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 ${
                       !formData.category 
                         ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                         : errors.type 
                           ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                           : 'border-gray-200 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300'
                     }`}
                     placeholder={!formData.category 
                       ? '⚠️ Sélectionnez d\'abord une catégorie' 
                       : 'Ex: Pizza Margherita, Burger Classique, Salade César...'
                     }
                   />
                   <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                     <Utensils className="h-5 w-5 text-gray-400" />
                   </div>
                 </div>
                 {!formData.category && (
                   <div className="flex items-center gap-2 text-sm text-blue-600">
                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                     <span className="font-medium">
                       Choisissez d'abord une catégorie pour saisir le type
                     </span>
                   </div>
                 )}
                 {errors.type && (
                   <div className="flex items-center gap-2 text-sm text-red-600">
                     <AlertCircle className="h-4 w-4" />
                     <span>{errors.type}</span>
                   </div>
                 )}
               </div>
            </div>

            {/* Temps de préparation et Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">
                  Temps de préparation
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: e.target.value }))}
                    className="w-full px-4 py-4 pl-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 transition-all duration-300"
                    placeholder="Ex: 15 min"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">
                  Image du Menu
                </label>
                
                {/* Zone d'upload avec drag & drop */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
                    dragActive 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    // Prévisualisation de l'image
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Prévisualisation" 
                        className="w-full h-32 object-cover rounded-xl mx-auto"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white hover:bg-red-600 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="mt-2 text-center">
                        <p className="text-sm text-gray-600 font-medium">
                          {formData.imageFile?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {((formData.imageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Zone d'upload vide
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-700 mb-2">
                        Glissez votre image ici
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        ou cliquez pour sélectionner un fichier
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <span>JPG, PNG, WebP</span>
                        <span>•</span>
                        <span>Max 5MB</span>
                      </div>
                      
                      {/* Bouton de sélection de fichier caché */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label 
                        htmlFor="image-upload"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                      >
                        Choisir une image
                      </label>
                    </div>
                  )}
                </div>
                
                {/* Informations sur l'upload */}
                {!imagePreview && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">
                      L'image sera automatiquement redimensionnée et optimisée
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 px-8 py-4 rounded-2xl font-medium border-gray-200 hover:bg-gray-100 hover:border-green-300 transition-all duration-300"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    <span>{mode === 'create' ? 'Créer le Menu' : 'Sauvegarder'}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



