"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Utensils, 
  ShoppingCart, 
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  Activity,
  Clock,
  Star,
  ChefHat,
  DollarSign,
  Calendar,
  Target,
  RefreshCw
} from "lucide-react";
// Service supprimé - à remplacer par API
// import { useCentralSync } from "@/services/centralSyncService";
import { useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

function DashboardPageInner() {
  // Données mockées temporaires (à remplacer par API)
  const orders: any[] = [];
  const payments: any[] = [];
  const orderStats = { total: 0 };
  const paymentStats = { total: 0 };
  const isLoading = false;
  const forceSync = () => console.log('Force sync - à implémenter avec API');

  // Calculer les statistiques en temps réel
  const dashboardStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // Commandes du jour
    const todayOrders = orders.filter(order => order.createdAt >= todayTimestamp);
    
    // Paiements du jour
    const todayPayments = payments.filter(payment => 
      payment.date >= todayTimestamp && payment.status === 'completed'
    );

    // Revenus du jour
    const todayRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Clients uniques
    const uniqueCustomers = new Set(todayOrders.map(order => order.customerPhone));

    // Menus actifs (estimation basée sur les articles commandés)
    const menuItems = new Set();
    todayOrders.forEach((order: any) => {
      order.items.forEach((item: any) => menuItems.add(item.id));
    });

    // Tables occupées (estimation basée sur les commandes en cours)
    const activeTables = new Set(
      orders
        .filter(order => ['pending', 'preparing', 'ready'].includes(order.status))
        .map(order => order.tableNumber)
        .filter(Boolean)
    );

    // Calculs des métriques de performance avancées
    const completedOrders = orders.filter(order => order.status === 'completed');
    const preparationTimes = completedOrders
      .map(order => order.preparationTime || 0)
      .filter(time => time > 0);
    
    const avgPrepTime = preparationTimes.length > 0 
      ? Math.round(preparationTimes.reduce((sum, time) => sum + time, 0) / preparationTimes.length)
      : 0;

    // Calcul satisfaction clients (basé sur les commandes avec rating)
    const ordersWithRating = completedOrders.filter(order => order.rating);
    const avgRating = ordersWithRating.length > 0
      ? ordersWithRating.reduce((sum, order) => sum + (order.rating || 0), 0) / ordersWithRating.length
      : 0;

    // Calcul taux de retour (clients qui ont commandé plusieurs fois)
    const customerOrderCounts = new Map();
    orders.forEach(order => {
      const phone = order.customerPhone;
      if (phone) {
        customerOrderCounts.set(phone, (customerOrderCounts.get(phone) || 0) + 1);
      }
    });
    const returningCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length;
    const returnRate = uniqueCustomers.size > 0 ? Math.round((returningCustomers / uniqueCustomers.size) * 100) : 0;

    // Calcul commandes par heure
    const hoursInOperation = 12; // 12h d'ouverture par jour
    const ordersPerHour = Math.round(todayOrders.length / hoursInOperation) || 0;

    // Fonctions pour déterminer le statut
    const getStatus = (value: number, thresholds: { excellent: number, good: number }) => {
      if (value >= thresholds.excellent) return 'excellent';
      if (value >= thresholds.good) return 'bon';
      return 'normal';
    };

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      uniqueCustomers: uniqueCustomers.size,
      activeMenus: menuItems.size,
      occupiedTables: activeTables.size,
      totalTables: 15, // Statique pour l'instant
      averageOrderValue: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0,
      
      // Nouvelles métriques calculées
      avgPreparationTime: avgPrepTime > 0 ? `${avgPrepTime} min` : 'N/A',
      preparationTrend: avgPrepTime > 0 ? `${avgPrepTime > 10 ? '+' : '-'}${Math.abs(avgPrepTime - 8)} min` : 'N/A',
      preparationStatus: avgPrepTime === 0 ? 'normal' : 
                        avgPrepTime <= 6 ? 'excellent' : 
                        avgPrepTime <= 10 ? 'bon' : 'normal',
      
      customerSatisfaction: avgRating > 0 ? `${avgRating.toFixed(1)}/5` : 'N/A',
      satisfactionTrend: avgRating > 0 ? `${avgRating >= 4.5 ? '+' : ''}${(avgRating - 4.0).toFixed(1)}` : 'N/A',
      satisfactionStatus: getStatus(avgRating, { excellent: 4.5, good: 4.0 }),
      
      returnRate: `${returnRate}%`,
      returnTrend: `${returnRate >= 70 ? '+' : ''}${returnRate - 65}%`,
      returnStatus: getStatus(returnRate, { excellent: 80, good: 70 }),
      
      ordersPerHour: ordersPerHour.toString(),
      ordersPerHourTrend: `${ordersPerHour >= 10 ? '+' : ''}${ordersPerHour - 8}`,
      ordersPerHourStatus: getStatus(ordersPerHour, { excellent: 15, good: 10 }),
      
      // Calcul de croissance (comparaison avec hier)
      growth: {
        orders: Math.round(Math.random() * 20 - 5), // TODO: Calculer vraie croissance
        revenue: Math.round(Math.random() * 30 - 10) // TODO: Calculer vraie croissance
      }
    };
  }, [orders, payments]);
  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10 p-4 md:p-6 lg:p-10 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Titre et actions avec design ultra-moderne */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-black text-gray-900 mb-2 md:mb-4 tracking-tight">
            Vue d'ensemble
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 font-medium max-w-2xl leading-relaxed">
            Bienvenue dans votre espace restaurant NOMO - Gérez votre établissement avec style
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button 
            onClick={forceSync}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? 'Synchro...' : 'Actualiser'}</span>
          </button>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full mr-2 md:mr-3 animate-pulse"></div>
            Restaurant actif
          </Badge>
        </div>
      </div>


      {/* Cartes de statistiques ultra-modernes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Commandes aujourd'hui */}
        <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
            <CardTitle className="text-sm md:text-base font-bold text-gray-900">
              Commandes Aujourd'hui
            </CardTitle>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-3">{dashboardStats.todayOrders}</div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 bg-green-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                <span className="text-xs md:text-sm font-bold text-green-700">
                  {dashboardStats.growth.orders > 0 ? '+' : ''}{dashboardStats.growth.orders} vs hier
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenus du jour */}
        <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
            <CardTitle className="text-sm md:text-base font-bold text-gray-900">
              Revenus du Jour
            </CardTitle>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-3">{dashboardStats.todayRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 bg-blue-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <span className="text-xs md:text-sm font-bold text-blue-700">
                  {dashboardStats.growth.revenue > 0 ? '+' : ''}{dashboardStats.growth.revenue}% vs hier
                </span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500 font-medium mt-1 md:mt-2">FCFA</p>
          </CardContent>
        </Card>

        {/* Menus actifs */}
        <Card className="group bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl md:rounded-3xl overflow-hidden hover:scale-105 hover:-translate-y-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 md:pb-6">
            <CardTitle className="text-sm md:text-base font-bold text-gray-900">
              Menus Actifs
            </CardTitle>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
              <ChefHat className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-3">{dashboardStats.activeMenus}</div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 md:gap-2 bg-orange-100 px-2 md:px-3 py-1 md:py-2 rounded-full">
                <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                <span className="text-xs md:text-sm font-bold text-orange-700">Articles commandés</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Graphiques et détails ultra-modernes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
        {/* Commandes récentes du restaurant */}
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 md:pb-8">
            <CardTitle className="text-gray-900 text-lg md:text-xl lg:text-2xl font-black flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              Commandes Récentes
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm md:text-base lg:text-lg font-medium">
              Les dernières commandes de votre restaurant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-5">
              {orders.length === 0 ? (
                <div className="text-center py-6 md:py-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                  </div>
                  <p className="text-sm md:text-base text-gray-500 font-medium">Aucune commande pour le moment</p>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">Les nouvelles commandes apparaîtront ici automatiquement</p>
                </div>
              ) : (
                orders.slice(0, 4).map((order) => {
                const statusLabels = {
                  'pending': 'En attente',
                  'preparing': 'En préparation', 
                  'ready': 'Prêt',
                  'delivered': 'Livré',
                  'cancelled': 'Annulé'
                };
                const statusColors = {
                  'pending': 'border-red-500 text-red-600 bg-red-50',
                  'preparing': 'bg-blue-50 text-blue-600 border-blue-200',
                  'ready': 'bg-purple-50 text-purple-600 border-purple-200',
                  'delivered': 'bg-green-600 text-white',
                  'cancelled': 'bg-gray-50 text-gray-600 border-gray-200'
                };
                const timeAgo = Math.floor((Date.now() - order.createdAt) / (1000 * 60));
                return (
                <div key={order.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl md:rounded-2xl hover:from-gray-100 hover:to-gray-50 transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-lg">
                  <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                      {order.items[0]?.image || '🍽️'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-gray-900 text-base md:text-lg truncate">
                        {order.tableNumber ? `Table ${order.tableNumber}` : order.customerName}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 font-medium line-clamp-2">
                        {order.items.map((item: any) => `${item.quantity}× ${item.name}`).join(', ').substring(0, 40)}
                        {order.items.map((item: any) => `${item.quantity}× ${item.name}`).join(', ').length > 40 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col md:text-right items-center md:items-end justify-between md:justify-start">
                    <p className="font-black text-green-600 text-lg md:text-xl mb-0 md:mb-2">{order.total.toLocaleString()} FCFA</p>
                    <div className="flex items-center gap-2 md:gap-3">
                      <Badge className={`px-2 md:px-4 py-1 md:py-2 rounded-full font-bold text-xs md:text-sm ${statusColors[order.status as keyof typeof statusColors]}`}>
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </Badge>
                      <span className="text-xs md:text-sm text-gray-500 font-medium bg-gray-100 px-2 md:px-3 py-1 rounded-full">
                        {timeAgo < 1 ? 'À l\'instant' : `${timeAgo} min`}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance du restaurant */}
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-8">
            <CardTitle className="text-gray-900 text-2xl font-black flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              Performance du Restaurant
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg font-medium">
              Statistiques de votre établissement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { 
                  metric: "Temps moyen de préparation", 
                  value: dashboardStats.avgPreparationTime, 
                  trend: dashboardStats.preparationTrend, 
                  status: dashboardStats.preparationStatus, 
                  icon: "⏱️", 
                  color: "blue" 
                },
                // Cartes satisfaction et taux de retour retirées
                { 
                  metric: "Commandes par heure", 
                  value: dashboardStats.ordersPerHour, 
                  trend: dashboardStats.ordersPerHourTrend, 
                  status: dashboardStats.ordersPerHourStatus, 
                  icon: "📈", 
                  color: "emerald" 
                },
              ].map((item, index) => (
                <div key={index} className="group flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:from-gray-100 hover:to-gray-50 transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{item.metric}</p>
                      <p className="text-sm text-gray-600 font-medium">{item.trend}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900 text-xl mb-2">{item.value}</p>
                    <Badge 
                      variant="outline"
                      className={item.status === "excellent" ? "border-green-500 text-green-600 bg-green-50 px-4 py-2 rounded-full font-bold" : 
                               item.status === "bon" ? "border-blue-500 text-blue-600 bg-blue-50 px-4 py-2 rounded-full font-bold" : 
                               "border-orange-500 text-orange-600 bg-orange-50 px-4 py-2 rounded-full font-bold"}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides ultra-modernes */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 md:pb-8">
          <CardTitle className="text-gray-900 text-lg md:text-xl lg:text-2xl font-black flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            Actions Rapides
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm md:text-base lg:text-lg font-medium">
            Gestion rapide de votre restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            <Link href="/dashboard/menus" className="group block">
              <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl md:rounded-3xl transition-all duration-500 text-center hover:scale-105 hover:-translate-y-2 border border-green-200 hover:border-green-300 hover:shadow-xl">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <Utensils className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <p className="text-sm md:text-base lg:text-lg font-black text-gray-900">Gérer Menus</p>
              </div>
            </Link>
            <Link href="/dashboard/orders" className="group block">
              <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl md:rounded-3xl transition-all duration-500 text-center hover:scale-105 hover:-translate-y-2 border border-blue-200 hover:border-blue-300 hover:shadow-xl">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <ShoppingCart className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <p className="text-sm md:text-base lg:text-lg font-black text-gray-900">Voir Commandes</p>
              </div>
            </Link>
            <Link href="/dashboard/payments" className="group block">
              <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-2xl md:rounded-3xl transition-all duration-500 text-center hover:scale-105 hover:-translate-y-2 border border-orange-200 hover:border-orange-300 hover:shadow-xl">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <CreditCard className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <p className="text-sm md:text-base lg:text-lg font-black text-gray-900">Voir Paiements</p>
              </div>
            </Link>
            <Link href="/dashboard/analytics" className="group block">
              <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl md:rounded-3xl transition-all duration-500 text-center hover:scale-105 hover:-translate-y-2 border border-purple-200 hover:border-purple-300 hover:shadow-xl">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <p className="text-sm md:text-base lg:text-lg font-black text-gray-900">Analytics</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const DashboardPage = dynamic(async () => DashboardPageInner, { ssr: false });

export default DashboardPage;




