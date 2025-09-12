"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  ShoppingCart,
  ArrowRight,
  Info,
  Clock,
  MapPin,
  Phone
} from "lucide-react";
import Link from "next/link";
// import { menuSyncService } from "@/services/menuSyncService"; // Service supprimé
import NoSSR from "@/components/ui/no-ssr";

// Types pour la hiérarchie menu
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
  image: string;
  preparationTime?: string;
  isAvailable: boolean;
  categoryId: string;
}

export default function RestaurantMenuPage() {
  const params = useParams();
  const slug = params.slug as string;

  // États
  const [restaurant, setRestaurant] = useState<any>(null);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<MenuSection | null>(null);
  const [currentView, setCurrentView] = useState<'sections' | 'categories'>('sections');
  const [loading, setLoading] = useState(true);

  // Charger les données restaurant et catégories depuis le service de synchronisation
  useEffect(() => {
    // Données restaurant vides - seront chargées depuis l'API
    const mockRestaurant = {
      name: "Restaurant", // Sera remplacé par les vraies données
      slug: slug,
      address: "", // À charger depuis l'API
      phone: "", // À charger depuis l'API
      isOpen: false, // À charger depuis l'API
      openingHours: "", // À charger depuis l'API
      deliveryFee: 0, // À charger depuis l'API
      minimumOrder: 0, // À charger depuis l'API
      description: "" // À charger depuis l'API
    };

    // Charger les sections depuis le service de synchronisation
    try {
      // Mapper le slug vers l'ID restaurant (pour l'instant on utilise "default" comme dans le dashboard)
      const restaurantId = "default"; // TODO: mapper slug vers vrai tenantId
      // TODO: Charger depuis l'API
      const menuData: any = null; // Sera remplacé par l'API
      
      if (menuData && menuData.sections && menuData.sections.length > 0) {
        console.log('Sections chargées depuis le dashboard:', menuData.sections);
        const activeSections = menuData.sections.filter((section: MenuSection) => section.isActive);
        setSections(activeSections);
        // Sélectionner automatiquement la première section
        if (activeSections.length > 0) {
          setSelectedSection(activeSections[0]);
        }
      } else {
        // Nouveau restaurant : menu complètement vide
        const emptySections: MenuSection[] = [];
        setSections(emptySections);
        // Aucune section à sélectionner pour un nouveau restaurant
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sections synchronisées:', error);
      // Utiliser les données par défaut en cas d'erreur
      setSections([]);
    }

    setRestaurant(mockRestaurant);
    setLoading(false);

    // Écouter les mises à jour en temps réel
    // TODO: Écouter les mises à jour via WebSocket ou polling
    const unsubscribe = () => {}; // Temporaire
    /*
    const unsubscribe = menuSyncService.onMenuUpdate((menuData) => {
      console.log('Mise à jour du menu détectée côté client');
      // Vérifier que c'est bien pour ce restaurant
      if (menuData && menuData.sections && menuData.restaurantId === restaurantId) {
        const activeSections = menuData.sections.filter((section: MenuSection) => section.isActive);
        setSections(activeSections);
        // Sélectionner automatiquement la première section
        if (activeSections.length > 0 && !selectedSection) {
          setSelectedSection(activeSections[0]);
        }
      }
    });
    */

    return unsubscribe;
  }, [slug]);

  // Fonctions de navigation
  const goToCategories = (section: MenuSection) => {
    setSelectedSection(section);
    setCurrentView('categories');
  };

  const goBackToSections = () => {
    setSelectedSection(null);
    setCurrentView('sections');
  };

  // TODO: Récupérer le nombre d'articles dans le panier depuis l'API
  const getCartItemsCount = () => {
    // TODO: Appel API pour récupérer le nombre d'articles dans le panier utilisateur
    console.log('🛒 Récupération nombre articles panier depuis API - À implémenter');
    return 0; // Temporaire
  };

  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    setCartItemsCount(getCartItemsCount());
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
            🍽️
          </div>
          <p className="text-gray-600 font-medium">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Bannière Restaurant */}
      <div className="relative h-64 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        </div>
        
        {/* Navigation */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20 p-2"
            onClick={() => currentView === 'categories' ? goBackToSections() : window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {cartItemsCount > 0 && (
            <Link href={`/r/${slug}/cart`}>
              <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 relative">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Panier
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </Badge>
              </Button>
            </Link>
          )}
        </div>

        {/* Titre Restaurant */}
        <div className="relative z-10 text-center text-white px-4 mt-8">
          <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{restaurant?.name}</h1>
          <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{restaurant?.openingHours}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{restaurant?.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations Restaurant */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <MapPin className="h-4 w-4" />
              <span>{restaurant?.address}</span>
            </div>
            
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
              {restaurant?.description}
            </p>
          </div>

          {/* Informations de commande */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600 bg-gray-50 rounded-2xl p-4">
            <div className="text-center">
              <p className="font-semibold text-gray-900">Commande minimum</p>
              <p>{restaurant?.minimumOrder.toLocaleString()} FCFA</p>
            </div>
            <div className="w-px h-8 bg-gray-300" />
            <div className="text-center">
              <p className="font-semibold text-gray-900">Frais de livraison</p>
              <p>{restaurant?.deliveryFee.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Sections en bulles horizontales */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Menu</h2>
          
          {/* Bulles de sections */}
          <NoSSR>
            <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => goToCategories(section)}
                  className={`
                    flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-full border-2 transition-all duration-300
                    ${selectedSection?.id === section.id 
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }
                  `}
                >
                  <span className="text-2xl">{section.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{section.name}</div>
                    <div className={`text-xs ${selectedSection?.id === section.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {section.categories.length} catégorie{section.categories.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </NoSSR>
        </div>

        {/* Catégories de la section sélectionnée */}
        <NoSSR>
          {selectedSection && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSection.name}</h3>
                  <p className="text-gray-600 text-sm">{selectedSection.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSection.categories.map((category) => (
                  <Link key={category.id} href={`/r/${slug}/menu/${category.id}`}>
                    <Card className="group cursor-pointer overflow-hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <CardContent className="p-0 relative h-48">
                        {/* Background avec dégradé */}
                        <div 
                          className="absolute inset-0 opacity-90"
                          style={{ background: category.backgroundImage || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                        />
                        
                        {/* Overlay sombre */}
                        <div className="absolute inset-0 bg-black/20" />
                        
                        {/* Contenu */}
                        <div className="relative h-full flex flex-col justify-between p-6 text-white">
                          <div className="flex items-center justify-between">
                            <ArrowRight className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
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
                  </Link>
                ))}
              </div>
            </div>
          )}
        </NoSSR>

        {/* Message si aucune section sélectionnée */}
        <NoSSR>
          {!selectedSection && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-lg font-medium">Sélectionnez une section pour voir les catégories</p>
              <p className="text-sm">Choisissez parmi nos différentes sections de menu ci-dessus</p>
            </div>
          )}
        </NoSSR>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 border-t border-gray-200 mt-12">
        <p>Propulsé par <span className="font-bold text-green-600">NOMO</span></p>
      </div>
    </div>
  );
}




