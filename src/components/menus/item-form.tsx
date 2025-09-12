"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Utensils, Upload, Image as ImageIcon, Clock, DollarSign, Plus, Trash2, Edit } from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";

export interface ItemSupplement {
  id: string;
  name: string;
  price: number;
  type: 'single' | 'multiple';
  options: SupplementOption[];
}

export interface SupplementOption {
  id: string;
  name: string;
  price: number;
}

export interface ItemFormData {
  name: string;
  description: string;
  price: number;
  image?: string;
  imageFile?: File;
  preparationTime?: string;
  isAvailable: boolean;
  supplements: ItemSupplement[];
}

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => void;
  mode: 'create' | 'edit';
  initialData?: ItemFormData;
  categoryName: string;
  sectionName: string;
}

const FOOD_EMOJIS = [
  "🍽️", "🍕", "🍔", "🥗", "🍝", "🍜", "🍲", "🥙", "🌮", "🍣", 
  "🍤", "🥘", "🍖", "🥩", "🍗", "🥓", "🍳", "🥞", "🧇", "🥐",
  "🥖", "🍞", "🥨", "🧀", "🍯", "🥜", "🍇", "🍓", "🥝", "🍑",
  "🍒", "🥥", "🍍", "🥭", "🍑", "🍊", "🍋", "🍌", "🍉", "🍈",
  "🍰", "🎂", "🧁", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪",
  "☕", "🍵", "🧃", "🥤", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃"
];

