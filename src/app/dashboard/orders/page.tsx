"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Clock,
  ShoppingCart,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Phone,
  User,
  Calendar,
  DollarSign,
  Filter,
  RefreshCw,
  Eye,
  Activity,
  TrendingUp
} from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { ordersService, type Order, type OrderFilters } from "@/services/ordersService";
import { useAuth } from "@/services/authService";
import RealTimeOrders from "@/components/orders/RealTimeOrders";
import dynamic from "next/dynamic";

function OrdersPageInner() {
  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useGlobalToast();

  // États pour les données
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });

  // Charger les commandes
  const loadOrders = async (filters?: OrderFilters) => {
    if (authLoading || !user) return;
    
    setLoading(true);
    try {
      const data = await ordersService.getOrders(filters);
      setOrders(data);
      console.log('✅ Commandes chargées:', data.length);
    } catch (error) {
      console.error('❌ Erreur chargement commandes:', error);
      showError('Erreur', 'Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    if (authLoading || !user) return;
    
    try {
      const data = await ordersService.getOrderStats();
      setStats(data);
      console.log('✅ Statistiques chargées:', data);
    } catch (error) {
      console.error('❌ Erreur chargement statistiques:', error);
    }
  };

  // Handlers pour WebSocket
  const handleNewOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    loadStats(); // Recharger les stats
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    loadStats(); // Recharger les stats
  };

  // Effet initial
  useEffect(() => {
    if (!authLoading && user) {
      loadOrders();
      loadStats();
    }
  }, [authLoading, user]);

  // Effet pour les filtres
  useEffect(() => {
    if (!authLoading && user) {
      const filters: OrderFilters = {};
      
      if (statusFilter) filters.status = statusFilter;
      if (searchQuery) filters.customer_phone = searchQuery;
      
      loadOrders(filters);
    }
  }, [searchQuery, statusFilter, authLoading, user]);

  // Mettre à jour le statut d'une commande
  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updatedOrder = await ordersService.updateOrderStatus(orderId, { 
        status: newStatus 
      });
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      showSuccess('Succès', `Commande mise à jour : ${getStatusLabel(newStatus)}`);
      
      // Recharger les stats
      loadStats();
    } catch (error: any) {
      console.error('❌ Erreur mise à jour commande:', error);
      showError('Erreur', error.message || 'Impossible de mettre à jour la commande');
    }
  };

  // Annuler une commande
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;
    
    try {
      const updatedOrder = await ordersService.cancelOrder(orderId, 'Annulée par le restaurant');
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      showSuccess('Succès', 'Commande annulée');
      loadStats();
    } catch (error: any) {
      console.error('❌ Erreur annulation commande:', error);
      showError('Erreur', error.message || 'Impossible d\'annuler la commande');
    }
  };

  // Filtrer les commandes selon la recherche
  const filteredOrders = orders.filter(order => 
    order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_phone.includes(searchQuery) ||
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helpers pour l'affichage
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'READY': return 'bg-green-100 text-green-800 border-green-200';
      case 'DELIVERED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'ACCEPTED': return 'Acceptée';
      case 'PREPARING': return 'En préparation';
      case 'READY': return 'Prête';
      case 'DELIVERED': return 'Livrée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />;
      case 'PREPARING': return <ChefHat className="h-4 w-4" />;
      case 'READY': return <ShoppingCart className="h-4 w-4" />;
      case 'DELIVERED': return <Truck className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'PENDING': return 'ACCEPTED';
      case 'ACCEPTED': return 'PREPARING';
      case 'PREPARING': return 'READY';
      case 'READY': return 'DELIVERED';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: Order['status']): string => {
    const next = getNextStatus(currentStatus);
    return next ? getStatusLabel(next) : '';
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-3">Connexion requise</h3>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour voir les commandes</p>
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
    <div className="space-y-8">
      {/* En-tête avec style dashboard */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Mes Commandes</h1>
              <p className="text-gray-600 font-medium">Gérez vos commandes en temps réel</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => {
            loadOrders();
            loadStats();
          }}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-semibold text-sm">Total</p>
                <p className="text-3xl font-black text-blue-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-semibold text-sm">Aujourd'hui</p>
                <p className="text-3xl font-black text-green-900">{stats.todayOrders}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 font-semibold text-sm">En attente</p>
                <p className="text-3xl font-black text-yellow-900">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-semibold text-sm">Terminées</p>
                <p className="text-3xl font-black text-purple-900">{stats.completedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 font-semibold text-sm">Revenus</p>
                <p className="text-2xl font-black text-emerald-900">{stats.totalRevenue.toLocaleString('fr-FR')}F</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 font-semibold text-sm">Panier moyen</p>
                <p className="text-2xl font-black text-indigo-900">{stats.averageOrderValue.toLocaleString('fr-FR')}F</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Composant temps réel */}
      <RealTimeOrders 
        onNewOrder={handleNewOrder}
        onOrderUpdate={handleOrderUpdate}
      />

      {/* Filtres et recherche */}
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="🔍 Rechercher par nom, téléphone ou numéro de commande..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-lg border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 text-lg border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500 bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="ACCEPTED">Acceptées</option>
              <option value="PREPARING">En préparation</option>
              <option value="READY">Prêtes</option>
              <option value="DELIVERED">Livrées</option>
              <option value="CANCELLED">Annulées</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded-lg mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredOrders.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6">
                <ShoppingCart className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                {searchQuery || statusFilter ? 'Aucune commande trouvée' : 'Aucune commande'}
              </h3>
              <p className="text-gray-600 text-center mb-8 max-w-md">
                {searchQuery || statusFilter 
                  ? 'Essayez avec d\'autres critères de recherche'
                  : 'Les nouvelles commandes apparaîtront ici automatiquement'}
              </p>
              {(searchQuery || statusFilter) && (
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-2xl"
                >
                  Effacer les filtres
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-all duration-300 bg-white border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Icône de statut */}
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    {getStatusIcon(order.status)}
                  </div>
                  
                  <div className="flex-1">
                    {/* En-tête de commande */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-black text-xl text-gray-900">#{order.order_number}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1 text-gray-600">
                            <User className="h-4 w-4" />
                            {order.customer_name}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <Phone className="h-4 w-4" />
                            {order.customer_phone}
                          </span>
                          {order.table_id && (
                            <span className="text-gray-600">Table: {order.table_id}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`${getStatusColor(order.status)} font-semibold`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusLabel(order.status)}</span>
                        </Badge>
                        <p className="font-black text-xl text-green-600 mt-1">
                          {order.total_amount.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Notes :</strong> {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {getNextStatus(order.status) && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status)!)}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {getNextStatusLabel(order.status)}
                        </Button>
                      )}
                      
                      {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        <Button
                          onClick={() => handleCancelOrder(order.id)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-50 hover:border-red-200 hover:text-red-700 font-semibold"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Annuler
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 font-semibold"
                        onClick={() => console.log('Voir détails:', order.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

const OrdersPage = dynamic(async () => OrdersPageInner, { ssr: false });
export default OrdersPage;
