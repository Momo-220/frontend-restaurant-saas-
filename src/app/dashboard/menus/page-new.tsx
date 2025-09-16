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
  Star
} from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { categoriesService, type Category, type Item } from "@/services/categoriesService";
import { useAuth } from "@/services/authService";
import dynamic from "next/dynamic";

// Interface pour les formulaires
interface CategoryFormData {
  name: string;
  description: string;
  image_url?: string;
}

interface ItemFormData {
  name: string;
  description: string;
  price: number;
  image_url?: string;
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
      const newCategory = await categoriesService.createCategory({
        name: data.name,
        description: data.description,
        image_url: data.image_url,
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
      const updatedCategory = await categoriesService.updateCategory(editingCategory.id, {
        name: data.name,
        description: data.description,
        image_url: data.image_url,
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
      const newItem = await categoriesService.createItem({
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: data.image_url,
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
      const updatedItem = await categoriesService.updateItem(editingItem.id, {
        name: data.name,
        description: data.description,
        price: data.price,
        image_url: data.image_url,
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {currentView === 'items' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goBackToCategories}
              className="flex items-center gap-2"
            >
              ← Retour
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">
              {currentView === 'categories' ? 'Mes Catégories' : `Plats - ${selectedCategory?.name}`}
            </h1>
            <p className="text-gray-600">
              {currentView === 'categories' 
                ? 'Organisez votre menu par catégories' 
                : 'Gérez les plats de cette catégorie'}
            </p>
          </div>
        </div>
        
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
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {currentView === 'categories' ? 'Nouvelle Catégorie' : 'Nouveau Plat'}
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder={`Rechercher ${currentView === 'categories' ? 'une catégorie' : 'un plat'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contenu principal */}
      {currentView === 'categories' ? (
        // Vue Catégories
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredCategories.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ChefHat className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchQuery ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  {searchQuery 
                    ? 'Essayez avec d\'autres mots-clés'
                    : 'Commencez par créer votre première catégorie de menu'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCategoryFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer ma première catégorie
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div 
                  className="h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-t-lg flex items-center justify-center"
                  onClick={() => goToItems(category)}
                >
                  {category.image_url ? (
                    <img 
                      src={category.image_url} 
                      alt={category.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <Utensils className="h-16 w-16 text-green-600" />
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                      {category.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => goToItems(category)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category);
                        setIsCategoryFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category)}
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
        // Vue Items
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Utensils className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchQuery ? 'Aucun plat trouvé' : 'Aucun plat dans cette catégorie'}
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  {searchQuery 
                    ? 'Essayez avec d\'autres mots-clés'
                    : 'Commencez par ajouter votre premier plat'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsItemFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter mon premier plat
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Utensils className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-600">
                            {item.price.toLocaleString('fr-FR')} FCFA
                          </span>
                          <Badge 
                            variant={item.is_available && !item.out_of_stock ? 'default' : 'secondary'}
                          >
                            {item.out_of_stock ? 'Rupture' : item.is_available ? 'Disponible' : 'Indisponible'}
                          </Badge>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-600 mb-4">{item.description}</p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setIsItemFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStock(item)}
                        >
                          {item.out_of_stock ? (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Remettre
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Rupture
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
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

      {/* Modal Catégorie */}
      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie pour votre menu'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm 
            initialData={editingCategory ? {
              name: editingCategory.name,
              description: editingCategory.description || '',
              image_url: editingCategory.image_url || ''
            } : undefined}
            onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
            onCancel={() => {
              setIsCategoryFormOpen(false);
              setEditingCategory(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Item */}
      <Dialog open={isItemFormOpen} onOpenChange={setIsItemFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifier le plat' : 'Nouveau plat'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Modifiez les informations du plat' : 'Ajoutez un nouveau plat à votre menu'}
            </DialogDescription>
          </DialogHeader>
          <ItemForm 
            categories={categories}
            selectedCategoryId={selectedCategory?.id}
            initialData={editingItem ? {
              name: editingItem.name,
              description: editingItem.description || '',
              price: editingItem.price,
              image_url: editingItem.image_url || '',
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

// Composants de formulaire simples
function CategoryForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: {
  initialData?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || { name: '', description: '', image_url: '' }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Nom *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Entrées, Plats principaux..."
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description de la catégorie"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">URL Image</label>
        <Input
          value={formData.image_url || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
          placeholder="https://..."
          type="url"
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}

function ItemForm({ 
  categories,
  selectedCategoryId,
  initialData, 
  onSubmit, 
  onCancel 
}: {
  categories: Category[];
  selectedCategoryId?: string;
  initialData?: ItemFormData;
  onSubmit: (data: ItemFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<ItemFormData>(
    initialData || { 
      name: '', 
      description: '', 
      price: 0, 
      image_url: '', 
      category_id: selectedCategoryId || categories[0]?.id || ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Nom *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Thieboudienne, Yassa poulet..."
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Description du plat"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Prix (FCFA) *</label>
        <Input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          placeholder="2500"
          min="0"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Catégorie *</label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        >
          <option value="">Choisir une catégorie</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">URL Image</label>
        <Input
          value={formData.image_url || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
          placeholder="https://..."
          type="url"
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}

const MenusPage = dynamic(async () => MenusPageInner, { ssr: false });
export default MenusPage;
