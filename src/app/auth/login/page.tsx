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
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useGlobalToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showError("Champs requis", "Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const ct = res.headers.get("content-type") || "";
      const hasJson = ct.includes("application/json");
      const data = hasJson ? await res.json().catch(() => undefined) : undefined;
      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      if (data?.access_token && data?.user) {
        localStorage.setItem("nomo_token", data.access_token);
        localStorage.setItem("nomo_user", JSON.stringify(data.user));
      }
      showSuccess("Connexion réussie !", `Bienvenue ${data?.user?.tenant?.name || "sur NOMO"}`);
      router.push("/dashboard");
    } catch (error) {
      console.error("Erreur login:", error);
      showError("Erreur de connexion", error instanceof Error ? error.message : "Vérifiez vos identifiants");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
                <Link href="/auth/register">
                  <Button className="bg-black hover:bg-gray-800 text-white">
                    S'inscrire
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'serif', fontWeight: 300 }}>
                Connexion
              </h1>
              <p className="text-xl text-gray-600">Accédez à votre tableau de bord restaurant</p>
            </div>

            <Card className="bg-white border-2 border-gray-200 rounded-3xl shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Adresse email</Label>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</Label>
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
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Connexion...
                      </>
                    ) : (
                      "Se connecter"
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Pas encore de compte ?{" "}
                    <Link href="/auth/register" className="text-black hover:text-gray-700 font-semibold">
                      Créer un compte
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