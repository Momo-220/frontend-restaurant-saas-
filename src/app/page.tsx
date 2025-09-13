"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { 
  Smartphone, 
  Clock, 
  Users, 
  Shield, 
  Zap, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Github,
  MoveRight,
  Eye
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [titleNumber, setTitleNumber] = useState(0);
  
  const titles = useMemo(
    () => ["moderne", "intelligent", "rapide", "sécurisé", "innovant"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="min-h-screen bg-white">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Header */}
      <header className="relative z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <Logo size="md" />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Tarifs</Link>
              <Link href="/demo" className="text-gray-600 hover:text-gray-900 transition-colors">Démo</Link>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Se connecter
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  S'inscrire
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Tarifs</Link>
                <Link href="/demo" className="text-gray-600 hover:text-gray-900 transition-colors">Démo</Link>
                <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
                <div className="pt-4 space-y-2">
                  <Link href="/auth/login" className="block">
                    <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-900">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="block">
                    <Button className="w-full bg-black hover:bg-gray-800 text-white">
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
            {/* Announcement Banner */}
            <div className="flex justify-center mb-12">
                    <Link href="/auth/register">
                <Button variant="secondary" size="sm" className="gap-2 px-6 py-2 rounded-full">
                  Lire notre article de lancement <MoveRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

            {/* Main Title with Animation */}
            <div className="mb-12">
              <h1 className="text-6xl md:text-8xl tracking-tight leading-none">
                <div className="text-gray-900 mb-2 font-light" style={{ fontFamily: 'serif', fontWeight: 300 }}>Votre restaurant</div>
                <div className="relative h-24 md:h-32 flex items-center justify-center overflow-hidden">
                  {titles.map((title, index) => (
                    <motion.span
                      key={index}
                      className="absolute font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                      style={{ fontFamily: 'serif', fontWeight: 300 }}
                      initial={{ opacity: 0, y: 100 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 100,
                        damping: 20,
                        duration: 0.6
                      }}
                      animate={
                        titleNumber === index
                          ? {
                              y: 0,
                              opacity: 1,
                            }
                          : {
                              y: titleNumber > index ? -100 : 100,
                              opacity: 0,
                            }
                      }
                    >
                      {title}
                    </motion.span>
                  ))}
                    </div>
              </h1>
                    </div>

            {/* Subtitle */}
            <div className="mb-16">
              <p className="text-xl md:text-2xl leading-relaxed text-gray-600 max-w-4xl mx-auto font-medium">
                Gérer un restaurant aujourd'hui est déjà difficile. Évitez les complications supplémentaires 
                en abandonnant les méthodes obsolètes. Notre objectif est de simplifier la gestion 
                des restaurants, la rendant plus facile et plus rapide que jamais.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/demo">
                <Button size="lg" variant="outline" className="gap-2 px-8 py-4 text-lg rounded-xl border-2 hover:bg-gray-50 transition-all duration-300">
                  <Eye className="w-5 h-5" />
                  Voir la démo
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Commencer l'essai gratuit <MoveRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Component Showcase Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <Badge className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                ✨ Dernière fonctionnalité
              </Badge>
            </div>
            
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Menu QR Digital
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Vos clients scannent le QR code et accèdent directement à votre menu digital. 
              Commandes en temps réel, paiements intégrés, gestion simplifiée.
            </p>
            
            {/* Preview Component */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-white" />
            </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Scan & Commandez</h3>
                <p className="text-gray-600">Expérience client fluide et moderne</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Fonctionnalités
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Révolutionnaires
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tout ce dont vous avez besoin pour moderniser votre restaurant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Smartphone,
                title: "Menu QR Digital",
                description: "Vos clients scannent et commandent directement depuis leur téléphone. Plus de menus papier !",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Clock,
                title: "Temps Réel",
                description: "Suivez les commandes en direct, notifications instantanées, gestion optimisée.",
                color: "from-yellow-500 to-orange-500"
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
                color: "from-red-500 to-pink-500"
              },
              {
                icon: BarChart3,
                title: "Analytics Avancés",
                description: "Tableaux de bord détaillés, insights sur vos ventes et performances.",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group">
                <div className="space-y-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-50 rounded-3xl p-12 border border-gray-200">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                Prêt à révolutionner
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  votre restaurant ?
                </span>
              </h2>
              
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Rejoignez des centaines de restaurateurs qui ont déjà transformé leur établissement avec NOMO.
              </p>
              
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link href="/auth/register">
                <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-xl font-semibold">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg rounded-xl font-semibold">
                    Se connecter
                  </Button>
                </Link>
              </div>
              
            <div className="flex items-center justify-center space-x-2 text-gray-600">
                <CheckCircle className="h-5 w-5" />
                <span>Essai gratuit • Aucune carte requise • Support 24/7</span>
              </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Logo size="md" />
              <p className="text-gray-600 max-w-xs">
                La plateforme SaaS qui révolutionne la gestion des restaurants.
              </p>
            </div>
            
            <div>
              <h3 className="text-gray-900 font-bold mb-4 text-lg">Produit</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a></li>
                <li><Link href="/pricing" className="hover:text-gray-900 transition-colors">Tarifs</Link></li>
                <li><Link href="/demo" className="hover:text-gray-900 transition-colors">Démo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-900 font-bold mb-4 text-lg">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-900 font-bold mb-4 text-lg">Légal</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2024 NOMO. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}