"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ChefHat,
  Utensils,
  Coffee,
  Wine,
  Star,
  Clock,
  DollarSign,
  Image as ImageIcon,
  FolderOpen,
  X,
  Settings,
  Grid3x3,
  List
} from "lucide-react";
import MenuForm, { MenuFormData } from "@/components/menus/menu-form";
// Section form temporairement désactivé
// import SectionForm, { SectionFormData } from "@/components/menus/section-form";
import CategoryForm, { CategoryFormData } from "@/components/menus/category-form";
import ItemForm, { ItemFormData, ItemSupplement } from "@/components/menus/item-form";
import { menuService, type Menu as ApiMenu } from "@/services/menuService";

// Types pour la hiérarchie Menu
interface MenuSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  categories: MenuCategory[];
}

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  backgroundImage?: string;
  order: number;
  sectionId: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  preparationTime?: string;
  isAvailable: boolean;
  categoryId: string;
  supplements?: ItemSupplement[];
}


export default function MenusPage() {
  // États pour la navigation
  const [currentView, setCurrentView] = useState<'sections' | 'categories' | 'items'>('sections');
  const [selectedSection, setSelectedSection] = useState<MenuSection | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  
  // États pour les données
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour les modals
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newSectionData, setNewSectionData] = useState<{ name: string; description: string; icon: string; order: number; isActive: boolean }>({
    name: '',
    description: '',
    icon: '🍽️',
    order: (sections[sections.length - 1]?.order || 0) + 1,
    isActive: true,
  });

  // TODO: Récupérer le tenantId depuis l'authentification
  const getMenuStorageKey = () => {
    // TODO: Utiliser le tenantId depuis le contexte d'authentification
    console.log('🏢 Récupération tenantId depuis auth context - À implémenter');
    return `nomo_menu_api_based`; // Temporaire
  };

  // TODO: Remplacer par sauvegarde en base de données
  const saveMenuToLocal = (menuSections: MenuSection[]) => {
    try {
      // Temporairement désactivé - sera remplacé par appel API
      console.log('Menu à sauvegarder en base:', menuSections);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Données vides - chaque restaurant commence avec une feuille blanche
  const mockSections: MenuSection[] = [];

  // TODO: Remplacer par chargement depuis la base de données
  const loadMenuData = () => {
    setLoading(true);
    
    try {
      // Temporairement, utiliser les données mockées
      const menuData = mockSections;
      
      if (menuData) {
        console.log('Menu chargé (temporaire)');
        setSections(menuData);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Erreur lors du chargement depuis le service:', error);
    }

    // Nouveau restaurant : commencer avec une feuille blanche
    setTimeout(() => {
      const emptyMenuSections: MenuSection[] = [];
      
      setSections(emptyMenuSections);
      saveMenuToLocal(emptyMenuSections);
      setLoading(false);
      
      console.log('✨ Nouveau restaurant : menu vide initialisé');
    }, 500);
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  // Sauvegarder automatiquement à chaque modification
  useEffect(() => {
    if (sections.length > 0) {
      saveMenuToLocal(sections);
    }
  }, [sections]);


  // Navigation functions
  const goToCategories = (section: MenuSection) => {
    setSelectedSection(section);
    setCurrentView('categories');
  };

  const goToItems = (category: MenuCategory) => {
    setSelectedCategory(category);
    setCurrentView('items');
  };

  const goBackToSections = () => {
    setCurrentView('sections');
    setSelectedSection(null);
    setSelectedCategory(null);
  };

  const goBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button 
              onClick={goBackToSections}
              className={`hover:text-green-600 transition-colors ${currentView === 'sections' ? 'text-green-600 font-bold' : ''}`}
            >
              Sections
            </button>
            {selectedSection && (
              <>
                <span>/</span>
                <button 
                  onClick={goBackToCategories}
                  className={`hover:text-green-600 transition-colors ${currentView === 'categories' ? 'text-green-600 font-bold' : ''}`}
                >
                  {selectedSection.name}
                </button>
              </>
            )}
            {selectedCategory && (
              <>
                <span>/</span>
                <span className="text-green-600 font-bold">{selectedCategory.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions selon la vue */}
        <div className="flex gap-4">
          {currentView === 'sections' && (
            <Button 
              onClick={() => setIsCreateSectionOpen(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-8 py-4 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-6 w-6 mr-3" />
              Nouveau Menu
            </Button>
          )}
          
          {currentView === 'categories' && selectedSection && (
            <Button 
              onClick={() => setIsCreateCategoryOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              Nouvelle Catégorie
            </Button>
          )}
          
          {currentView === 'items' && selectedCategory && (
            <Button 
              onClick={() => setIsCreateItemOpen(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
              Nouveau Plat
            </Button>
          )}
        </div>
      </div>

      {/* Titre dynamique */}
      <div>
        <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tight">
          {currentView === 'sections' && 'Gestion Menu'}
          {currentView === 'categories' && `${selectedSection?.name} - Catégories`}
          {currentView === 'items' && `${selectedCategory?.name} - Plats`}
        </h1>
        <p className="text-xl text-gray-600 font-medium max-w-3xl leading-relaxed">
          {currentView === 'sections' && 'Organisez votre menu en sections (Menu Principal, Boissons, Desserts...)'}
          {currentView === 'categories' && 'Créez des catégories avec images d\'arrière-plan pour organiser vos plats'}
          {currentView === 'items' && 'Ajoutez vos plats avec images, descriptions et prix'}
        </p>
      </div>

      {/* Statistiques dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sections</p>
                <p className="text-3xl font-black text-gray-900">{sections.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                <Grid3x3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Catégories</p>
                <p className="text-3xl font-black text-gray-900">
                  {sections.reduce((total, section) => total + section.categories.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Plats</p>
                <p className="text-3xl font-black text-gray-900">
                  {sections.reduce((total, section) => 
                    total + section.categories.reduce((catTotal, category) => 
                      catTotal + category.items.length, 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
                <Utensils className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Statut</p>
                <p className="text-lg font-black text-green-600">Actif</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal selon la vue */}
      {currentView === 'sections' && (
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-gray-900">Sections du Menu</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => (
              <Card 
                key={section.id} 
                className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden hover:scale-105 cursor-pointer"
                onClick={() => goToCategories(section)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={`px-3 py-1 rounded-full text-sm font-bold ${
                      section.isActive 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {section.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Edit section
                        }}
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Delete section
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 group-hover:scale-110 transition-all duration-300">
                      {section.icon}
                    </div>
                    <CardTitle className="text-xl font-black text-gray-900 mb-2">{section.name}</CardTitle>
                    <CardDescription className="text-gray-600 font-medium leading-relaxed">
                      {section.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FolderOpen className="h-4 w-4 text-blue-400" />
                      <span className="font-medium">{section.categories.length} catégories</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Utensils className="h-4 w-4 text-purple-400" />
                      <span className="font-medium">
                        {section.categories.reduce((total, cat) => total + cat.items.length, 0)} plats
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {currentView === 'categories' && selectedSection && (
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-gray-900">
            Catégories - {selectedSection.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedSection.categories.map((category) => (
              <Card 
                key={category.id}
                className="group cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => goToItems(category)}
              >
                <CardContent className="p-0 relative h-48">
                  {/* Background avec dégradé */}
                  <div 
                    className="absolute inset-0 opacity-90"
                    style={{ background: category.backgroundImage }}
                  />
                  
                  {/* Overlay sombre */}
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Edit category
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-2 bg-white/20 backdrop-blur-sm hover:bg-red-500/50 text-white rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Delete category
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Contenu */}
                  <div className="relative h-full flex flex-col justify-end p-6 text-white">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-white/90 text-sm mb-2">{category.description}</p>
                      <p className="text-white/80 text-xs">
                        {category.items.length} plat{category.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {selectedSection.categories.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📂</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune catégorie</h3>
                <p className="text-gray-600">Créez votre première catégorie pour organiser vos plats.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {currentView === 'items' && selectedCategory && (
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-gray-900">
            Plats - {selectedCategory.name}
          </h2>
          
          <div className="space-y-4">
            {selectedCategory.items.map((item) => (
              <Card key={item.id} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    {/* Image du plat - Plus grande comme dans l'aperçu */}
                    <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-2xl overflow-hidden">
                      {item.image && item.image.startsWith('blob:') ? (
                        <div 
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />
                      ) : (
                        <span className="text-6xl">{item.image || "🍽️"}</span>
                      )}
                    </div>

                    {/* Informations du plat */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-black text-gray-900 mb-2">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 font-medium mb-3 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{item.preparationTime || "—"}</span>
                            </div>
                            {item.supplements && item.supplements.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {item.supplements.length} supplément{item.supplements.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                            <Badge className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.isAvailable 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-red-100 text-red-600 border-red-200'
                            }`}>
                              {item.isAvailable ? 'Disponible' : 'Indisponible'}
                            </Badge>
                          </div>
                          <p className="text-2xl font-black text-green-600">
                            {item.price.toLocaleString()} FCFA
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300"
                            onClick={() => {
                              setEditingItem(item);
                              setIsCreateItemOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-2 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all duration-300"
                            onClick={() => {
                              if (!confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) return;
                              
                              // Suppression du plat
                              setSections(prev => prev.map(section => 
                                section.id === selectedSection?.id 
                                  ? {
                                      ...section,
                                      categories: section.categories.map(category =>
                                        category.id === selectedCategory?.id
                                          ? { 
                                              ...category, 
                                              items: category.items.filter(i => i.id !== item.id)
                                            }
                                          : category
                                      )
                                    }
                                  : section
                              ));
                              
                              // Mise à jour de selectedCategory
                              setSelectedCategory(prev => prev ? {
                                ...prev,
                                items: prev.items.filter(i => i.id !== item.id)
                              } : null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {selectedCategory.items.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun plat</h3>
                <p className="text-gray-600">Ajoutez votre premier plat à cette catégorie.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nouveau Menu minimal intégré */}
      {isCreateSectionOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white/95 rounded-2xl shadow-2xl border-0 p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-4">Nouveau Menu</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Nom</label>
                <input
                  type="text"
                  value={newSectionData.name}
                  onChange={(e) => setNewSectionData({ ...newSectionData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  placeholder="Ex: Petit Déjeuner"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Description</label>
                <textarea
                  value={newSectionData.description}
                  onChange={(e) => setNewSectionData({ ...newSectionData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  rows={3}
                  placeholder="Description du menu"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" className="rounded-2xl" onClick={() => setIsCreateSectionOpen(false)}>Annuler</Button>
                <Button
                  className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  onClick={() => {
                    if (!newSectionData.name.trim()) return;
                    const newSection: MenuSection = {
                      id: `section-${Date.now()}`,
                      name: newSectionData.name.trim(),
                      description: newSectionData.description.trim(),
                      icon: '🍽️',
                      order: (sections[sections.length - 1]?.order || 0) + 1,
                      isActive: true,
                      categories: [],
                    };
                    setSections(prev => [...prev, newSection].sort((a, b) => a.order - b.order));
                    setIsCreateSectionOpen(false);
                    setNewSectionData({ name: '', description: '', icon: '🍽️', order: (sections[sections.length - 1]?.order || 0) + 1, isActive: true });
                  }}
                >
                  Créer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CategoryForm
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        onSubmit={(data: CategoryFormData) => {
          if (!selectedSection) return;
          
          // TODO: Intégrer avec l'API
          const newCategory: MenuCategory = {
            id: `category-${Date.now()}`,
            name: data.name,
            description: data.description,
            backgroundImage: data.backgroundImageFile ? 
              URL.createObjectURL(data.backgroundImageFile) : 
              data.backgroundImage,
            order: data.order,
            sectionId: selectedSection.id,
            items: []
          };
          
          setSections(prev => prev.map(section => 
            section.id === selectedSection.id 
              ? { ...section, categories: [...section.categories, newCategory].sort((a, b) => a.order - b.order) }
              : section
          ));
          
          // Mettre à jour selectedSection
          setSelectedSection(prev => prev ? {
            ...prev,
            categories: [...prev.categories, newCategory].sort((a, b) => a.order - b.order)
          } : null);
          
          setIsCreateCategoryOpen(false);
        }}
        mode="create"
        sectionName={selectedSection?.name || ''}
      />

      <ItemForm
        isOpen={isCreateItemOpen}
        onClose={() => {
          setIsCreateItemOpen(false);
          setEditingItem(null);
        }}
        onSubmit={(data: ItemFormData) => {
          if (!selectedCategory) return;
          
          if (editingItem) {
            // MODE ÉDITION - Modifier l'item existant
            const updatedItem: MenuItem = {
              ...editingItem,
              name: data.name,
              description: data.description,
              price: data.price,
              image: data.imageFile ? URL.createObjectURL(data.imageFile) : data.image,
              preparationTime: data.preparationTime,
              isAvailable: data.isAvailable,
              supplements: data.supplements
            };
            
            console.log('Plat modifié:', updatedItem);
            
            // Mise à jour des sections
            setSections(prev => prev.map(section => 
              section.id === selectedSection?.id 
                ? {
                    ...section,
                    categories: section.categories.map(category =>
                      category.id === selectedCategory.id
                        ? { 
                            ...category, 
                            items: category.items.map(item => 
                              item.id === editingItem.id ? updatedItem : item
                            )
                          }
                        : category
                    )
                  }
                : section
            ));
            
            // Mise à jour de selectedCategory
            setSelectedCategory(prev => prev ? {
              ...prev,
              items: prev.items.map(item => 
                item.id === editingItem.id ? updatedItem : item
              )
            } : null);
            
          } else {
            // MODE CRÉATION - Créer un nouvel item
            const newItem: MenuItem = {
              id: `item-${Date.now()}`,
              name: data.name,
              description: data.description,
              price: data.price,
              image: data.imageFile ? URL.createObjectURL(data.imageFile) : data.image,
              preparationTime: data.preparationTime,
              isAvailable: data.isAvailable,
              categoryId: selectedCategory.id,
              supplements: data.supplements
            };
            
            console.log('Nouveau plat créé:', newItem);
            
            // Mise à jour des sections
            setSections(prev => prev.map(section => 
              section.id === selectedSection?.id 
                ? {
                    ...section,
                    categories: section.categories.map(category =>
                      category.id === selectedCategory.id
                        ? { ...category, items: [...category.items, newItem] }
                        : category
                    )
                  }
                : section
            ));
            
            // Mise à jour de selectedCategory
            setSelectedCategory(prev => prev ? {
              ...prev,
              items: [...prev.items, newItem]
            } : null);
          }
          
          setIsCreateItemOpen(false);
          setEditingItem(null);
        }}
        mode={editingItem ? 'edit' : 'create'}
        initialData={editingItem ? {
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          image: editingItem.image,
          preparationTime: editingItem.preparationTime,
          isAvailable: editingItem.isAvailable,
          supplements: editingItem.supplements || []
        } : undefined}
        categoryName={selectedCategory?.name || ''}
        sectionName={selectedSection?.name || ''}
      />
    </div>
  );
}






