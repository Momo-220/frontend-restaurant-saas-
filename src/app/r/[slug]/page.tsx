"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  Phone,
  Clock,
  Star,
  Utensils,
  QrCode,
  Share2
} from "lucide-react";
import Link from "next/link";

export default function RestaurantPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données du restaurant
    const mockRestaurant = {
      name: "Le Gourmet",
      slug: slug,
      description: "Restaurant français moderne avec une cuisine raffinée",
      address: "123 Avenue des Champs-Élysées, Paris",
      phone: "+33 1 42 65 00 00",
      rating: 4.8,
      totalReviews: 247,
      isOpen: true,
      openingHours: {
        monday: "12:00 - 14:30, 19:00 - 22:30",
        tuesday: "12:00 - 14:30, 19:00 - 22:30",
        wednesday: "12:00 - 14:30, 19:00 - 22:30",
        thursday: "12:00 - 14:30, 19:00 - 22:30",
        friday: "12:00 - 14:30, 19:00 - 23:00",
        saturday: "12:00 - 14:30, 19:00 - 23:00",
        sunday: "12:00 - 14:30, 19:00 - 22:00"
      }
    };

    setRestaurant(mockRestaurant);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
            🍽️
          </div>
          <p className="text-gray-600 font-medium">Chargement du restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4">
            ❌
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant non trouvé</h1>
          <p className="text-gray-600">Le restaurant que vous cherchez n'existe pas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header du restaurant */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold text-gray-900">{restaurant.name}</h1>
                {restaurant.isOpen ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Ouvert
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 border-red-200">
                    Fermé
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                {restaurant.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-bold text-gray-900">{restaurant.rating}</span>
                  <span>({restaurant.totalReviews} avis)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>{restaurant.address}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span>{restaurant.phone}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 ml-6">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Actions principales */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                Voir le Menu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Découvrez notre carte complète avec tous nos plats, boissons et desserts.
              </p>
              <Link href={`/r/${slug}/menu`}>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  Consulter le Menu
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                Menu QR Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Scannez le QR Code pour accéder directement au menu depuis votre téléphone.
              </p>
              <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <QrCode className="h-16 w-16 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Horaires d'ouverture */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-gray-600" />
              Horaires d'ouverture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(restaurant.openingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-900 capitalize">{day}</span>
                  <span className="text-gray-600">{hours as string}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


