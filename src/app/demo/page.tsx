"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { 
  ArrowLeft,
  Menu,
  ShoppingCart,
  CreditCard,
  BarChart3,
  User,
  QrCode,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(true);

  // Données mockées
  const mockStats = {
    totalOrders: 127,
    revenue: 2450000,
    activeTables: 8,
    satisfaction: 4.8
  };

  const mockOrders = [
    { id: 1, table: "Table 3", items: "Poulet Yassa + Jus d'orange", status: "En cours", time: "12:45" },
    { id: 2, table: "Table 7", items: "Thieboudienne + Bissap", status: "Prêt", time: "12:30" },
    { id: 3, table: "Table 2", items: "Mafé + Coca", status: "En attente", time: "12:50" },
    { id: 4, table: "Table 5", items: "Poulet DG + Eau", status: "Livré", time: "12:15" }
  ];

  const mockMenuItems = [
    { name: "Poulet Yassa", price: 3500, category: "Plats principaux", available: true },
    { name: "Thieboudienne", price: 4000, category: "Plats principaux", available: true },
    { name: "Mafé", price: 3200, category: "Plats principaux", available: false },
    { name: "Jus d'orange", price: 800, category: "Boissons", available: true },
    { name: "Bissap", price: 600, category: "Boissons", available: true },
    { name: "Coca Cola", price: 1000, category: "Boissons", available: true }
  ];

  const mockPayments = [
    { method: "Wave", amount: 4500, time: "12:45", status: "Réussi" },
    { method: "MyNita", amount: 3200, time: "12:30", status: "Réussi" },
    { method: "Orange Money", amount: 800, time: "12:15", status: "En attente" },
    { method: "Espèces", amount: 1000, time: "12:00", status: "Réussi" }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Commandes du jour</p>
                <p className="text-3xl font-bold text-blue-900">{mockStats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Chiffre d'affaires</p>
                <p className="text-3xl font-bold text-green-900">{mockStats.revenue.toLocaleString()} FCFA</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Tables actives</p>
                <p className="text-3xl font-bold text-purple-900">{mockStats.activeTables}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Satisfaction</p>
                <p className="text-3xl font-bold text-orange-900">{mockStats.satisfaction}/5</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique simple */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance du Restaurant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Graphique de performance en temps réel</p>
              <p className="text-sm text-gray-400 mt-2">Données mises à jour automatiquement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commandes récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes en cours</CardTitle>
          <CardDescription>Suivi en temps réel des commandes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{order.table}</p>
                    <p className="text-sm text-gray-600">{order.items}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={order.status === "Prêt" ? "default" : order.status === "En cours" ? "secondary" : "outline"}>
                    {order.status}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMenu = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu du Restaurant</h2>
          <p className="text-gray-600">Gérez votre menu et vos prix</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Menu className="h-4 w-4 mr-2" />
          Nouveau Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMenuItems.map((item, index) => (
          <Card key={index} className={`${!item.available ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <Badge variant={item.available ? "default" : "secondary"}>
                  {item.available ? "Disponible" : "Indisponible"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">{item.price.toLocaleString()} FCFA</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Modifier</Button>
                  <Button size="sm" variant="outline">
                    {item.available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h2>
          <p className="text-gray-600">Suivez et gérez toutes vos commandes</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">Temps réel</Badge>
          <Badge className="bg-blue-100 text-blue-800">Synchronisé</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              En attente (2)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockOrders.filter(o => o.status === "En attente").map((order) => (
              <div key={order.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{order.table}</p>
                    <p className="text-sm text-gray-600">{order.items}</p>
                    <p className="text-xs text-gray-500">{order.time}</p>
                  </div>
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                    Prendre
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              En cours (1)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockOrders.filter(o => o.status === "En cours").map((order) => (
              <div key={order.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{order.table}</p>
                    <p className="text-sm text-gray-600">{order.items}</p>
                    <p className="text-xs text-gray-500">{order.time}</p>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Prêt
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Prêt (1)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockOrders.filter(o => o.status === "Prêt").map((order) => (
              <div key={order.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{order.table}</p>
                    <p className="text-sm text-gray-600">{order.items}</p>
                    <p className="text-xs text-gray-500">{order.time}</p>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Livrer
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paiements</h2>
          <p className="text-gray-600">Suivez vos transactions et revenus</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">Wave</Badge>
          <Badge className="bg-blue-100 text-blue-800">MyNita</Badge>
          <Badge className="bg-orange-100 text-orange-800">Orange Money</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Transactions récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.method}</p>
                      <p className="text-sm text-gray-600">{payment.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{payment.amount.toLocaleString()} FCFA</p>
                    <Badge variant={payment.status === "Réussi" ? "default" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">9 500 FCFA</p>
                <p className="text-gray-600">Total aujourd'hui</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">3</p>
                  <p className="text-sm text-gray-600">Wave</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">1</p>
                  <p className="text-sm text-gray-600">MyNita</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profil du Restaurant</h2>
        <p className="text-gray-600">Gérez les informations de votre établissement</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du restaurant</label>
              <input 
                type="text" 
                value="Le Gourmet Dakar" 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input 
                type="text" 
                value="Avenue Léopold Sédar Senghor, Dakar" 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input 
                type="text" 
                value="+221 33 123 45 67" 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value="contact@legourmet.sn" 
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code du Menu</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-4">
              <QrCode className="h-24 w-24 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Vos clients scannent ce QR code pour accéder au menu
            </p>
            <Button className="w-full">Télécharger QR Code</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <Logo size="md" />
              <Badge className="bg-blue-100 text-blue-800">DÉMO</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Link href="/auth/register">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Essayer maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900">Le Gourmet Dakar</h3>
                <p className="text-sm text-gray-600">Restaurant de démonstration</p>
              </div>
              
              <nav className="space-y-2">
                {[
                  { id: "dashboard", label: "Tableau de bord", icon: BarChart3 },
                  { id: "menu", label: "Menu", icon: Menu },
                  { id: "orders", label: "Commandes", icon: ShoppingCart },
                  { id: "payments", label: "Paiements", icon: CreditCard },
                  { id: "profile", label: "Profil", icon: User }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "menu" && renderMenu()}
            {activeTab === "orders" && renderOrders()}
            {activeTab === "payments" && renderPayments()}
            {activeTab === "profile" && renderProfile()}
          </div>
        </main>
      </div>

      {/* Demo Notice */}
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-pulse"></div>
          <div>
            <p className="font-semibold">Mode Démonstration</p>
            <p className="text-sm opacity-90">
              Vous visualisez une version de démonstration avec des données fictives.
            </p>
            <Link href="/auth/register" className="text-sm underline mt-1 block">
              Créer votre compte →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
