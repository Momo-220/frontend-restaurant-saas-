"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  ArrowLeft,
  Share2
} from "lucide-react";
import Link from "next/link";
// import { useOrderSync, type OrderData } from "@/services/orderSyncService"; // Service supprimé
import { useGlobalToast } from "@/hooks/useGlobalToast";

export default function OrderSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const { showSuccess, showInfo } = useGlobalToast();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [estimatedTime] = useState(() => Math.floor(Math.random() * 20) + 15); // 15-35 minutes
  
  // Hook pour synchronisation avec les commandes
  // TODO: Récupérer depuis l'API
  const orders: any[] = [];
  const updateStatus = (orderId: string, status: string) => {
    console.log('Mise à jour statut commande:', orderId, status);
  };
  
  // Récupérer l'ID de commande depuis l'URL
  const orderId = searchParams.get('orderId');
  const [lastStatus, setLastStatus] = useState<string>('');

  useEffect(() => {
    const mockRestaurant = {
      name: "Restaurant", // Sera remplacé par les vraies données
      slug: slug,
      phone: "+221 77 123 45 67",
      address: "Dakar, Sénégal"
    };

    setRestaurant(mockRestaurant);

    // Plus besoin de manipulation complexe de l'historique
    // La gestion intelligente du panier vide s'occupe du retour
    
    // Trouver la commande correspondante
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // Détecter changement de statut
        if (lastStatus && lastStatus !== order.status) {
          console.log('🔄 Changement de statut détecté:', lastStatus, '→', order.status);
          
          // Notification selon le nouveau statut
          if (order.status === 'preparing') {
            showInfo('🍳 En préparation', 'Votre commande est maintenant en préparation !');
          } else if (order.status === 'ready') {
            showSuccess('✅ Commande prête', 'Vous pouvez venir la récupérer.');
          } else if (order.status === 'delivered') {
            showSuccess('🎉 Bon appétit !', 'Votre commande a été servie.');
          }
        }
        
        setCurrentOrder(order);
        setLastStatus(order.status);
        console.log('✅ Commande trouvée et synchronisée:', order);
      }
    }
  }, [slug, orderId, orders]);

  const shareOrder = async () => {
    const shareData = {
      title: `Commande ${currentOrder?.id || orderId} - ${restaurant?.name}`,
      text: `Ma commande chez ${restaurant?.name} ${
        currentOrder?.status === 'pending' ? 'a été reçue' :
        currentOrder?.status === 'preparing' ? 'est en préparation' :
        currentOrder?.status === 'ready' ? 'est prête' :
        'est en cours'
      } ! Total : ${currentOrder?.total.toLocaleString() || 0} FCFA`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      showSuccess('Lien copié !', 'Le lien a été copié dans le presse-papiers.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Animation de succès */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-green-200 rounded-full animate-ping mx-auto"></div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-600 text-lg">
            Votre commande a été envoyée au restaurant
          </p>
        </div>

        {/* Détails de la commande */}
        <Card className="mb-6 shadow-lg border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium mb-2">
                <span className="text-sm">⏱️</span>
                Temps estimé : {estimatedTime} minutes
              </div>
              <p className="text-2xl font-bold text-gray-900">#{currentOrder?.id || orderId || 'LOADING'}</p>
              <p className="text-gray-600">Numéro de commande</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Restaurant informé</p>
                  <p className="text-sm text-gray-600">Votre commande est en cours de préparation</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  En cours
                </Badge>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Contact restaurant</p>
                  <p className="text-sm text-gray-600">{restaurant?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{restaurant?.name}</p>
                  <p className="text-sm text-gray-600">{restaurant?.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Détails de la commande */}
        {currentOrder && (
          <Card className="mb-6 shadow-lg border-0 rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Détails de votre commande</h3>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Informations client</h4>
                  <p><strong>Nom :</strong> {currentOrder.customerName}</p>
                  <p><strong>Téléphone :</strong> {currentOrder.customerPhone}</p>
                  {currentOrder.tableNumber && <p><strong>Table :</strong> {currentOrder.tableNumber}</p>}
                  {currentOrder.notes && <p><strong>Notes :</strong> {currentOrder.notes}</p>}
                </div>

                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Articles commandés</h4>
                  <div className="space-y-2">
                    {currentOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.image}</span>
                          <span>{item.quantity}x {item.name}</span>
                        </div>
                        <span className="font-semibold">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>{currentOrder.total.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mode de paiement</h4>
                  <p className="capitalize">{currentOrder.paymentMethod === 'cash' ? 'Espèces' : currentOrder.paymentMethod}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étapes de la commande */}
        <Card className="mb-6 shadow-lg border-0 rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Suivi de votre commande</h3>
            
            <div className="space-y-4">
              {/* Étape 1: Commande reçue */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Commande reçue</p>
                  <p className="text-sm text-gray-600">{currentOrder ? new Date(currentOrder.createdAt).toLocaleTimeString() : 'Maintenant'}</p>
                </div>
              </div>

              {/* Étape 2: En préparation */}
              <div className={`flex items-center gap-4 ${currentOrder?.status === 'pending' ? 'opacity-50' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentOrder?.status === 'preparing' || currentOrder?.status === 'ready' || currentOrder?.status === 'delivered'
                    ? 'bg-orange-500' : 'bg-gray-300'
                }`}>
                  <span className={currentOrder?.status === 'preparing' || currentOrder?.status === 'ready' || currentOrder?.status === 'delivered' ? 'text-white' : 'text-gray-600'}>
                    ⏱️
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${currentOrder?.status === 'preparing' || currentOrder?.status === 'ready' || currentOrder?.status === 'delivered' ? 'text-gray-900' : 'text-gray-600'}`}>
                    En préparation
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentOrder?.status === 'preparing' || currentOrder?.status === 'ready' || currentOrder?.status === 'delivered' 
                      ? 'En cours...' : 'En attente de confirmation'}
                  </p>
                </div>
              </div>

              {/* Étape 3: Prête à servir */}
              <div className={`flex items-center gap-4 ${currentOrder?.status !== 'ready' && currentOrder?.status !== 'delivered' ? 'opacity-50' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentOrder?.status === 'ready' || currentOrder?.status === 'delivered'
                    ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <CheckCircle className={`h-5 w-5 ${currentOrder?.status === 'ready' || currentOrder?.status === 'delivered' ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${currentOrder?.status === 'ready' || currentOrder?.status === 'delivered' ? 'text-gray-900' : 'text-gray-600'}`}>
                    Prête à servir
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentOrder?.status === 'ready' ? 'Votre commande est prête !' : 
                     currentOrder?.status === 'delivered' ? 'Commande servie' :
                     `Dans ~${estimatedTime} minutes`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={shareOrder}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl text-lg font-medium"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Partager ma commande
          </Button>

          <Link href={`/r/${slug}/menu`} className="block">
            <Button 
              variant="outline" 
              className="w-full py-4 rounded-2xl text-lg font-medium border-2 hover:bg-gray-50"
            >
              Commander à nouveau
            </Button>
          </Link>

          <Link href={`/r/${slug}`} className="block">
            <Button 
              variant="ghost" 
              className="w-full py-4 rounded-2xl text-lg font-medium text-gray-600 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour au restaurant
            </Button>
          </Link>
        </div>

        {/* Message de remerciement */}
        <div className="text-center mt-8 p-6 bg-white/50 rounded-2xl">
          <p className="text-gray-600 mb-2">
            Merci de votre confiance !
          </p>
          <p className="text-sm text-gray-500">
            Propulsé par <span className="font-bold text-green-600">NOMO</span>
          </p>
        </div>
      </div>
    </div>
  );
}




