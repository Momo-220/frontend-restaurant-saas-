"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff, 
  Search,
  ChefHat,
  Utensils,
  DollarSign,
  Clock,
  Star,
  ArrowLeft,
  Settings,
  TrendingUp,
  Activity
} from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { categoriesService, type Category, type Item } from "@/services/categoriesService";
import { useAuth } from "@/services/authService";
import dynamic from "next/dynamic";

// Interface pour les formulaires
interface CategoryFormData {
  name: string;
  description: string;
  image_file?: File;
}

interface ItemFormData {
  name: string;
  description: string;
  price: number;
  image_file?: File;
  category_id: string;
}

function MenusPageInner() {
  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useGlobalToast();

  // États pour la navigation
  const [currentView, setCurrentView] = useState<'categories' | 'items'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // États pour les données
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // États pour les modals
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Charger les catégories
  const loadCategories = async () => {
    if (authLoading || !user) return;
    
    setLoading(true);
    try {
      const data = await categoriesService.getCategories(true);
      setCategories(data);
      console.log('✅ Catégories chargées:', data.length);
    } catch (error) {
      console.error('❌ Erreur chargement catégories:', error);
      showError('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  // Charger les items d'une catégorie
  const loadItems = async (categoryId?: string) => {
    if (authLoading || !user) return;

    setLoading(true);
    try {
      const data = await categoriesService.getItems(categoryId, true);
      setItems(data);
      console.log('✅ Items chargés:', data.length);
    } catch (error) {
      console.error('❌ Erreur chargement items:', error);
      showError('Erreur', 'Impossible de charger les items');
    } finally {
      setLoading(false);
    }
  };

  // Effet initial
  useEffect(() => {
    if (!authLoading && user) {
      loadCategories();
    }
  }, [authLoading, user]);

  // Créer une catégorie
  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      // TODO: Upload image si présente
      let imageUrl = '';
      if (data.image_file) {
        // Simuler l'upload pour le moment
        imageUrl = `https://via.placeholder.com/400x300/4f46e5/ffffff?text=${encodeURIComponent(data.name)}`;
        console.log('📁 Upload image catégorie simulé:', data.image_file.name, '→', imageUrl);
      }

      const newCategory = await categoriesService.createCategory({
        name: data.name,
        description: data.description,
        image_url: imageUrl,
      });
      
      setCategories(prev => [...prev, newCategory]);
      setIsCategoryFormOpen(false);
      showSuccess('Succès', 'Catégorie créée avec succès');
    } catch (error: any) {
      console.error('❌ Erreur création catégorie:', error);
      showError('Erreur', error.message || 'Impossible de créer la catégorie');
    }
  };

  // Modifier une catégorie
  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return;
    
    try {
      // TODO: Upload image si présente
      let imageUrl = editingCategory.image_url;
      if (data.image_file) {
        imageUrl = `https://via.placeholder.com/400x300/4f46e5/ffffff?text=${encodeURIComponent(data.name)}`;
        console.log('📁 Upload image catégorie modifiée simulé:', data.image_file.name, '→', imageUrl);
      }

      const updatedCategory = await categoriesService.updateCategory(editingCategory.id, {
        name: data.name,
        description: data.description,
        image_url: imageUrl,
      });
      
      setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat));
      setEditingCategory(null);
      setIsCategoryFormOpen(false);
      showSuccess('Succès', 'Catégorie modifiée avec succès');
    } catch (error: any) {
      console.error('❌ Erreur modification catégorie:', error);
      showError('Erreur', error.message || 'Impossible de modifier la catégorie');
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)) return;
    
    try {
      await categoriesService.deleteCategory(category.id);
      setCategories(prev => prev.filter(cat => cat.id !== category.id));
      showSuccess('Succès', 'Catégorie supprimée avec succès');
    } catch (error: any) {
      console.error('❌ Erreur suppression catégorie:', error);
      showError('Erreur', error.message || 'Impossible de supprimer la catégorie');
    }
  };

  // Créer un item
  const handleCreateItem = async (data: ItemFormData) => {
    try {
      // TODO: Upload image si présente
      let imageUrl = '';
      if (data.image_file) {
        imageUrl = `https://via.placeholder.com/400x300/22c55e/ffffff?text=${encodeURIComponent(data.name)}`;
        console.log('📁 Upload image item simulé:', data.image_file.name, '→', imageUrl);
      }

      const newItem = await categoriesService.createItem({
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: imageUrl,
        category_id: data.category_id,
      });
      
      setItems(prev => [...prev, newItem]);
      setIsItemFormOpen(false);
      showSuccess('Succès', 'Plat créé avec succès');
    } catch (error: any) {
      console.error('❌ Erreur création item:', error);
      showError('Erreur', error.message || 'Impossible de créer le plat');
    }
  };

  // Modifier un item
  const handleUpdateItem = async (data: ItemFormData) => {
    if (!editingItem) return;
    
    try {
      // TODO: Upload image si présente
      let imageUrl = editingItem.image_url;
      if (data.image_file) {
        imageUrl = `https://via.placeholder.com/400x300/22c55e/ffffff?text=${encodeURIComponent(data.name)}`;
        console.log('📁 Upload image item modifié simulé:', data.image_file.name, '→', imageUrl);
      }

      const updatedItem = await categoriesService.updateItem(editingItem.id, {
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: imageUrl,
      });
      
      setItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
      setEditingItem(null);
      setIsItemFormOpen(false);
      showSuccess('Succès', 'Plat modifié avec succès');
    } catch (error: any) {
      console.error('❌ Erreur modification item:', error);
      showError('Erreur', error.message || 'Impossible de modifier le plat');
    }
  };

  // Supprimer un item
  const handleDeleteItem = async (item: Item) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${item.name}" ?`)) return;
    
    try {
      await categoriesService.deleteItem(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      showSuccess('Succès', 'Plat supprimé avec succès');
    } catch (error: any) {
      console.error('❌ Erreur suppression item:', error);
      showError('Erreur', error.message || 'Impossible de supprimer le plat');
    }
  };

  // Toggle stock d'un item
  const handleToggleStock = async (item: Item) => {
    try {
      const updatedItem = await categoriesService.toggleItemStock(item.id);
      setItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
      showSuccess('Succès', `Stock ${updatedItem.out_of_stock ? 'désactivé' : 'activé'}`);
    } catch (error: any) {
      console.error('❌ Erreur toggle stock:', error);
      showError('Erreur', error.message || 'Impossible de modifier le stock');
    }
  };

  // Navigation vers les items d'une catégorie
  const goToItems = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('items');
    loadItems(category.id);
  };

  // Retour aux catégories
  const goBackToCategories = () => {
    setSelectedCategory(null);
    setCurrentView('categories');
    setItems([]);
  };

  // Filtrer les données selon la recherche
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistiques
  const stats = {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.is_active).length,
    totalItems: items.length,
    availableItems: items.filter(i => i.is_available && !i.out_of_stock).length,
  };

  if (authLoading) {
  return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de votre menu...</p>
          </div>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ChefHat className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-3">Connexion requise</h3>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour gérer vos menus</p>
            <Button 
            onClick={() => window.location.href = '/auth/login'}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-2xl"
            >
            Se connecter
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10 p-4 md:p-6 lg:p-10 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* En-tête avec style dashboard uniforme */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-black text-gray-900 mb-2 md:mb-4 tracking-tight">
            {currentView === 'categories' ? 'Mes Catégories' : selectedCategory?.name}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 font-medium max-w-2xl leading-relaxed">
            {currentView === 'categories' 
              ? 'Organisez votre menu par sections - Gérez votre carte avec style' 
              : `Gérez les plats de cette catégorie - ${selectedCategory?.name}`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {currentView === 'items' && (
            <Button 
              variant="outline" 
              onClick={goBackToCategories}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
          )}
          <Button 
            onClick={() => {
              if (currentView === 'categories') {
                setEditingCategory(null);
                setIsCategoryFormOpen(true);
              } else {
                setEditingItem(null);
                setIsItemFormOpen(true);
              }
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
          >
            <Plus className="h-5 w-5" />
            {currentView === 'categories' ? 'Nouvelle Catégorie' : 'Nouveau Plat'}
          </Button>
        </div>
      </div>


      {/* Cartes de statistiques ultra-modernes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Total Catégories */}
        <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
            <CardTitle className="text-sm md:text-base font-bold text-gray-900">
              Total Catégories
            </CardTitle>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <ChefHat className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-3">{stats.totalCategories}</div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 bg-blue-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                <span className="text-xs md:text-sm font-bold text-blue-700">Sections créées</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Catégories Actives */}
        <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
            <CardTitle className="text-sm md:text-base font-bold text-gray-900">
              Catégories Actives
            </CardTitle>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Activity className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-3">{stats.activeCategories}</div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 bg-green-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                <span className="text-xs md:text-sm font-bold text-green-700">Disponibles</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Plats */}
        <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
            <CardTitle className="text-sm md:text-base font-bold text-gray-900">
              Total Plats
            </CardTitle>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Utensils className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-3">{stats.totalItems}</div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 bg-orange-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                <span className="text-xs md:text-sm font-bold text-orange-700">Plats créés</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche avec style dashboard */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={`🔍 Rechercher ${currentView === 'categories' ? 'une catégorie' : 'un plat'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-lg border-gray-300 rounded-xl focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal */}
      {currentView === 'categories' ? (
        // Vue Catégories avec style dashboard
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse hover:shadow-lg transition-all duration-300">
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-12"></div>
                    <div className="h-10 bg-gray-200 rounded-xl w-12"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredCategories.length === 0 ? (
            <Card className="col-span-full bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mb-6">
                  <ChefHat className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-3">
                  {searchQuery ? 'Aucune catégorie trouvée' : 'Créez votre première catégorie'}
                </h3>
                <p className="text-gray-600 text-center mb-8 max-w-md">
                  {searchQuery 
                    ? 'Essayez avec d\'autres mots-clés ou créez une nouvelle catégorie'
                    : 'Commencez par organiser votre menu en créant des catégories comme "Entrées", "Plats principaux", etc.'}
                </p>
                      <Button 
                  onClick={() => setIsCategoryFormOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Créer ma première catégorie
                      </Button>
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-gray-200 rounded-2xl overflow-hidden">
                <div 
                  className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 cursor-pointer relative overflow-hidden group"
                  onClick={() => goToItems(category)}
                >
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Utensils className="h-16 w-16 text-green-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-black text-lg text-gray-900 line-clamp-1">{category.name}</h3>
                    <Badge 
                      variant={category.is_active ? 'default' : 'secondary'}
                      className={category.is_active 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                      }
                    >
                      {category.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                    </div>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                onClick={() => goToItems(category)}
                      className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-700 font-semibold"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditingCategory(category);
                        setIsCategoryFormOpen(true);
                      }}
                      className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteCategory(category)}
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </div>
      ) : (
        // Vue Items avec style dashboard
          <div className="space-y-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded-lg mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredItems.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl flex items-center justify-center mb-6">
                  <Utensils className="h-10 w-10 text-orange-600" />
              </div>
                <h3 className="text-2xl font-black text-gray-800 mb-3">
                  {searchQuery ? 'Aucun plat trouvé' : 'Ajoutez votre premier plat'}
                </h3>
                <p className="text-gray-600 text-center mb-8 max-w-md">
                  {searchQuery 
                    ? 'Essayez avec d\'autres mots-clés ou ajoutez un nouveau plat'
                    : `Commencez par ajouter des plats délicieux à la catégorie "${selectedCategory?.name}"`}
                </p>
                <Button 
                  onClick={() => setIsItemFormOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Ajouter mon premier plat
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-all duration-300 bg-white border-gray-200 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Utensils className="h-10 w-10 text-gray-400" />
                      )}
                    </div>

                        <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-black text-xl text-gray-900">{item.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-xl text-green-600">
                            {item.price.toLocaleString('fr-FR')} FCFA
                          </span>
                          <Badge 
                            variant={item.is_available && !item.out_of_stock ? 'default' : 'secondary'}
                            className={
                              item.out_of_stock 
                                ? 'bg-red-100 text-red-800 border-red-200' 
                                : item.is_available 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }
                          >
                            {item.out_of_stock ? 'Rupture' : item.is_available ? 'Disponible' : 'Indisponible'}
                            </Badge>
                          </div>
                        </div>

                      {item.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                      )}

                      <div className="flex gap-2">
                          <Button 
                          variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingItem(item);
                            setIsItemFormOpen(true);
                            }}
                          className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 font-semibold"
                          >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                          </Button>
                          <Button 
                          variant="outline" 
                            size="sm" 
                          onClick={() => handleToggleStock(item)}
                          className={
                            item.out_of_stock 
                              ? 'hover:bg-green-50 hover:border-green-200 hover:text-green-700'
                              : 'hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700'
                          }
                        >
                          {item.out_of_stock ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Remettre
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Rupture
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                          className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal Catégorie avec FileUpload */}
      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingCategory ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie pour organiser votre menu'}
            </DialogDescription>
          </DialogHeader>
          <CategoryFormWithUpload 
            initialData={editingCategory ? {
              name: editingCategory.name,
              description: editingCategory.description || '',
            } : undefined}
            onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
            onCancel={() => {
              setIsCategoryFormOpen(false);
              setEditingCategory(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Item avec FileUpload */}
      <Dialog open={isItemFormOpen} onOpenChange={setIsItemFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {editingItem ? 'Modifier le plat' : 'Nouveau plat'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editingItem ? 'Modifiez les informations du plat' : 'Ajoutez un nouveau plat délicieux à votre menu'}
            </DialogDescription>
          </DialogHeader>
          <ItemFormWithUpload 
            categories={categories}
            selectedCategoryId={selectedCategory?.id}
            initialData={editingItem ? {
              name: editingItem.name,
              description: editingItem.description || '',
              price: editingItem.price,
              category_id: editingItem.category_id
            } : undefined}
            onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
            onCancel={() => {
              setIsItemFormOpen(false);
          setEditingItem(null);
        }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant de formulaire catégorie avec upload
function CategoryFormWithUpload({ 
  initialData, 
  onSubmit, 
  onCancel 
}: {
  initialData?: Omit<CategoryFormData, 'image_file'>;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || { name: '', description: '' }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit({
      ...formData,
      image_file: imageFile || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Nom de la catégorie *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Entrées, Plats principaux, Desserts..."
          className="text-lg py-3 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Décrivez cette catégorie..."
          className="text-lg py-3 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Image de la catégorie</label>
        <FileUpload
          onFileSelect={(file) => setImageFile(file)}
          accept="image/*"
          placeholder="Glissez-déposez une image ou cliquez pour sélectionner"
          className="rounded-xl"
        />
      </div>
      
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 py-3 rounded-xl">
          Annuler
        </Button>
        <Button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
          {initialData ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}

// Composant de formulaire item avec upload
function ItemFormWithUpload({ 
  categories,
  selectedCategoryId,
  initialData, 
  onSubmit, 
  onCancel 
}: {
  categories: Category[];
  selectedCategoryId?: string;
  initialData?: Omit<ItemFormData, 'image_file'>;
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ItemFormData>(
    initialData || { 
      name: '', 
      description: '', 
      price: 0, 
      category_id: selectedCategoryId || categories[0]?.id || ''
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) return;
    onSubmit({
      ...formData,
      image_file: imageFile || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Nom du plat *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Thieboudienne, Yassa poulet, Pastels..."
          className="text-lg py-3 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
          required
      />
    </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Décrivez ce délicieux plat..."
          className="text-lg py-3 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Prix (FCFA) *</label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          placeholder="2500"
          min="0"
          className="text-lg py-3 rounded-xl border-gray-300 focus:border-green-500 focus:ring-green-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Catégorie *</label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
          className="w-full p-3 text-lg border border-gray-300 rounded-xl focus:border-green-500 focus:ring-green-500"
          required
        >
          <option value="">Choisir une catégorie</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Photo du plat</label>
        <FileUpload
          onFileSelect={(file) => setImageFile(file)}
          accept="image/*"
          placeholder="Ajoutez une photo appétissante de votre plat"
          className="rounded-xl"
      />
    </div>
      
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 py-3 rounded-xl">
          Annuler
        </Button>
        <Button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
          {initialData ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}

const MenusPage = dynamic(async () => MenusPageInner, { ssr: false });
export default MenusPage;
