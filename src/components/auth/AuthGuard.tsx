"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/authService';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Écouter les changements d'état d'authentification
    const handleAuthChange = () => {
      // Forcer une re-vérification
      if (user && !isLoading) {
        // L'utilisateur est connecté, pas besoin de rediriger
      }
    };

    const handleLoginSuccess = () => {
      // Forcer le re-render en vérifiant localStorage
      const token = localStorage.getItem('nomo_token');
      const storedUser = localStorage.getItem('nomo_user');
      
      if (token && storedUser) {
        // L'utilisateur vient de se connecter, forcer la mise à jour
        window.location.reload();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-state-changed', handleAuthChange);
      window.addEventListener('auth-login-success', handleLoginSuccess);
      
      return () => {
        window.removeEventListener('auth-state-changed', handleAuthChange);
        window.removeEventListener('auth-login-success', handleLoginSuccess);
      };
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      // Délai plus long pour laisser le temps à l'état de se mettre à jour
      const timeoutId = setTimeout(() => {
        // Vérifier une dernière fois avant de rediriger
        const token = localStorage.getItem('nomo_token');
        const storedUser = localStorage.getItem('nomo_user');
        
        if (!token || !storedUser) {
          router.push('/auth/login');
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isMounted, isLoading, user, router]);

  // Afficher un loader pendant la vérification
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur après vérification, ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export function PublicGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

