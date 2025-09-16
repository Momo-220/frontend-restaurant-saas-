"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Phone,
  User,
  MessageCircle,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { ManualPaymentModal } from "@/components/payments/ManualPaymentModal";

// Types pour le panier
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Types pour la commande
interface OrderInfo {
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  notes: string;
  paymentMethod: 'cash' | 'wave' | 'mynita';
}

export default function CartPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { showSuccess, showError, showInfo } = useGlobalToast();

  // États
  const [restaurant, setRestaurant] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    customerName: '',
    customerPhone: '',
    tableNumber: '',
    notes: '',
    paymentMethod: 'cash'
  });
  
  // États pour le paiement manuel
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [restaurantPaymentInfo, setRestaurantPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données
  useEffect(() => {
    const mockRestaurant = {
      name: "Restaurant", // Sera remplacé par les vraies données
      slug: slug
    };

    setRestaurant(mockRestaurant);
    setLoading(false);
  }, [slug]);

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

  // Rediriger vers le menu si le panier est vide après chargement
  useEffect(() => {
    if (cartLoaded && cart.length === 0 && !loading) {
      // Vérifier si l'utilisateur vient d'une page de succès (via document.referrer)
      const comesFromSuccess = document.referrer.includes('/order-success');
      
      if (comesFromSuccess) {
        // Si l'utilisateur vient d'une page de succès, rediriger plus rapidement vers le menu
        const timer = setTimeout(() => {
          window.location.href = `/r/${slug}/menu`;
        }, 2000); // 2 secondes
        return () => clearTimeout(timer);
      } else {
        // Sinon, redirection normale après 3 secondes
        const timer = setTimeout(() => {
          window.location.href = `/r/${slug}/menu`;
        }, 3000); // 3 secondes pour laisser le temps de voir le message
        return () => clearTimeout(timer);
      }
    }
  }, [cartLoaded, cart.length, loading, slug]);

  // Fonctions panier
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCart(prev => 
        prev.map(item =>
          item.id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const removeItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculs
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = 0; // Gratuit pour manger sur place
  const total = subtotal + deliveryFee;
  const itemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Charger les informations de paiement du restaurant
  const loadRestaurantPaymentInfo = async () => {
    try {
      // TODO: Appel API réel - pour le moment on simule
      const mockPaymentInfo = {
        restaurant_name: `Restaurant ${slug}`,
        payment_methods: {
          wave: {
            number: "77 123 45 67",
            name: "Restaurant Chez Fatou"
          },
          mynita: {
            number: "78 987 65 43", 
            name: "Restaurant Chez Fatou"
          },
          orange_money: {
            number: "77 555 44 33",
            name: "Restaurant Chez Fatou"
          }
        }
      };
      setRestaurantPaymentInfo(mockPaymentInfo);
    } catch (error) {
      console.error('Erreur chargement infos paiement:', error);
    }
  };

  // Soumettre la commande
  const handleSubmitOrder = async () => {
    if (!orderInfo.customerName || !orderInfo.customerPhone) {
      showError('Informations manquantes', 'Veuillez remplir votre nom et numéro de téléphone');
      return;
    }

    // Si paiement mobile, ouvrir le modal de paiement
    if (orderInfo.paymentMethod !== 'cash') {
      if (!restaurantPaymentInfo) {
        await loadRestaurantPaymentInfo();
      }
      setIsPaymentModalOpen(true);
      return;
    }

    // Si paiement cash, soumettre directement
    await submitOrderToAPI();
  };

  // Soumettre la commande à l'API (après paiement ou pour cash)
  const submitOrderToAPI = async () => {
    setIsSubmitting(true);

    try {
      // TODO: Envoyer la commande à l'API réelle
      const orderId = `order_${Date.now()}`;
      
      console.log('✅ Commande à envoyer à l\'API:', {
        id: orderId,
        customerName: orderInfo.customerName,
        customerPhone: orderInfo.customerPhone,
        tableNumber: orderInfo.tableNumber,
        notes: orderInfo.notes,
        paymentMethod: orderInfo.paymentMethod,
        items: cart,
        total: total
      });

      // Notification de succès
      showSuccess(
        'Commande créée !', 
        `Votre commande #${orderId.slice(-8)} a été envoyée au restaurant.`
      );

      // Simuler un petit délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Vider le panier après succès
      clearCart();
      
      // Rediriger vers une page de confirmation avec l'ID de commande
      window.location.href = `/r/${slug}/order-success?orderId=${orderId}&total=${total}&items=${itemsCount}`;
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError('Erreur de commande', 'Erreur lors de l\'envoi de la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmer le paiement manuel
  const handlePaymentConfirmed = async (transactionRef: string, method: string) => {
    console.log('💰 Paiement confirmé:', { transactionRef, method, total });
    showInfo('Paiement confirmé', 'Votre paiement a été enregistré');
    setIsPaymentModalOpen(false);
    // Soumettre la commande avec les infos de paiement
    await submitOrderToAPI();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
            🛒
          </div>
          <p className="text-gray-600 font-medium">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  // Afficher un message esthétique si le panier est vide
  if (cartLoaded && cart.length === 0) {
    const comesFromSuccess = typeof document !== 'undefined' && document.referrer.includes('/order-success');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className={`w-24 h-24 bg-gradient-to-br rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 ${
            comesFromSuccess 
              ? 'from-green-200 to-green-300 animate-pulse' 
              : 'from-gray-200 to-gray-300 animate-bounce'
          }`}>
            {comesFromSuccess ? '✅' : '🛒'}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {comesFromSuccess ? 'Commande envoyée !' : 'Votre panier est vide'}
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {comesFromSuccess 
              ? 'Votre commande a été transmise au restaurant. Vous pouvez commander à nouveau ou consulter le statut de votre commande.'
              : 'Ajoutez des plats délicieux pour commencer votre commande'
            }
          </p>
          
          <div className="space-y-4">
            <Link href={`/r/${slug}/menu`} className="block">
              <Button className="w-full py-4 text-lg font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                {comesFromSuccess ? 'Commander à nouveau' : 'Voir le menu'}
              </Button>
            </Link>
            
            {comesFromSuccess && (
              <Link href={`/r/${slug}`} className="block">
                <Button variant="outline" className="w-full py-3 text-base font-medium rounded-2xl border-2 hover:bg-gray-50">
                  Retour au restaurant
                </Button>
              </Link>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
              <span>Redirection automatique dans quelques secondes...</span>
            </div>
        </div>
      </div>

      {/* Modal de paiement manuel */}
      {restaurantPaymentInfo && (
        <ManualPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          restaurantName={restaurantPaymentInfo.restaurant_name}
          paymentMethods={restaurantPaymentInfo.payment_methods}
          orderTotal={total}
          orderId={`ORDER_${Date.now()}`}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      )}
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/r/${slug}/menu`}>
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Panier</h1>
                <p className="text-gray-600">{restaurant?.name}</p>
              </div>
            </div>
            
            {cart.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {cart.length === 0 ? (
          // Panier vide
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
              🛒
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">Ajoutez des plats délicieux pour commencer votre commande</p>
            <Link href={`/r/${slug}/menu`}>
              <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl">
                Voir le menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des articles */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Articles ({itemsCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      {/* Image */}
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                        {item.image || '🍽️'}
                      </div>

                      {/* Infos */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-lg font-bold text-green-600">
                          {item.price.toLocaleString()} FCFA
                        </p>
                      </div>

                      {/* Contrôles quantité */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="text-lg font-bold text-gray-900 min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full p-0 bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Informations client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Vos informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <Input
                        placeholder="Votre nom"
                        value={orderInfo.customerName}
                        onChange={(e) => setOrderInfo(prev => ({...prev, customerName: e.target.value}))}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <Input
                        placeholder="77 123 45 67"
                        value={orderInfo.customerPhone}
                        onChange={(e) => setOrderInfo(prev => ({...prev, customerPhone: e.target.value}))}
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de table (optionnel)
                    </label>
                    <Input
                      placeholder="Ex: Table 5"
                      value={orderInfo.tableNumber}
                      onChange={(e) => setOrderInfo(prev => ({...prev, tableNumber: e.target.value}))}
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes pour le restaurant (optionnel)
                    </label>
                      <Textarea
                        placeholder="Allergies, préférences, instructions spéciales..."
                        value={orderInfo.notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrderInfo(prev => ({...prev, notes: e.target.value}))}
                        className="rounded-xl"
                        rows={3}
                      />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Résumé et paiement */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Sous-total ({itemsCount} articles)</span>
                      <span>{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Frais de service</span>
                      <span className="text-green-600 font-medium">Gratuit</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span>{total.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Méthodes de paiement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Mode de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { id: 'cash', label: 'Espèces', icon: '💵' },
                    { id: 'wave', label: 'Wave', icon: '📱' },
                    { id: 'mynita', label: 'MyNita', icon: '💳' }
                  ].map((method) => (
                    <label key={method.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={orderInfo.paymentMethod === method.id}
                        onChange={(e) => setOrderInfo(prev => ({...prev, paymentMethod: e.target.value as any}))}
                        className="text-green-500"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium">{method.label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Bouton commander amélioré */}
              <div className="relative">
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || !orderInfo.customerName || !orderInfo.customerPhone}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-6 rounded-2xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none disabled:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">🛒</span>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold">Passer la commande</span>
                        <span className="text-sm font-medium opacity-90">{total.toLocaleString()} FCFA</span>
                      </div>
                      <span className="text-2xl">✨</span>
                    </div>
                  )}
                </Button>
                
                {/* Effet de brillance */}
                {!isSubmitting && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none rounded-2xl"></div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




