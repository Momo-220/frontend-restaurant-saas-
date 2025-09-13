"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { 
  CheckCircle, 
  Star,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  Users,
  Smartphone,
  BarChart3,
  Headphones
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Header */}
      <header className="relative z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/">
              <Logo size="md" />
            </Link>
            
            <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200 mb-8">
              <Star className="h-4 w-4 mr-2" />
              Essai gratuit 1 mois
            </Badge>

            <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-6 tracking-tight" style={{ fontFamily: 'serif', fontWeight: 300 }}>
              Tarifs
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Transparents
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Un seul plan, des fonctionnalités complètes. Testez NOMO gratuitement pendant 1 mois, 
              puis continuez pour seulement $30 USD par mois.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white border-2 border-gray-200 rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="text-center pb-8 pt-12">
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 mb-4 mx-auto">
                <Zap className="h-4 w-4 mr-2" />
                Plan Unique
              </Badge>
              <CardTitle className="text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'serif', fontWeight: 300 }}>
                NOMO Pro
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                Toutes les fonctionnalités pour moderniser votre restaurant
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-12 pb-12">
              {/* Pricing */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-6xl font-light text-gray-900" style={{ fontFamily: 'serif', fontWeight: 300 }}>$30</span>
                  <div className="text-left">
                    <div className="text-xl font-medium text-gray-900">USD</div>
                    <div className="text-sm text-gray-500">par mois</div>
                  </div>
                </div>
                <div className="text-sm text-green-600 font-medium mb-6">
                  <Clock className="h-4 w-4 inline mr-1" />
                  1 mois d'essai gratuit
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités de base</h3>
                  {[
                    "Menu QR Code digital",
                    "Gestion des commandes temps réel",
                    "Tableau de bord analytics",
                    "Gestion multi-restaurants",
                    "Support client 24/7",
                    "Sauvegarde automatique"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités avancées</h3>
                  {[
                    "Paiements intégrés (Wave, MyNita, Orange Money)",
                    "Notifications push",
                    "Gestion des stocks",
                    "Rapports détaillés",
                    "API personnalisée",
                    "Formation et onboarding"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-12 py-4 text-lg rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Commencer l'essai gratuit
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-sm text-gray-500 mt-4">
                  Aucune carte de crédit requise • Annulation à tout moment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-900 mb-6" style={{ fontFamily: 'serif', fontWeight: 300 }}>
              Questions Fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce que vous devez savoir sur NOMO
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border border-gray-200 rounded-2xl p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Comment fonctionne l'essai gratuit ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Vous bénéficiez d'un accès complet à toutes les fonctionnalités de NOMO pendant 1 mois, 
                  sans engagement et sans carte de crédit requise.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-2xl p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Que se passe-t-il après l'essai ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Après 1 mois, votre abonnement passe automatiquement à $30 USD par mois. 
                  Vous pouvez annuler à tout moment sans frais.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-2xl p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Puis-je annuler à tout moment ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. 
                  Aucun frais d'annulation n'est appliqué.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-2xl p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Y a-t-il des frais cachés ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Non, le prix affiché est le prix final. $30 USD par mois, 
                  c'est tout. Pas de frais d'installation, de configuration ou de support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-light text-gray-900 mb-6" style={{ fontFamily: 'serif', fontWeight: 300 }}>
            Prêt à moderniser votre restaurant ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez des centaines de restaurateurs qui utilisent déjà NOMO pour transformer leur établissement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-xl font-semibold">
                Commencer l'essai gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg rounded-xl font-semibold">
                J'ai déjà un compte
              </Button>
            </Link>
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
                <li><a href="/pricing" className="hover:text-gray-900 transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Démo</a></li>
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
