"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PublicGuard } from "@/components/auth/AuthGuard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { Eye, EyeOff, Mail, Lock, User, Store, ArrowLeft, CreditCard, Globe, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { FileUpload } from "@/components/ui/file-upload";

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
    restaurantEmail: "",
    restaurantWebsite: "",
    // Paiements
    myNitaNumber: "",
    myNitaName: "",
    waveNumber: "",
    waveName: "",
    orangeMoneyNumber: "",
    orangeMoneyName: "",
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string>('');
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
      // Les URLs sont déjà uploadées via le composant FileUpload
      // On utilise les URLs récupérées de Supabase

      // ÉTAPE 1: Créer le tenant (restaurant) avec les informations de base
      const tenantPayload = {
        name: formData.restaurantName,
        slug: formData.restaurantSlug,
        email: formData.restaurantEmail || formData.email,
        phone: formData.restaurantPhone,
        address: formData.restaurantAddress,
        description: formData.restaurantDescription,
        website: formData.restaurantWebsite,
        logo_url: logoUrl || undefined,
        banner_url: bannerUrl || undefined,
        payment_info: {
          myNita: {
            number: formData.myNitaNumber,
            name: formData.myNitaName
          },
          wave: {
            number: formData.waveNumber,
            name: formData.waveName
          },
          orangeMoney: {
            number: formData.orangeMoneyNumber,
            name: formData.orangeMoneyName
          }
        }
      };
      
      console.log('Création tenant avec:', tenantPayload);
      
      const API = process.env.NEXT_PUBLIC_API_URL || '';
      const tenantResponse = await fetch(`${API}/api/v1/tenants`, {
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
        role: 'ADMIN',
      };
      
      console.log('Création utilisateur avec:', userPayload);
      
      const userResponse = await fetch(`${API}/api/v1/auth/register`, {
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
        throw new Error(userError.message || 'Erreur lors de la création de l\'utilisateur');
      }

      const userData = await userResponse.json();
      console.log('Utilisateur créé:', userData);

      // Stocker token + user si l'API renvoie auth après register
      if (userData?.access_token && userData?.user) {
        try {
          localStorage.setItem('nomo_token', userData.access_token);
          localStorage.setItem('nomo_user', JSON.stringify(userData.user));
        } catch {}
        showSuccess("Inscription réussie !", `Bienvenue ${formData.restaurantName} !`);
        router.push('/dashboard');
      } else {
        showSuccess(
          "Inscription réussie !", 
          `Bienvenue ${formData.restaurantName} ! Vous pouvez maintenant vous connecter.`
        );
        router.push('/auth/login');
      }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                <Link href="/">
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'serif', fontWeight: 300 }}>
                Inscription
              </h1>
              <p className="text-xl text-gray-600">Créez votre compte et configurez votre restaurant</p>
            </div>

            <Card className="bg-white border-2 border-gray-200 rounded-3xl shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Section Utilisateur */}
                  <div className="space-y-6">
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
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
                            className="pl-10 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
                            className="pl-10 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
                  <div className="space-y-6 border-t pt-8">
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
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="restaurantSlug" className="text-sm font-medium text-gray-700">
                        URL de votre menu * <span className="text-gray-500">(généré automatiquement)</span>
                      </Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">nomo-app.vercel.app/r/</span>
                        <Input
                          id="restaurantSlug"
                          name="restaurantSlug"
                          value={formData.restaurantSlug}
                          onChange={handleInputChange}
                          placeholder="le-petit-bistrot"
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="restaurantDescription" className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="restaurantDescription"
                        name="restaurantDescription"
                        value={formData.restaurantDescription}
                        onChange={handleInputChange}
                        placeholder="Cuisine française authentique dans un cadre chaleureux..."
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        rows={3}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="restaurantAddress" className="text-sm font-medium text-gray-700">
                          Adresse
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="restaurantAddress"
                            name="restaurantAddress"
                            value={formData.restaurantAddress}
                            onChange={handleInputChange}
                            placeholder="123 Rue de la Paix, Paris"
                            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="restaurantPhone" className="text-sm font-medium text-gray-700">
                          Téléphone
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="restaurantPhone"
                            name="restaurantPhone"
                            value={formData.restaurantPhone}
                            onChange={handleInputChange}
                            placeholder="+33 1 23 45 67 89"
                            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="restaurantEmail" className="text-sm font-medium text-gray-700">
                          Email restaurant
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="restaurantEmail"
                            name="restaurantEmail"
                            type="email"
                            value={formData.restaurantEmail}
                            onChange={handleInputChange}
                            placeholder="contact@restaurant.com"
                            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="restaurantWebsite" className="text-sm font-medium text-gray-700">
                          Site web
                        </Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="restaurantWebsite"
                            name="restaurantWebsite"
                            value={formData.restaurantWebsite}
                            onChange={handleInputChange}
                            placeholder="https://www.restaurant.com"
                            className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload Logo */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Logo du restaurant
                      </Label>
                      <FileUpload
                        onFileSelect={(file, url) => {
                          setLogoFile(file);
                          if (url) setLogoUrl(url);
                        }}
                        accept="image/*"
                        placeholder="Glissez-déposez votre logo ou cliquez pour sélectionner"
                        currentFile={logoFile}
                        uploadType="logo"
                        restaurantId="temp-restaurant-id" // Sera remplacé par l'ID réel après création
                      />
                    </div>

                    {/* Upload Bannière */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Bannière du restaurant
                      </Label>
                      <FileUpload
                        onFileSelect={(file, url) => {
                          setBannerFile(file);
                          if (url) setBannerUrl(url);
                        }}
                        accept="image/*"
                        placeholder="Glissez-déposez votre bannière ou cliquez pour sélectionner"
                        currentFile={bannerFile}
                        uploadType="banner"
                        restaurantId="temp-restaurant-id" // Sera remplacé par l'ID réel après création
                      />
                    </div>
                  </div>

                  {/* Section Paiements */}
                  <div className="space-y-6 border-t pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                      Informations de paiement
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* MyNita */}
                      <div className="space-y-4 p-4 border border-gray-200 rounded-xl">
                        <h4 className="font-medium text-gray-900">MyNita</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="myNitaNumber" className="text-sm font-medium text-gray-700">
                              Numéro
                            </Label>
                            <Input
                              id="myNitaNumber"
                              name="myNitaNumber"
                              value={formData.myNitaNumber}
                              onChange={handleInputChange}
                              placeholder="+221 XX XXX XX XX"
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="myNitaName" className="text-sm font-medium text-gray-700">
                              Nom sur le compte
                            </Label>
                            <Input
                              id="myNitaName"
                              name="myNitaName"
                              value={formData.myNitaName}
                              onChange={handleInputChange}
                              placeholder="Nom du propriétaire"
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Wave */}
                      <div className="space-y-4 p-4 border border-gray-200 rounded-xl">
                        <h4 className="font-medium text-gray-900">Wave</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="waveNumber" className="text-sm font-medium text-gray-700">
                              Numéro
                            </Label>
                            <Input
                              id="waveNumber"
                              name="waveNumber"
                              value={formData.waveNumber}
                              onChange={handleInputChange}
                              placeholder="+221 XX XXX XX XX"
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="waveName" className="text-sm font-medium text-gray-700">
                              Nom sur le compte
                            </Label>
                            <Input
                              id="waveName"
                              name="waveName"
                              value={formData.waveName}
                              onChange={handleInputChange}
                              placeholder="Nom du propriétaire"
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Orange Money */}
                      <div className="space-y-4 p-4 border border-gray-200 rounded-xl">
                        <h4 className="font-medium text-gray-900">Orange Money</h4>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="orangeMoneyNumber" className="text-sm font-medium text-gray-700">
                              Numéro
                            </Label>
                            <Input
                              id="orangeMoneyNumber"
                              name="orangeMoneyNumber"
                              value={formData.orangeMoneyNumber}
                              onChange={handleInputChange}
                              placeholder="+221 XX XXX XX XX"
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="orangeMoneyName" className="text-sm font-medium text-gray-700">
                              Nom sur le compte
                            </Label>
                            <Input
                              id="orangeMoneyName"
                              name="orangeMoneyName"
                              value={formData.orangeMoneyName}
                              onChange={handleInputChange}
                              placeholder="Nom du propriétaire"
                              className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
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
                    <Link href="/auth/login" className="text-black hover:text-gray-700 font-semibold">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicGuard>
  );
}