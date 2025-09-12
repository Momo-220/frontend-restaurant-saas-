"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
  Star,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Target,
  Phone,
  RefreshCw
} from "lucide-react";
// import { useCentralSync } from "@/services/centralSyncService"; // Service supprimé

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7");

  // Données réelles - à connecter à l'API
  const orders: any[] = [];
  const payments: any[] = [];
  const analyticsActions = {
    getPeriodStats: (days: number) => ({
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topSellingItems: [],
      hourlyData: [],
      dailyData: []
    })
  };
  const isLoading = false;
  const forceSync = () => console.log('Force sync analytics - À connecter à l\'API');
  const syncStatus = 'connected';

  // Calculer les analytics en temps réel
  const analyticsData = useMemo(() => {
    const periodDays = parseInt(selectedPeriod);
    const periodStats = analyticsActions.getPeriodStats(periodDays);
    
    // Calculer les clients uniques
    const uniquePhones = new Set((orders || []).map(order => order?.customerPhone).filter(Boolean));
    
    // Calculer les heures de pointe
    const hourStats = new Map<number, number>();
    (orders || []).forEach(order => {
      if (order?.createdAt) {
        const hour = new Date(order.createdAt).getHours();
        hourStats.set(hour, (hourStats.get(hour) || 0) + 1);
      }
    });
    
    const popularHours = Array.from(hourStats.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([hour]) => `${hour}:00-${hour + 1}:00`);

    return {
      totalOrders: periodStats.totalOrders,
      totalRevenue: periodStats.totalRevenue,
      averageOrderValue: periodStats.averageOrderValue,
      totalCustomers: uniquePhones.size,
      returningCustomers: 0,
      averageRating: 0,
      popularHours,
      topMenus: (periodStats.topSellingItems || []).map((item: any) => ({
        name: item?.name || 'Plat inconnu',
        orders: item?.quantity || 0,
        revenue: item?.revenue || 0
      })),
      customerInsights: {
        averageAge: 'N/A', // Nécessite des données client étendues
        genderSplit: { men: 50, women: 50 }, // Nécessite des données client étendues
        topLocations: uniquePhones.size > 0 ? ["Données à collecter"] : [], // Nécessite géolocalisation
        orderFrequency: {
          daily: Math.round(periodStats.totalOrders / periodDays),
          weekly: Math.round(periodStats.totalOrders / (periodDays / 7)),
          monthly: Math.round(periodStats.totalOrders / (periodDays / 30))
        },
        satisfactionRate: orders.filter(o => o.rating >= 4).length / Math.max(orders.filter(o => o.rating).length, 1) * 100,
        phoneNumbers: uniquePhones.size,
        emailAddresses: Math.round(uniquePhones.size * 0.7) // Estimation
      }
    };
  }, [orders, payments, selectedPeriod, analyticsActions]);

  // Calculer les statistiques hebdomadaires en temps réel
  const weeklyStats = useMemo(() => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    
    return days.map((day, index) => {
      const dayStart = new Date(weekStart);
      dayStart.setDate(weekStart.getDate() + index);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayOrders = (orders || []).filter(order => {
        if (!order?.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });
      
      const dayPayments = (payments || []).filter(payment => {
        if (!payment?.date) return false;
        const paymentDate = new Date(payment.date);
        return paymentDate >= dayStart && paymentDate <= dayEnd && payment.status === 'completed';
      });
      
      return {
        day,
        orders: dayOrders.length,
        revenue: dayPayments.reduce((sum, payment) => sum + payment.amount, 0)
      };
    });
  }, [orders, payments]);

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map(item => item[key]));
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tight">
            Analytics
          </h1>
          <p className="text-xl text-gray-600 font-medium max-w-3xl leading-relaxed">
            Analysez vos performances, tendances et optimisez votre restaurant
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="px-6 py-4 rounded-2xl font-medium" onClick={forceSync} disabled={isLoading}>
            <RefreshCw className="h-5 w-5 mr-2" />
            {isLoading ? "Synchronisation..." : "Rafraîchir"}
          </Button>
          <Button variant="outline" className="px-6 py-4 rounded-2xl font-medium">
            <Download className="h-5 w-5 mr-2" />
            Rapport PDF
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold">
            <Target className="h-5 w-5 mr-2" />
            Objectifs
          </Button>
        </div>
      </div>

      {/* Sélecteur de période */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Période d'analyse</h3>
            <div className="flex gap-3">
              {["7d", "30d", "3m", "1y"].map((period) => (
                <Button
                  key={period}
                  variant={period === selectedPeriod ? "default" : "outline"}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-xl font-medium ${
                    period === selectedPeriod 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" 
                      : ""
                  }`}
                >
                  {period === "7d" && "7 jours"}
                  {period === "30d" && "30 jours"}
                  {period === "3m" && "3 mois"}
                  {period === "1y" && "1 an"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes Total</p>
                <p className="text-3xl font-black text-gray-900">{analyticsData.totalOrders}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-bold">+15.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="text-3xl font-black text-gray-900">
                  {(analyticsData.totalRevenue / 1000000).toFixed(1)}M FCFA
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-bold">+22.8%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Panier Moyen</p>
                <p className="text-3xl font-black text-gray-900">
                  {analyticsData.averageOrderValue.toLocaleString()} FCFA
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-600 font-bold">+8.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique des ventes hebdomadaires */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-gray-900">Ventes de la Semaine</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Évolution des commandes et revenus jour par jour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Graphique simplifié avec barres fines */}
            <div className="grid grid-cols-7 gap-6 h-64">
              {weeklyStats.map((stat) => {
                const maxOrders = Math.max(1, getMaxValue(weeklyStats, 'orders'));
                const maxRevenue = Math.max(1, getMaxValue(weeklyStats, 'revenue'));
                const orderHeight = (stat.orders / maxOrders) * 100;
                const revenueHeight = (stat.revenue / maxRevenue) * 100;

                return (
                  <div key={stat.day} className="flex flex-col items-center justify-end">
                    <div className="flex items-end gap-1 h-full">
                      {/* Barre commandes (fine) */}
                      <div
                        className="w-2 sm:w-3 bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-xl transition-[height] duration-500"
                        style={{ height: `${orderHeight}%` }}
                        title={`${stat.orders} commandes`}
                      />
                      {/* Barre revenus (fine) */}
                      <div
                        className="w-2 sm:w-3 bg-gradient-to-t from-green-400 to-green-600 rounded-t-xl transition-[height] duration-500"
                        style={{ height: `${revenueHeight}%` }}
                        title={`${stat.revenue.toLocaleString()} FCFA`}
                      />
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-sm font-bold text-gray-900">{stat.day}</p>
                      <p className="text-xs text-gray-600">{stat.orders}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Légende */}
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Commandes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Revenus</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top des menus et insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top des menus */}
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-gray-900">Top Menus</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Vos plats les plus populaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topMenus.map((menu, index) => (
                <div key={menu.name} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{menu.name}</p>
                      <p className="text-sm text-gray-600">{menu.orders} commandes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">{menu.revenue.toLocaleString()} FCFA</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Données clients collectées */}
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-gray-900">Données Clients</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Informations collectées lors des commandes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <p className="font-bold text-gray-900">Téléphones</p>
                </div>
                <p className="text-2xl font-black text-blue-600">{analyticsData.customerInsights.phoneNumbers}</p>
                <p className="text-sm text-gray-600">Numéros collectés</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <p className="font-bold text-gray-900">Clients Uniques</p>
                </div>
                <p className="text-2xl font-black text-purple-600">{analyticsData.totalCustomers}</p>
                <p className="text-sm text-gray-600">Clients identifiés</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Taux de Fidélisation</p>
                  <p className="text-sm text-gray-600">Clients qui reviennent</p>
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900">{analyticsData.returningCustomers}%</p>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-gray-900">Fréquence de Commande</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-lg font-black text-gray-900">{analyticsData.customerInsights.orderFrequency.daily}%</p>
                  <p className="text-sm text-gray-600">Quotidien</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-lg font-black text-gray-900">{analyticsData.customerInsights.orderFrequency.weekly}%</p>
                  <p className="text-sm text-gray-600">Hebdomadaire</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-lg font-black text-gray-900">{analyticsData.customerInsights.orderFrequency.monthly}%</p>
                  <p className="text-sm text-gray-600">Mensuel</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-gray-900">Heures de Pointe</p>
              <div className="flex gap-2">
                {analyticsData.popularHours.map((hour) => (
                  <Badge key={hour} className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1">
                    {hour}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-gray-900">Villes Principales</p>
              <div className="flex gap-2">
                {analyticsData.customerInsights.topLocations.map((location) => (
                  <Badge key={location} className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                    📍 {location}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




