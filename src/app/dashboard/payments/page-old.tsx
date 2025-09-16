"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";
// Services supprimés - à remplacer par API
// import { usePaymentSync, PaymentData } from "@/services/paymentSyncService";
// import { centralSyncService } from "@/services/centralSyncService";

// Interface PaymentData locale
interface PaymentData {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: string;
  customer: string;
  customerPhone: string;
  date: string;
  fee?: number;
  table?: string;
  transactionId?: string;
}

type PaymentStatus = "tous" | "completed" | "pending" | "failed" | "refunded";

const STATUS_META: Record<Exclude<PaymentStatus, "tous">, { label: string; color: string; icon: React.ReactNode }> = {
  completed: { label: "Terminé", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-4 w-4" /> },
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-4 w-4" /> },
  failed: { label: "Échoué", color: "bg-red-100 text-red-700", icon: <XCircle className="h-4 w-4" /> },
  refunded: { label: "Remboursé", color: "bg-gray-100 text-gray-700", icon: <ArrowDownRight className="h-4 w-4" /> }
};

const METHOD_META: Record<PaymentData['method'], { label: string; color: string }> = {
  cash: { label: "Espèces", color: "bg-green-100 text-green-700" },
  wave: { label: "Wave", color: "bg-blue-100 text-blue-700" },
  mynita: { label: "MyNita", color: "bg-purple-100 text-purple-700" }
};

export default function PaymentsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);

  // Données réelles - à connecter à l'API
  const payments: PaymentData[] = [];
  const stats = { totalRevenue: 0, totalTransactions: 0, cashPayments: 0, pendingAmount: 0 };
  const updateStatus = (paymentId: string, newStatus: string) => {
    console.log('Mise à jour paiement:', paymentId, newStatus);
  };
  const isLoading = false;

  // Filtrer les paiements selon les critères
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Filtrer par statut
    if (selectedStatus !== "tous") {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }

    // Filtrer par recherche
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.customer.toLowerCase().includes(searchLower) ||
        payment.customerPhone.includes(searchTerm) ||
        payment.id.toLowerCase().includes(searchLower) ||
        payment.orderId.toLowerCase().includes(searchLower)
      );
    }

    // Filtrer par période
    const now = Date.now();
    const periodMs = {
      "1d": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - (periodMs[selectedPeriod as keyof typeof periodMs] || periodMs["7d"]);
    filtered = filtered.filter(payment => new Date(payment.date).getTime() >= cutoff);

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, selectedStatus, searchTerm, selectedPeriod]);

  // Forcer une synchronisation
  const handleForceSync = () => {
    console.log('Force sync paiements - À connecter à l\'API');
  };

  // Mettre à jour le statut d'un paiement
  const handleUpdateStatus = (paymentId: string, newStatus: PaymentData['status']) => {
    updateStatus(paymentId, newStatus);
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tight">
            Paiements
          </h1>
          <p className="text-xl text-gray-600 font-medium max-w-3xl leading-relaxed">
            Suivez vos revenus, transactions et gérez vos paiements Wave/MyNita
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="px-6 py-4 rounded-2xl font-medium" onClick={handleForceSync} disabled={isLoading}>
            <RefreshCw className="h-5 w-5 mr-2" />
            {isLoading ? "Synchronisation..." : "Rafraîchir"}
          </Button>
          <Button variant="outline" className="px-6 py-4 rounded-2xl font-medium">
            <Download className="h-5 w-5 mr-2" />
            Exporter
          </Button>
          {/* Bouton Nouveau Paiement retiré */}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus Total</p>
                <p className="text-3xl font-black text-gray-900">
                  {stats.totalRevenue.toLocaleString()} FCFA
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-bold">+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-3xl font-black text-gray-900">{stats.totalTransactions}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600 font-bold">+8.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paiements Cash</p>
                <p className="text-3xl font-black text-gray-900">{stats.cashPayments}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-600 font-bold">-2.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-3xl font-black text-gray-900">
                  {stats.pendingAmount.toLocaleString()} FCFA
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 font-bold">3 transactions</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par ID, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            <div className="flex gap-3">
              {["7d", "30d", "3m", "1y"].map((period) => (
                <Button
                  key={period}
                  variant={period === selectedPeriod ? "default" : "outline"}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-xl font-medium ${
                    period === selectedPeriod 
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
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

            <div className="flex gap-3">
              {["tous", "completed", "pending", "failed"].map((status) => (
                <Button
                  key={status}
                  variant={status === selectedStatus ? "default" : "outline"}
                  onClick={() => setSelectedStatus(status as PaymentStatus)}
                  className={`px-4 py-2 rounded-xl font-medium ${
                    status === selectedStatus 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
                      : ""
                  }`}
                >
                  {status === "tous" && "Tous"}
                  {status === "completed" && "Payés"}
                  {status === "pending" && "En attente"}
                  {status === "failed" && "Échoués"}
                </Button>
              ))}
            </div>

            <div className="flex gap-3">
              {["tous", "cash", "wave", "mynita"].map((method) => (
                <Button
                  key={method}
                  variant="outline"
                  className="px-4 py-2 rounded-xl font-medium"
                >
                  {method === "tous" && "Tous modes"}
                  {method === "cash" && "💵 Espèces"}
                  {method === "wave" && "🌊 Wave"}
                  {method === "mynita" && "💳 MyNita"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des paiements */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-black text-gray-900">Transactions Récentes</CardTitle>
          <CardDescription className="text-gray-600 font-medium">
            Historique des paiements et leur statut
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement des paiements...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun paiement trouvé</p>
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.id} className="group p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-900">{payment.id.substring(0, 8)}...</p>
                        <p className="text-xs text-gray-500">{payment.orderId.substring(0, 8)}...</p>
                      </div>
                      
                      <div>
                        <p className="font-bold text-gray-900">{payment.customer}</p>
                        <p className="text-sm text-gray-600">{payment.customerPhone}</p>
                        <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleString()}</p>
                      </div>
                      
                      <div>
                        {payment.table && (
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200 mb-2">
                            📍 {payment.table}
                          </Badge>
                        )}
                        <div className="flex gap-2">
                          <Badge className={`${STATUS_META[payment.status as keyof typeof STATUS_META]?.color || 'bg-gray-100 text-gray-700'} rounded-xl`}>
                            {STATUS_META[payment.status as keyof typeof STATUS_META]?.icon}
                            <span className="ml-1">{STATUS_META[payment.status as keyof typeof STATUS_META]?.label || payment.status}</span>
                          </Badge>
                          <Badge className={`${METHOD_META[payment.method].color} rounded-xl`}>
                            {METHOD_META[payment.method].label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900">
                        {payment.amount.toLocaleString()} FCFA
                      </p>
                      {(payment.fee && payment.fee > 0) ? (
                        <p className="text-sm text-gray-500">
                          Frais: {payment.fee.toLocaleString()} FCFA
                        </p>
                      ) : (
                        <p className="text-sm text-green-600 font-bold">
                          Aucun frais
                        </p>
                      )}
                      {payment.transactionId && (
                        <p className="text-xs text-gray-400">
                          {payment.transactionId}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payment.status === 'pending' && (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(payment.id, 'completed')}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(payment.id, 'failed')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}







