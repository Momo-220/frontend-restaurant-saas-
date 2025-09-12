"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicGuard } from "@/components/auth/AuthGuard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { Eye, EyeOff, Mail, Lock, User, Store, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    // Données utilisateur
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Données restaurant
    restaurantName: "",
    restaurantSlug: "",
    restaurantDescription: "",
    restaurantAddress: "",
    restaurantPhone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useGlobalToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'restaurantName', 'restaurantSlug'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      showError("Champs requis", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Mots de passe différents", "Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      showError("Mot de passe trop court", "Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);

    try {
      // ÉTAPE 1: Créer le tenant (restaurant)
      const tenantPayload = {
        name: formData.restaurantName,
        slug: formData.restaurantSlug,
        email: formData.email,
        phone: formData.restaurantPhone,
        address: formData.restaurantAddress,
      };
      
      console.log('Création tenant avec:', tenantPayload);
      
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const tenantResponse = await fetch(`${API}/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantPayload),
      });

      console.log('Réponse tenant status:', tenantResponse.status);

      if (!tenantResponse.ok) {
        let tenantError;
        try {
          tenantError = await tenantResponse.json();
        } catch (e) {
          tenantError = { message: `HTTP ${tenantResponse.status}: ${tenantResponse.statusText}` };
        }
        console.error('Erreur tenant complète:', tenantError);
        
        // Afficher l'erreur détaillée
        const errorMessage = tenantError.message || 
                            (tenantError.error && tenantError.error.message) ||
                            tenantError.details ||
                            `Erreur ${tenantResponse.status}: ${tenantResponse.statusText}`;
        
        throw new Error(`Création restaurant échouée: ${errorMessage}`);
      }

      const tenantData = await tenantResponse.json();
      console.log('Tenant créé:', tenantData);

      // ÉTAPE 2: Créer l'utilisateur avec le tenant_id
      const userPayload = {
        tenant_id: tenantData.id,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: 'ADMIN', // Le propriétaire du restaurant est admin
      };
      
      console.log('Création utilisateur avec:', userPayload);
      
      const userResponse = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPayload),
      });

      console.log('Réponse user status:', userResponse.status);

      if (!userResponse.ok) {
        const userError = await userResponse.json();
        console.error('Erreur user:', userError);
        // Si l'utilisateur n'a pas pu être créé, on pourrait supprimer le tenant
        // Mais pour simplifier, on laisse juste l'erreur
        throw new Error(userError.message || 'Erreur lors de la création de l\'utilisateur');
      }

      const userData = await userResponse.json();
      console.log('Utilisateur créé:', userData);

      showSuccess(
        "Inscription réussie !", 
        `Bienvenue ${formData.restaurantName} ! Vous pouvez maintenant vous connecter.`
      );
      
      // Rediriger vers la page de connexion
      router.push('/auth/login');

    } catch (error) {
      console.error('Erreur register:', error);
      showError(
        "Erreur d'inscription", 
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-générer le slug depuis le nom du restaurant
    if (name === 'restaurantName') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({
        ...prev,
        restaurantSlug: slug
      }));
    }
  };

  return (
    <PublicGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NOMO
          </h1>
          <p className="text-gray-600 mt-2">Créez votre compte restaurant</p>
        </div>

        {/* Register Form */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">Inscription</CardTitle>
            <CardDescription className="text-gray-600">
              Créez votre compte et configurez votre restaurant
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Utilisateur */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Informations personnelles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      Prénom *
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Jean"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Nom *
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Dupont"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Adresse email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="restaurant@example.com"
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Mot de passe *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="pl-10 pr-12 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirmer le mot de passe *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="pl-10 pr-12 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Restaurant */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Store className="h-5 w-5 mr-2 text-blue-600" />
                  Informations restaurant
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="restaurantName" className="text-sm font-medium text-gray-700">
                    Nom du restaurant *
                  </Label>
                  <Input
                    id="restaurantName"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    placeholder="Le Petit Bistrot"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurantSlug" className="text-sm font-medium text-gray-700">
                    URL de votre menu * <span className="text-gray-500">(généré automatiquement)</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">nomo.app/r/</span>
                    <Input
                      id="restaurantSlug"
                      name="restaurantSlug"
                      value={formData.restaurantSlug}
                      onChange={handleInputChange}
                      placeholder="le-petit-bistrot"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurantDescription" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Input
                    id="restaurantDescription"
                    name="restaurantDescription"
                    value={formData.restaurantDescription}
                    onChange={handleInputChange}
                    placeholder="Cuisine française authentique..."
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurantAddress" className="text-sm font-medium text-gray-700">
                      Adresse
                    </Label>
                    <Input
                      id="restaurantAddress"
                      name="restaurantAddress"
                      value={formData.restaurantAddress}
                      onChange={handleInputChange}
                      placeholder="123 Rue de la Paix, Paris"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurantPhone" className="text-sm font-medium text-gray-700">
                      Téléphone
                    </Label>
                    <Input
                      id="restaurantPhone"
                      name="restaurantPhone"
                      value={formData.restaurantPhone}
                      onChange={handleInputChange}
                      placeholder="+33 1 23 45 67 89"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Création du compte...
                  </>
                ) : (
                  "Créer mon compte restaurant"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </PublicGuard>
  );
}



