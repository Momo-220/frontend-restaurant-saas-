"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Search, 
  Settings, 
  User,
  ChevronDown,
  TrendingUp,
  Calendar,
  Clock
} from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [notifications] = useState(3);

  return (
    <header className={`bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        {/* Titre de la page avec design moderne */}
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-lg text-gray-600 font-medium">
              Bienvenue sur votre espace NOMO
            </p>
            <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-bold text-green-700">Aujourd'hui</span>
            </div>
          </div>
        </div>

        {/* Actions épurées (barre de recherche uniquement) */}
        <div className="flex items-center space-x-6">
          <div className="relative hidden lg:block">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans votre restaurant..."
              className="pl-12 pr-6 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50/50 hover:bg-white transition-all duration-300 w-80"
            />
          </div>
        </div>
      </div>
    </header>
  );
}



