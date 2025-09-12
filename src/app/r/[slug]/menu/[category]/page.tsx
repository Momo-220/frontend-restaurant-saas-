"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  Clock
} from "lucide-react";
import Link from "next/link";
// import { menuSyncService } from "@/services/menuSyncService"; // Service supprimé
import NoSSR from "@/components/ui/no-ssr";

// Types pour le panier
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Types pour les plats
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  weight?: string;
  image: string;
  rating?: number;
  preparationTime?: string;
  isAvailable: boolean;
  originalPrice?: number; // Pour les promotions
}

export default function CategoryMenuPage() {
  const params = useParams();
  const slug = params.slug as string;
  const categoryId = params.category as string;

  // États
  const [restaurant, setRestaurant] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger les données avec synchronisation
  useEffect(() => {
    const mockRestaurant = {
      name: "Restaurant", // Nom générique - sera remplacé par les vraies données
      slug: slug
    };

    // Charger les données depuis le service de synchronisation
    try {
      // Mapper le slug vers l'ID restaurant (pour l'instant on utilise "default" comme dans le dashboard)
      const restaurantId = "default"; // TODO: mapper slug vers vrai tenantId
      // TODO: Charger depuis l'API
      const syncedCategories: any[] = []; // Vide pour un nouveau restaurant
      const foundCategory = syncedCategories.find(cat => cat.id === categoryId);
      
      if (foundCategory) {
        console.log('Catégorie chargée depuis le dashboard:', foundCategory);
        setCategory(foundCategory);
        setMenuItems(foundCategory.items || []);
      } else {
        // Données par défaut si aucune donnée synchronisée trouvée
        console.log('Utilisation des données par défaut pour la catégorie:', categoryId);
        setCategory(null);
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la catégorie synchronisée:', error);
      setCategory(null);
      setMenuItems([]);
    }

    setRestaurant(mockRestaurant);
    setLoading(false);

    // Écouter les mises à jour en temps réel
    // TODO: Écouter les mises à jour via WebSocket ou polling
    const unsubscribe = () => {}; // Temporaire

    return unsubscribe;
  }, [slug, categoryId]);

  // TODO: Charger le panier depuis l'API utilisateur
  useEffect(() => {
    // Pour l'instant, panier vide par défaut
    // TODO: Appel API pour récupérer le panier utilisateur
    console.log('🛒 Chargement panier depuis API - À implémenter');
    setCartLoaded(true);
  }, [slug]);

  // TODO: Sauvegarder le panier dans l'API utilisateur
  useEffect(() => {
    if (cartLoaded && cart.length > 0) {
      // TODO: Appel API pour sauvegarder le panier
      console.log('💾 Sauvegarde panier vers API - À implémenter:', cart);
    }
  }, [cart, slug, cartLoaded]);

  // Fonctions panier
  const addToCart = (menu: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) {
        return prev.map(item =>
          item.id === menu.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          id: menu.id,
          name: menu.name,
          price: menu.price,
          quantity: 1,
          image: menu.image
        }];
      }
    });
  };

  const removeFromCart = (menuId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === menuId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.id === menuId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter(item => item.id !== menuId);
      }
    });
  };

  const getItemQuantity = (menuId: string) => {
    const item = cart.find(item => item.id === menuId);
    return item ? item.quantity : 0;
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
            🍽️
          </div>
          <p className="text-gray-600 font-medium">Chargement des plats...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Catégorie non trouvée</h1>
          <p className="text-gray-600 mb-4">Cette catégorie n'existe pas ou n'est plus disponible.</p>
          <Link href={`/r/${slug}/menu`}>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              Retour au menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header avec bannière de catégorie */}
      <div className="relative h-48 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ background: category.backgroundImage }}
        />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="relative h-full flex flex-col">
          {/* Navigation */}
          <div className="flex items-center justify-between p-4">
            <Link href={`/r/${slug}/menu`}>
              <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            
            <NoSSR>
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
            </NoSSR>
          </div>

          {/* Titre de catégorie */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
              <p className="text-white/90">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des plats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {menuItems.map((item) => {
            const quantity = getItemQuantity(item.id);
            
            return (
              <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-2xl hover:scale-[1.02]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Image du plat */}
                    <div className="w-28 h-28 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
                      {item.image}
                    </div>

                    {/* Informations du plat */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                          
                          {item.weight && (
                            <p className="text-sm text-gray-500 mb-2">{item.weight}</p>
                          )}
                          
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="flex items-center gap-4 mb-3">
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                              </div>
                            )}
                            {item.preparationTime && (
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-400">⏱️</span>
                                <span className="text-sm text-gray-600">{item.preparationTime}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold text-gray-900">
                              {item.price.toLocaleString()} FCFA
                            </p>
                            {item.originalPrice && (
                              <p className="text-sm text-gray-500 line-through">
                                {item.originalPrice.toLocaleString()} FCFA
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Contrôles quantité */}
                        <div className="flex flex-col items-end gap-3">
                          <NoSSR>
                            {quantity === 0 ? (
                              <Button
                                onClick={() => addToCart(item)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium"
                                disabled={!item.isAvailable}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-8 h-8 rounded-full p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-lg font-bold text-gray-900 min-w-[30px] text-center">
                                  {quantity}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  className="w-8 h-8 rounded-full p-0 bg-green-500 hover:bg-green-600 text-white"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </NoSSR>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {menuItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun plat disponible</h3>
              <p className="text-gray-600">Cette catégorie ne contient pas encore de plats.</p>
            </div>
          )}
        </div>
      </div>

      {/* Panier flottant */}
      <NoSSR>
        {cartItemsCount > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <Link href={`/r/${slug}/cart`}>
              <Card className="bg-green-500 border-0 shadow-2xl rounded-3xl cursor-pointer hover:bg-green-600 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold">{cartItemsCount} article{cartItemsCount > 1 ? 's' : ''}</p>
                        <p className="text-sm opacity-90">Voir le panier</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{cartTotal.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </NoSSR>

      {/* Footer */}
      <div className="text-center py-8 text-gray-500 border-t border-gray-200 mt-12">
        <p>Propulsé par <span className="font-bold text-green-600">NOMO</span></p>
      </div>
    </div>
  );
}




