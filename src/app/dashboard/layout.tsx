"use client";

import { Header } from "@/components/dashboard/header";
import { DashboardGuard } from "@/components/auth/AuthGuard";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/services/authService";

// Composant Sidebar ultra-moderne pour un restaurant utilisateur de NOMO
function RestaurantSidebar() {
  const [isRestaurantSectionOpen, setIsRestaurantSectionOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  // Pour éviter les mismatches d'hydratation, afficher des valeurs stables au chargement
  const { user } = useAuth();
  const restaurantName = "Mon Restaurant";
  const restaurantSubtitle = "Restaurant";
  return (
    <div className={`fixed left-0 top-0 z-40 h-full ${collapsed ? "w-20" : "w-72"} bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl transition-[width] duration-300`}>
      {/* Header de la sidebar */}
      <div className="flex h-20 items-center justify-between border-b border-gray-200/50 px-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">🍽️</span>
          </div>
          {!collapsed && (
            <div>
              <span className="text-2xl font-black text-gray-900">{restaurantName}</span>
              <p className="text-xs text-gray-500 font-medium -mt-1">{restaurantSubtitle}</p>
            </div>
          )}
        </div>
        <button
          aria-label="Basculer la sidebar"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-700 rounded-xl px-2 py-1"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>
      
      {/* Navigation principale */}
      <nav className={`p-6 ${collapsed ? 'px-3' : ''}`}>
        <div className="space-y-3">
          <a href="/dashboard" title="Dashboard" className={`group flex items-center ${collapsed ? 'justify-center' : ''} gap-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-2xl transition-all duration-200 font-semibold hover:text-green-700 hover:shadow-md`}>
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <span className="text-xl">📊</span>
            </div>
            {!collapsed && <span>Dashboard</span>}
          </a>
          
          <a href="/dashboard/menus" title="Menus" className={`group flex items-center ${collapsed ? 'justify-center' : ''} gap-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 rounded-2xl transition-all duration-200 font-medium hover:text-orange-700 hover:shadow-md`}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <span className="text-xl">🍽️</span>
            </div>
            {!collapsed && <span>Mes Menus</span>}
          </a>
          
          <a href="/dashboard/orders" title="Commandes" className={`group flex items-center ${collapsed ? 'justify-center' : ''} gap-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-2xl transition-all duration-200 font-medium hover:text-blue-700 hover:shadow-md`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <span className="text-xl">📱</span>
            </div>
            {!collapsed && <span>Commandes</span>}
          </a>
          
          
          <a href="/dashboard/payments" title="Paiements" className={`group flex items-center ${collapsed ? 'justify-center' : ''} gap-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 rounded-2xl transition-all duration-200 font-medium hover:text-emerald-700 hover:shadow-md`}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <span className="text-xl">💳</span>
            </div>
            {!collapsed && <span>Paiements</span>}
          </a>
          
          <a href="/dashboard/analytics" title="Analytics" className={`group flex items-center ${collapsed ? 'justify-center' : ''} gap-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 rounded-2xl transition-all duration-200 font-medium hover:text-indigo-700 hover:shadow-md`}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <span className="text-xl">📈</span>
            </div>
            {!collapsed && <span>Analytics</span>}
          </a>
          
          <a href="/dashboard/profile" title="Profil" className={`group flex items-center ${collapsed ? 'justify-center' : ''} gap-4 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 rounded-2xl transition-all duration-200 font-medium hover:text-amber-700 hover:shadow-md`}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <span className="text-xl">🏪</span>
            </div>
            {!collapsed && <span>Profil Restaurant</span>}
          </a>
        </div>
        
        {/* Section restaurant déroulable avec design moderne */}
        {!collapsed && (
        <div className="mt-10 pt-8 border-t border-gray-200/50">
          <div className="px-4">
            {/* Header cliquable avec icône */}
            <button 
              onClick={() => setIsRestaurantSectionOpen(!isRestaurantSectionOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
            >
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Mon Restaurant
              </p>
              <div className="transform transition-transform duration-200 group-hover:scale-110">
                {isRestaurantSectionOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>
            
            {/* Contenu déroulable avec animation */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isRestaurantSectionOpen ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
            }`}>
              <div className="group p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/50 hover:border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                    <span className="text-white text-lg font-bold">🏪</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">
                      {restaurantName}
                    </p>
                    <p className="text-xs text-gray-600 truncate font-medium">
                      {restaurantSubtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-bold">En ligne</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </nav>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Activer un contournement d'auth temporaire via variable d'env
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  return (
    <DashboardGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <RestaurantSidebar />
        
        {/* Contenu principal avec design moderne */}
        <div className="md:ml-72">
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}



