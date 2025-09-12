"use client";

import { Logo, LogoFooter } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Clock, 
  Users, 
  Shield, 
  Zap, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // DÉBOGAGE : Fonction pour vider complètement l'authentification
  const clearAuthDebug = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nomo_token');
      localStorage.removeItem('nomo_user');
      console.log('🧹 DÉBOGAGE : Authentification vidée complètement');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.1)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(218,214,190,0.05)_0%,transparent_50%)]"></div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Logo className="h-8 w-auto" />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Tarifs</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-nomo-accent-green hover:bg-nomo-accent-green/90 text-white">
                  S'inscrire
                </Button>
              </Link>
              {/* Bouton debug retiré en production */}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-white/80 hover:text-white transition-colors">Fonctionnalités</a>
                <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Tarifs</a>
                <a href="#contact" className="text-white/80 hover:text-white transition-colors">Contact</a>
                <div className="pt-4 space-y-2">
                  <Link href="/auth/login" className="block">
                    <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="block">
                    <Button className="w-full bg-nomo-accent-green hover:bg-nomo-accent-green/90 text-white">
                      S'inscrire maintenant
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main Hero Card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-black/10 via-white/10 to-black/10 blur-3xl"></div>
              <Card className="relative max-w-5xl mx-auto rounded-[32px] p-10 md:p-14 backdrop-blur-2xl bg-white/15 border border-white/40 shadow-[0_10px_60px_rgba(0,0,0,0.35)]">
                <CardContent className="space-y-10">
                  <div className="flex justify-center">
                    <Badge className="bg-nomo-accent-green text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md">
                      🚀 Révolutionnez votre restaurant
                    </Badge>
                  </div>

                  <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
                    NOMO
                  </h1>

                  <p className="text-xl md:text-2xl text-white/95 max-w-4xl mx-auto font-bold leading-relaxed drop-shadow-xl">
                    La plateforme SaaS qui transforme votre restaurant en expérience digitale moderne.
                    Commandes QR, gestion temps réel, paiements intégrés.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/auth/register">
                      <Button size="lg" className="rounded-full h-12 px-8 bg-nomo-accent-green hover:bg-nomo-accent-green/90 text-white text-base font-semibold shadow-xl">
                        S'inscrire maintenant
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button size="lg" variant="outline" className="rounded-full h-12 px-8 border-white/50 text-white hover:bg-white/20 text-base font-semibold backdrop-blur-sm">
                        Se connecter
                      </Button>
                    </Link>
                  </div>

                  <div className="h-px w-full bg-white/20" />

                  <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-black text-white">500+</div>
                      <div className="text-white/80 font-semibold">Restaurants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-black text-white">99.9%</div>
                      <div className="text-white/80 font-semibold">Disponibilité</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-black text-white">24/7</div>
                      <div className="text-white/80 font-semibold">Support</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <Card className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6 shadow-lg">
                <CardContent className="text-center space-y-2">
                  <div className="text-4xl font-bold text-nomo-accent-green drop-shadow-md">500+</div>
                  <div className="text-white font-semibold">Restaurants</div>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6 shadow-lg">
                <CardContent className="text-center space-y-2">
                  <div className="text-4xl font-bold text-nomo-accent-gold drop-shadow-md">99.9%</div>
                  <div className="text-white font-semibold">Disponibilité</div>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-6 shadow-lg">
                <CardContent className="text-center space-y-2">
                  <div className="text-4xl font-bold text-nomo-accent-red drop-shadow-md">24/7</div>
                  <div className="text-white font-semibold">Support</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section d'inscription rapide */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-white/30 rounded-3xl p-8 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 drop-shadow-lg">
              Prêt à révolutionner votre restaurant ?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines de restaurateurs qui utilisent déjà NOMO pour moderniser leur établissement. 
              <strong className="text-white"> Inscription gratuite en 2 minutes !</strong>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-2xl shadow-2xl font-bold transform hover:scale-105 transition-all duration-300">
                  🚀 S'inscrire gratuitement
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full border-white/50 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-2xl font-semibold backdrop-blur-sm">
                  J'ai déjà un compte
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>2 min d'installation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-2xl tracking-tight">
              Fonctionnalités
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-nomo-accent-green to-nomo-accent-gold drop-shadow-2xl">
                Révolutionnaires
              </span>
            </h2>
            <p className="text-xl text-white font-bold max-w-3xl mx-auto drop-shadow-lg">
              Tout ce dont vous avez besoin pour moderniser votre restaurant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: "Menu QR Digital",
                description: "Vos clients scannent et commandent directement depuis leur téléphone. Plus de menus papier !",
                color: "from-nomo-accent-green to-emerald-500"
              },
              {
                icon: Clock,
                title: "Temps Réel",
                description: "Suivez les commandes en direct, notifications instantanées, gestion optimisée.",
                color: "from-nomo-accent-gold to-yellow-500"
              },
              {
                icon: Users,
                title: "Multi-Restaurants",
                description: "Gérez plusieurs établissements depuis une seule plateforme centralisée.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Shield,
                title: "Sécurisé",
                description: "Données protégées, paiements sécurisés, conformité RGPD garantie.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Zap,
                title: "Installation Rapide",
                description: "Opérationnel en moins de 5 minutes. Aucune formation technique requise.",
                color: "from-nomo-accent-red to-red-500"
              },
              {
                icon: BarChart3,
                title: "Analytics Avancés",
                description: "Tableaux de bord détaillés, insights sur vos ventes et performances.",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-8 hover:bg-white/30 transition-all duration-300 group shadow-lg">
                <CardContent className="space-y-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-white mb-3 drop-shadow-lg tracking-tight">{feature.title}</h3>
                    <p className="text-white leading-relaxed font-bold drop-shadow-md">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="backdrop-blur-xl bg-gradient-to-r from-nomo-accent-green/30 to-nomo-accent-gold/30 border border-white/30 rounded-3xl p-12 shadow-2xl">
            <CardContent className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl tracking-tight">
                Prêt à révolutionner
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-nomo-accent-green to-nomo-accent-gold drop-shadow-2xl">
                  votre restaurant ?
                </span>
              </h2>
              
              <p className="text-xl text-white font-bold max-w-2xl mx-auto drop-shadow-lg">
                Rejoignez des centaines de restaurateurs qui ont déjà transformé leur établissement avec NOMO.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-nomo-accent-green hover:bg-nomo-accent-green/90 text-white px-8 py-4 text-lg rounded-2xl shadow-2xl font-semibold">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/20 px-8 py-4 text-lg rounded-2xl font-semibold backdrop-blur-sm">
                    Se connecter
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-white font-bold">
                <CheckCircle className="h-5 w-5" />
                <span>Essai gratuit • Aucune carte requise • Support 24/7</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/20 backdrop-blur-xl bg-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <LogoFooter className="h-8 w-auto" />
              <p className="text-white font-bold max-w-xs">
                La plateforme SaaS qui révolutionne la gestion des restaurants.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-black mb-4 text-lg">Produit</h3>
              <ul className="space-y-2 text-white font-bold">
                <li><a href="#" className="hover:text-nomo-accent-green transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-nomo-accent-green transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-nomo-accent-green transition-colors">Démo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-black mb-4 text-lg">Support</h3>
              <ul className="space-y-2 text-white font-bold">
                <li><a href="#" className="hover:text-nomo-accent-green transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-nomo-accent-green transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-nomo-accent-green transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-black mb-4 text-lg">Légal</h3>
              <ul className="space-y-2 text-white font-bold">
                <li><a href="#" className="hover:text-nomo-accent-green transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-nomo-accent-green transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-nomo-accent-green transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-12 pt-8 text-center text-white font-bold">
            <p>&copy; 2024 NOMO. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}