"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  CreditCard,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Phone,
  User,
  Calendar,
  RefreshCw,
  Eye,
  RotateCcw,
  Activity
} from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { paymentsService, type Payment, type PaymentFilters, type PaymentStats } from "@/services/paymentsService";
import { useAuth } from "@/services/authService";
import dynamic from "next/dynamic";

function PaymentsPageInner() {
  const { user, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useGlobalToast();

  // États pour les données
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    averageTransaction: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    paymentMethodBreakdown: {
      CASH: 0,
      CARD: 0,
      WAVE: 0,
      MYNITA: 0,
    },
  });

  // Charger les paiements
  const loadPayments = async (filters?: PaymentFilters) => {
    if (authLoading || !user) return;
    
    setLoading(true);
    try {
      const data = await paymentsService.getPayments(filters);
      // S'assurer que data est un tableau
      setPayments(Array.isArray(data) ? data : []);
      console.log('✅ Paiements chargés:', Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error('❌ Erreur chargement paiements:', error);
      showError('Erreur', 'Impossible de charger les paiements');
      // En cas d'erreur, s'assurer que payments reste un tableau vide
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    if (authLoading || !user) return;
    
    try {
      const data = await paymentsService.getPaymentStats();
      // S'assurer que data est un objet valide
      if (data && typeof data === 'object') {
        setStats(data);
        console.log('✅ Statistiques paiements chargées:', data);
      } else {
        console.warn('⚠️ Données de statistiques invalides:', data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement statistiques:', error);
      // Garder les statistiques par défaut en cas d'erreur
    }
  };

  // Effet initial
  useEffect(() => {
    if (!authLoading && user && !loading) {
      // Charger les données seulement si l'utilisateur est connecté et a un tenant
      if (user.tenant?.id) {
        loadPayments();
        loadStats();
      }
    }
  }, [authLoading, user]);

  // Effet pour les filtres
  useEffect(() => {
    if (!authLoading && user && user.tenant?.id) {
      const filters: PaymentFilters = {};
      
      if (statusFilter) filters.status = statusFilter;
      if (methodFilter) filters.method = methodFilter;
      if (searchQuery) filters.transaction_id = searchQuery;
      
      loadPayments(filters);
    }
  }, [searchQuery, statusFilter, methodFilter, authLoading, user]);

  // Rembourser un paiement
  const handleRefund = async (paymentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rembourser ce paiement ?')) return;
    
    try {
      const updatedPayment = await paymentsService.refundPayment(paymentId, 'Remboursement demandé par le restaurant');
      
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId ? updatedPayment : payment
      ));
      
      showSuccess('Succès', 'Paiement remboursé');
      loadStats();
    } catch (error: any) {
      console.error('❌ Erreur remboursement:', error);
      showError('Erreur', error.message || 'Impossible de rembourser le paiement');
    }
  };

  // Filtrer les paiements selon la recherche
  const filteredPayments = (payments || []).filter(payment => 
    payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.order?.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.order?.customer_phone.includes(searchQuery) ||
    payment.order?.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helpers pour l'affichage
  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Payment['status']) => {
    switch (status) {
      case 'SUCCESS': return 'Réussi';
      case 'PENDING': return 'En attente';
      case 'FAILED': return 'Échoué';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'FAILED': return <XCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'CASH': return <DollarSign className="h-4 w-4" />;
      case 'CARD': return <CreditCard className="h-4 w-4" />;
      case 'WAVE': return <Smartphone className="h-4 w-4" />;
      case 'MYNITA': return <Phone className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: Payment['method']) => {
    switch (method) {
      case 'CASH': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CARD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WAVE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MYNITA': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-3">Connexion requise</h3>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour voir les paiements</p>
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
            Mes Paiements
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 font-medium max-w-2xl leading-relaxed">
            Suivez vos revenus et transactions - Gérez vos finances avec style
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <Button 
            onClick={() => {
              loadPayments();
              loadStats();
            }}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Actualisation...' : 'Actualiser'}</span>
          </Button>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full mr-2 md:mr-3 animate-pulse"></div>
            Système actif
          </Badge>
        </div>
      </div>

      {/* Cartes de statistiques ultra-modernes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Revenus Total */}
        <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
            <CardTitle className="text-sm md:text-base font-bold text-gray-900">
              Revenus Total
            </CardTitle>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-3">{stats.totalRevenue.toLocaleString('fr-FR')}</div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 bg-green-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                <span className="text-xs md:text-sm font-bold text-green-700">FCFA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
            <CardTitle className="text-sm md:text-base font-bold text-gray-900">
              Transactions
            </CardTitle>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Activity className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-3">{stats.totalTransactions}</div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 bg-blue-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                <span className="text-xs md:text-sm font-bold text-blue-700">Total traitées</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* En attente */}
        <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
            <CardTitle className="text-sm md:text-base font-bold text-gray-900">
              En attente
            </CardTitle>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-3">{stats.pendingTransactions}</div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 bg-yellow-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                <span className="text-xs md:text-sm font-bold text-yellow-700">En cours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par méthode de paiement */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 md:pb-8">
          <CardTitle className="text-gray-900 text-lg md:text-xl lg:text-2xl font-black flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            Répartition par méthode
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm md:text-base lg:text-lg font-medium">
            Analyse des modes de paiement utilisés par vos clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <DollarSign className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="font-black text-2xl text-gray-900">{stats.paymentMethodBreakdown.CASH.toLocaleString('fr-FR')} F</p>
              <p className="text-sm text-gray-600">Espèces</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-black text-2xl text-blue-900">{stats.paymentMethodBreakdown.CARD.toLocaleString('fr-FR')} F</p>
              <p className="text-sm text-blue-600">Carte</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Smartphone className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-black text-2xl text-purple-900">{stats.paymentMethodBreakdown.WAVE.toLocaleString('fr-FR')} F</p>
              <p className="text-sm text-purple-600">Wave</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Phone className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="font-black text-2xl text-orange-900">{stats.paymentMethodBreakdown.MYNITA.toLocaleString('fr-FR')} F</p>
              <p className="text-sm text-orange-600">MyNita</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres et recherche */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="🔍 Rechercher par transaction, commande ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-lg border-gray-300 rounded-xl focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 text-lg border border-gray-300 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="SUCCESS">Réussi</option>
              <option value="PENDING">En attente</option>
              <option value="FAILED">Échoué</option>
              <option value="CANCELLED">Annulé</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-3 text-lg border border-gray-300 rounded-xl focus:border-green-500 focus:ring-green-500 bg-white"
            >
              <option value="">Toutes les méthodes</option>
              <option value="CASH">Espèces</option>
              <option value="CARD">Carte</option>
              <option value="WAVE">Wave</option>
              <option value="MYNITA">MyNita</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des paiements */}
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
        ) : filteredPayments.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mb-6">
                <CreditCard className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3">
                {searchQuery || statusFilter || methodFilter ? 'Aucun paiement trouvé' : 'Aucun paiement'}
              </h3>
              <p className="text-gray-600 text-center mb-8 max-w-md">
                {searchQuery || statusFilter || methodFilter
                  ? 'Essayez avec d\'autres critères de recherche'
                  : 'Les paiements apparaîtront ici après les premières commandes'}
              </p>
              {(searchQuery || statusFilter || methodFilter) && (
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setMethodFilter('');
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-2xl"
                >
                  Effacer les filtres
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-lg transition-all duration-300 bg-white border-gray-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Icône de méthode */}
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    {getMethodIcon(payment.method)}
                  </div>
                  
                  <div className="flex-1">
                    {/* En-tête de paiement */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-black text-xl text-gray-900">
                          {payment.transaction_id || `Paiement ${payment.id.slice(-8)}`}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          {payment.order && (
                            <>
                              <span className="flex items-center gap-1 text-gray-600">
                                <User className="h-4 w-4" />
                                {payment.order.customer_name}
                              </span>
                              <span className="text-gray-600">#{payment.order.order_number}</span>
                            </>
                          )}
                          <span className="text-gray-500">
                            {new Date(payment.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getStatusColor(payment.status)} font-semibold`}>
                            {getStatusIcon(payment.status)}
                            <span className="ml-1">{getStatusLabel(payment.status)}</span>
                          </Badge>
                          <Badge className={`${getMethodColor(payment.method)} font-semibold`}>
                            {getMethodIcon(payment.method)}
                            <span className="ml-1">{payment.method}</span>
                          </Badge>
                        </div>
                        <p className="font-black text-xl text-green-600">
                          {payment.amount.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {payment.status === 'SUCCESS' && (
                        <Button
                          onClick={() => handleRefund(payment.id)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-50 hover:border-red-200 hover:text-red-700 font-semibold"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Rembourser
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 font-semibold"
                        onClick={() => console.log('Voir détails:', payment.id)}
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

const PaymentsPage = dynamic(async () => PaymentsPageInner, { ssr: false });
export default PaymentsPage;
