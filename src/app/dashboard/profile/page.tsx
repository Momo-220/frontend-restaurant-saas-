"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Store,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  Upload,
  Camera,
  Globe,
  CreditCard,
  Palette,
  QrCode,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { useAuth } from "@/services/authService";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { showSuccess, showInfo, showError } = useGlobalToast();
  const { user, updateProfile, isLoading } = useAuth();

  // Données RÉELLES du restaurant depuis la base de données
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    slug: "",
    logo_url: null as string | null,
    banner_url: null as string | null,
  });

  // Synchroniser avec les données utilisateur RÉELLES depuis PostgreSQL
  React.useEffect(() => {
    if (user?.tenant) {
      setRestaurantData({
        name: user.tenant.name || "",
        description: user.tenant.description || "",
        address: user.tenant.address || "",
        phone: user.tenant.phone || "",
        email: user.tenant.email || "",
        website: user.tenant.website || "",
        slug: user.tenant.slug || "",
        logo_url: user.tenant.logo_url || null,
        banner_url: user.tenant.banner_url || null,
      });
    }
  }, [user]);

  const tabs = [
    { id: "general", label: "Informations Générales", icon: Store },
    { id: "appearance", label: "Apparence", icon: Palette },
    { id: "qr", label: "QR Code", icon: QrCode },
  ];

  const handleSave = async () => {
    if (!user?.tenant?.id) {
      showError("Erreur", "Aucun restaurant associé à votre compte");
      return;
    }

    try {
      await updateProfile({
        name: restaurantData.name,
        description: restaurantData.description,
        address: restaurantData.address,
        phone: restaurantData.phone,
        email: restaurantData.email,
        website: restaurantData.website,
      });

      setIsEditing(false);
      showSuccess("Profil sauvegardé !", "Vos modifications ont été enregistrées avec succès.");
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      showError(
        "Erreur de sauvegarde", 
        error instanceof Error ? error.message : "Impossible de sauvegarder le profil"
      );
    }
  };

  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true);
      showInfo("Génération en cours...", "Création du QR Code pour votre menu");

      // Import dynamique de la bibliothèque qrcode
      const QRCode = await import('qrcode');

      // URL du menu du restaurant
      const menuUrl = `https://nomo.app/r/${restaurantData.slug}`;
      
      // Options pour le QR code
      const options = {
        width: 400,
        margin: 3,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M' as const,
      };

      // Générer le QR code en tant que Data URL
      const qrDataUrl = await QRCode.default.toDataURL(menuUrl, options);
      
      // Créer un lien de téléchargement
      const a = document.createElement('a');
      a.href = qrDataUrl;
      a.download = `${restaurantData.name.replace(/\s+/g, '_')}_menu_qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showSuccess(
        "QR Code téléchargé !", 
        `Le QR Code de votre menu a été généré et téléchargé avec succès.`
      );

    } catch (error) {
      console.error('Erreur génération QR Code:', error);
      showError(
        "Erreur de génération", 
        "Impossible de générer le QR Code. Vérifiez votre connexion."
      );
    } finally {
      setIsGeneratingQR(false);
    }
  };

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tight">
            Profil Restaurant
          </h1>
          <p className="text-xl text-gray-600 font-medium max-w-3xl leading-relaxed">
            Gérez les informations de votre établissement et personnalisez votre présence
          </p>
        </div>
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="px-6 py-4 rounded-2xl font-medium"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold"
              >
                <Save className="h-5 w-5 mr-2" />
                Sauvegarder
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold"
            >
              <Edit className="h-5 w-5 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Bannière et Profil */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {/* Bannière */}
          <div className="relative h-48 bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 overflow-hidden">
            {restaurantData.banner_url ? (
              <img 
                src={restaurantData.banner_url} 
                alt="Bannière restaurant" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Ajouter une bannière</p>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <Upload className="h-4 w-4 mr-2" />
              Changer Bannière
            </Button>
          </div>

          {/* Profil et informations */}
          <div className="p-6">
            <div className="flex items-start justify-between -mt-16">
              <div className="flex items-end gap-6">
                {/* Photo de profil */}
                <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-3xl p-2 shadow-xl">
                    {restaurantData.logo_url ? (
                      <img 
                        src={restaurantData.logo_url} 
                        alt="Photo restaurant" 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl text-white">
                        🏪
                      </div>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                {/* Informations */}
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-black text-gray-900">{restaurantData.name}</h2>
                    {user?.tenant?.is_active && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Actif
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 font-medium mb-3">Restaurant</p>
                  <div className="flex items-center gap-4">
                    {/* Avis retirés */}
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Ouvert
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation par onglets */}
      <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-2xl font-medium flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" 
                    : ""
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contenu selon l'onglet actif */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-gray-900">Informations de Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom du Restaurant</label>
                <input
                  type="text"
                  value={restaurantData.name}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={restaurantData.description}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                <input
                  type="text"
                  defaultValue="Restaurant"
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
                  placeholder="Ex: Restaurant, Pizzeria, Fast food..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Slug URL</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">nomo.app/r/</span>
                  <input
                    type="text"
                    value={restaurantData.slug}
                    disabled={!isEditing}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-gray-900">Contact & Localisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Adresse
                </label>
                <input
                  type="text"
                  value={restaurantData.address}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={restaurantData.phone}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={restaurantData.email}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Site Web
                </label>
                <input
                  type="url"
                  value={restaurantData.website}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-gray-900">Paiements (MyNita, Wave & Orange Money)</CardTitle>
              <CardDescription className="text-gray-600 font-medium">Ces infos seront montrées au client pour payer sans redirection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Numéro MyNita</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20" placeholder="77 000 00 00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom MyNita</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20" placeholder="Nom du compte" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Numéro Wave</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="77 000 00 00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom Wave</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Nom du compte" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Numéro Orange Money</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="77 000 00 00" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom Orange Money</label>
                  <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Nom du compte" />
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                Côté client: lors du choix du mode de paiement (MyNita, Wave, Orange Money), ces informations s’affichent pour régler manuellement.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "qr" && (
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-gray-900">QR Code de votre Menu</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Générez et téléchargez le QR code pour que vos clients accèdent directement à votre menu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="w-64 h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <QrCode className="h-32 w-32 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-sm font-bold text-gray-700 mb-2">URL de votre menu :</p>
                  <div className="flex items-center gap-2 justify-center">
                    <LinkIcon className="h-4 w-4 text-blue-600" />
                    <code className="text-blue-600 font-mono">
                      https://nomo.app/r/{restaurantData.slug}
                    </code>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={generateQRCode}
                    disabled={isGeneratingQR}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {isGeneratingQR ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-5 w-5 mr-2" />
                        Générer & Télécharger QR Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Autres onglets peuvent être ajoutés ici */}
    </div>
  );
}