export default function ItemForm({ isOpen, onClose, onSubmit, mode, initialData, categoryName, sectionName }: ItemFormProps) {
  const toast = useGlobalToast();
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    price: 0,
    image: '🍽️',
    preparationTime: '15 min',
    isAvailable: true,
    supplements: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageType, setImageType] = useState<'emoji' | 'upload'>('emoji');
  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<ItemSupplement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.imageFile) {
        setImageType('upload');
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(initialData.imageFile);
      } else {
        setImageType('emoji');
        setImagePreview(null);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        image: '🍽️',
        preparationTime: '15 min',
        isAvailable: true,
        supplements: []
      });
      setImageType('emoji');
      setImagePreview(null);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
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

  const handleInputChange = (field: keyof ItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation du fichier
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast.showError('Fichier trop volumineux', 'L\'image ne doit pas dépasser 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.showError('Format invalide', 'Veuillez sélectionner un fichier image');
        return;
      }

      setFormData(prev => ({ 
        ...prev, 
        imageFile: file,
        image: undefined 
      }));
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setImageType('upload');
    }
  };

  const switchToEmoji = () => {
    setImageType('emoji');
    setImagePreview(null);
    setFormData(prev => ({ 
      ...prev, 
      imageFile: undefined,
      image: '🍽️'
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentImage = () => {
    if (imageType === 'upload' && imagePreview) {
      return imagePreview;
    }
    return formData.image || '🍽️';
  };

  // Fonctions pour gérer les suppléments
  const addSupplement = (supplement: ItemSupplement) => {
    setFormData(prev => ({
      ...prev,
      supplements: [...prev.supplements, supplement]
    }));
  };

  const updateSupplement = (supplementId: string, updatedSupplement: ItemSupplement) => {
    setFormData(prev => ({
      ...prev,
      supplements: prev.supplements.map(s => 
        s.id === supplementId ? updatedSupplement : s
      )
    }));
  };

  const deleteSupplement = (supplementId: string) => {
    setFormData(prev => ({
      ...prev,
      supplements: prev.supplements.filter(s => s.id !== supplementId)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
              <Utensils className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-gray-900">
                {mode === 'create' ? 'Nouveau Plat' : 'Modifier le Plat'}
              </CardTitle>
              <p className="text-gray-600">
                <span className="font-bold text-green-600">{sectionName}</span> → 
                <span className="font-bold text-blue-600 ml-1">{categoryName}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche */}
              <div className="space-y-6">
                {/* Nom du plat */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-bold text-gray-900">
                    Nom du plat *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Pizza Margherita, Burger Classique..."
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
                    placeholder="Décrivez les ingrédients et la préparation..."
                    rows={4}
                    className={`rounded-2xl ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Prix et temps */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-bold text-gray-900">
                      Prix (FCFA) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                      className={`rounded-2xl ${errors.price ? 'border-red-500' : ''}`}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preparationTime" className="text-sm font-bold text-gray-900">
                      Temps de préparation
                    </Label>
                    <Input
                      id="preparationTime"
                      value={formData.preparationTime || ''}
                      onChange={(e) => handleInputChange('preparationTime', e.target.value)}
                      placeholder="Ex: 15 min, 20 min..."
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                {/* Disponibilité */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-900">
                    Disponibilité
                  </Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange('isAvailable', true)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        formData.isAvailable
                          ? 'bg-green-100 text-green-800 border-2 border-green-200'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                      }`}
                    >
                      Disponible
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('isAvailable', false)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        !formData.isAvailable
                          ? 'bg-red-100 text-red-800 border-2 border-red-200'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                      }`}
                    >
                      Indisponible
                    </button>
                  </div>
                </div>

                {/* Suppléments facultatifs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-gray-900">
                      Suppléments (facultatif)
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSupplement(null);
                        setIsSupplementModalOpen(true);
                      }}
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  {formData.supplements.length > 0 ? (
                    <div className="space-y-2">
                      {formData.supplements.map((supplement) => (
                        <Card key={supplement.id} className="bg-gray-50 border border-gray-200">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{supplement.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {supplement.options.length} option{supplement.options.length > 1 ? 's' : ''} • 
                                  Type: {supplement.type === 'single' ? 'Choix unique' : 'Choix multiple'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingSupplement(supplement);
                                    setIsSupplementModalOpen(true);
                                  }}
                                  className="p-1 h-8 w-8"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSupplement(supplement.id)}
                                  className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Aucun supplément ajouté
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite - Image */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-gray-900">
                    Image du plat
                  </Label>
                  
                  {/* Sélecteur de type */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={imageType === 'emoji' ? 'default' : 'outline'}
                      onClick={switchToEmoji}
                      className="flex-1 rounded-2xl"
                    >
                      <span className="mr-2">😋</span>
                      Emoji
                    </Button>
                    <Button
                      type="button"
                      variant={imageType === 'upload' ? 'default' : 'outline'}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 rounded-2xl"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Photo
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

                  {/* Sélection d'emoji */}
                  {imageType === 'emoji' && (
                    <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-2xl">
                      {FOOD_EMOJIS.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleInputChange('image', emoji)}
                          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 ${
                            formData.image === emoji
                              ? 'border-purple-500 bg-purple-50 shadow-lg'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Aperçu image uploadée */}
                  {imageType === 'upload' && imagePreview && (
                    <div className="relative">
                      <div 
                        className="h-48 rounded-2xl bg-cover bg-center border-2 border-purple-500"
                        style={{ backgroundImage: `url(${imagePreview})` }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={switchToEmoji}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Aperçu du plat */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-900">
                    Aperçu du plat
                  </Label>
                  <Card className="bg-white border-2 border-gray-200 shadow-lg rounded-3xl overflow-hidden">
                    <CardContent className="p-0">
                      {/* Image du plat - Grande et bien visible */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                        {imageType === 'upload' && imagePreview ? (
                          <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${imagePreview})` }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-8xl">{getCurrentImage()}</span>
                          </div>
                        )}
                        
                        {/* Badge disponibilité en overlay */}
                        <div className="absolute top-3 right-3">
                          <Badge className={`${
                            formData.isAvailable 
                              ? 'bg-green-100/90 text-green-800 border-green-200' 
                              : 'bg-red-100/90 text-red-600 border-red-200'
                          } backdrop-blur-sm`}>
                            {formData.isAvailable ? 'Disponible' : 'Indisponible'}
                          </Badge>
                        </div>
                      </div>

                      {/* Informations du plat */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 mb-2">
                            {formData.name || 'Nom du plat'}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {formData.description || 'Description du plat'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {formData.preparationTime || '—'}
                              </span>
                            </div>
                            {formData.supplements.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {formData.supplements.length} supplément{formData.supplements.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <p className="text-2xl font-black text-green-600">
                            {formData.price > 0 ? `${formData.price.toLocaleString()} FCFA` : '0 FCFA'}
                          </p>
                        </div>

                        {/* Aperçu des suppléments */}
                        {formData.supplements.length > 0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-700 mb-2">Suppléments disponibles :</p>
                            <div className="space-y-1">
                              {formData.supplements.map((supplement) => (
                                <div key={supplement.id} className="text-xs text-gray-600">
                                  <span className="font-medium">{supplement.name}</span> 
                                  <span className="text-gray-400"> ({supplement.options.length} option{supplement.options.length > 1 ? 's' : ''})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-300"
              >
                {mode === 'create' ? 'Créer le Plat' : 'Modifier le Plat'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de supplément */}
      {isSupplementModalOpen && (
        <SupplementModal
          isOpen={isSupplementModalOpen}
          onClose={() => {
            setIsSupplementModalOpen(false);
            setEditingSupplement(null);
          }}
          onSubmit={(supplement) => {
            if (editingSupplement) {
              updateSupplement(editingSupplement.id, supplement);
            } else {
              addSupplement(supplement);
            }
            setIsSupplementModalOpen(false);
            setEditingSupplement(null);
          }}
          initialData={editingSupplement}
          mode={editingSupplement ? 'edit' : 'create'}
        />
      )}
    </div>
  );
}

// Composant Modal pour créer/éditer les suppléments
interface SupplementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (supplement: ItemSupplement) => void;
  initialData?: ItemSupplement | null;
  mode: 'create' | 'edit';
}

function SupplementModal({ isOpen, onClose, onSubmit, initialData, mode }: SupplementModalProps) {
  const toast = useGlobalToast();
  const [supplementData, setSupplementData] = useState<{
    name: string;
    type: 'single' | 'multiple';
    options: { name: string; price: number }[];
  }>({
    name: '',
    type: 'single',
    options: [{ name: '', price: 0 }]
  });

  useEffect(() => {
    if (initialData) {
      setSupplementData({
        name: initialData.name,
        type: initialData.type,
        options: initialData.options.map(opt => ({ name: opt.name, price: opt.price }))
      });
    } else {
      setSupplementData({
        name: '',
        type: 'single',
        options: [{ name: '', price: 0 }]
      });
    }
  }, [initialData, isOpen]);

  const addOption = () => {
    setSupplementData(prev => ({
      ...prev,
      options: [...prev.options, { name: '', price: 0 }]
    }));
  };

  const updateOption = (index: number, field: 'name' | 'price', value: string | number) => {
    setSupplementData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const removeOption = (index: number) => {
    setSupplementData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supplementData.name.trim()) {
      toast.showError('Nom requis', 'Le nom du supplément est requis');
      return;
    }

    const validOptions = supplementData.options.filter(opt => opt.name.trim());
    if (validOptions.length === 0) {
      toast.showError('Options requises', 'Au moins une option est requise');
      return;
    }

    const supplement: ItemSupplement = {
      id: initialData?.id || `supplement-${Date.now()}`,
      name: supplementData.name,
      type: supplementData.type,
      price: 0, // Prix de base du supplément (peut être utilisé plus tard)
      options: validOptions.map((opt, index) => ({
        id: `option-${Date.now()}-${index}`,
        name: opt.name,
        price: opt.price
      }))
    };

    onSubmit(supplement);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-black text-gray-900">
              {mode === 'create' ? 'Créer un Supplément' : 'Modifier le Supplément'}
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {mode === 'create' 
                ? 'Ajoutez des options personnalisables à votre plat' 
                : 'Modifiez les options de ce supplément'
              }
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du supplément */}
            <div className="space-y-2">
              <Label htmlFor="supplement-name" className="text-sm font-bold text-gray-900">
                Nom du supplément *
              </Label>
              <Input
                id="supplement-name"
                value={supplementData.name}
                onChange={(e) => setSupplementData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Sauce, Fromage, Garniture..."
                className="rounded-2xl"
              />
            </div>

            {/* Type de sélection */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-900">
                Type de sélection *
              </Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSupplementData(prev => ({ ...prev, type: 'single' }))}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    supplementData.type === 'single'
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                  }`}
                >
                  Choix unique
                </button>
                <button
                  type="button"
                  onClick={() => setSupplementData(prev => ({ ...prev, type: 'multiple' }))}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    supplementData.type === 'multiple'
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-200'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                  }`}
                >
                  Choix multiple
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {supplementData.type === 'single' 
                  ? 'Le client peut choisir une seule option' 
                  : 'Le client peut choisir plusieurs options'
                }
              </p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-gray-900">
                  Options disponibles *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter option
                </Button>
              </div>

              <div className="space-y-3">
                {supplementData.options.map((option, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div className="flex-1">
                      <Input
                        value={option.name}
                        onChange={(e) => updateOption(index, 'name', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="0"
                        step="100"
                        value={option.price}
                        onChange={(e) => updateOption(index, 'price', parseInt(e.target.value) || 0)}
                        placeholder="Prix"
                        className="rounded-xl"
                      />
                    </div>
                    {supplementData.options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Aperçu */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-900">Aperçu</Label>
              <Card className="bg-gray-50 border border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">
                      {supplementData.name || 'Nom du supplément'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {supplementData.type === 'single' ? 'Choix unique' : 'Choix multiple'}
                    </p>
                    <div className="space-y-1">
                      {supplementData.options.filter(opt => opt.name.trim()).map((option, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{option.name}</span>
                          <span className="font-medium">+{option.price.toLocaleString()} FCFA</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
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
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all duration-300"
              >
                {mode === 'create' ? 'Créer le Supplément' : 'Modifier le Supplément'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



