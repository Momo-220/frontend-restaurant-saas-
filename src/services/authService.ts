// Service d'authentification pour NOMO
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant_id: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo_url?: string;
    banner_url?: string;
    is_active: boolean;
  };
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  tenant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;
  private baseURL: string;

  constructor() {
    // Configuration de l'URL de base
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-de-restaurant-saas-production.up.railway.app';
    if (!this.baseURL.endsWith('/api/v1')) {
      this.baseURL += '/api/v1';
    }
    // Mode sans authentification: définir un utilisateur par défaut en local
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem('nomo_user');
      if (existing) {
        try { this.user = JSON.parse(existing); } catch {}
      }
      if (!this.user) {
        this.user = {
          id: 'demo-user',
          email: 'demo@nomo.app',
          first_name: 'Nomo',
          last_name: 'Demo',
          role: 'ADMIN',
          tenant_id: 'demo-tenant',
          tenant: {
            id: 'demo-tenant',
            name: 'Restaurant Démo',
            slug: 'restaurant-demo',
            is_active: true,
          }
        } as User;
        localStorage.setItem('nomo_user', JSON.stringify(this.user));
      }
    }
  }

  // Valider le token côté serveur
  private async validateToken() { return; }

  // Connexion
  async login(_credentials: LoginCredentials): Promise<AuthResponse> {
    // Mode sans auth: retourner l'utilisateur local
    const user = this.user as User;
    return { access_token: 'demo-token', user };
  }

  // Inscription
  async register(_data: RegisterData): Promise<void> {
    // Mode sans auth: ne rien faire
    return;
  }

  // Déconnexion
  logout(): void {
    // Mode sans auth: ne rien faire, conserver l'utilisateur démo
    return;
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean { return true; }

  // Obtenir le token
  getToken(): string | null {
    return this.token;
  }

  // Obtenir l'utilisateur
  getUser(): User | null {
    return this.user;
  }

  // Obtenir les headers d'authentification
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    headers['X-Tenant-Id'] = this.user?.tenant?.id || 'demo-tenant';
    return headers;
  }

  // Faire une requête authentifiée
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = { ...this.getAuthHeaders(), ...(options.headers || {}) };
    return fetch(url, { ...options, headers });
  }

  // Rafraîchir les données utilisateur
  async refreshUser(): Promise<User> {
    return this.user as User;
  }

  // Mettre à jour le profil restaurant
  async updateRestaurantProfile(data: Partial<User['tenant']>): Promise<User['tenant']> {
    // Mode sans auth: mise à jour locale uniquement
    if (this.user) {
      this.user.tenant = { ...this.user.tenant, ...(data as any) };
      if (typeof window !== 'undefined') {
        localStorage.setItem('nomo_user', JSON.stringify(this.user));
      }
      return this.user.tenant;
    }
    throw new Error('Utilisateur démo non initialisé');
  }
}

// Instance singleton
export const authService = new AuthService();

// Hook React pour utiliser l'authentification
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Écouter les changements d'authentification seulement côté client
    const checkAuth = () => {
      setUser(authService.getUser());
    };

    // Vérifier l'état initial seulement côté client
    if (typeof window !== 'undefined') {
      checkAuth();
      setIsLoading(false);
      
      // Écouter les changements de localStorage
      window.addEventListener('storage', checkAuth);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', checkAuth);
      }
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await authService.register(data);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User['tenant']>) => {
    setIsLoading(true);
    try {
      const updatedTenant = await authService.updateRestaurantProfile(data);
      if (user) {
        setUser({ ...user, tenant: updatedTenant });
      }
      return updatedTenant;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading: isLoading || !isMounted,
    isAuthenticated: !!user && isMounted,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: async () => {
      setIsLoading(true);
      try {
        const updatedUser = await authService.refreshUser();
        setUser(updatedUser);
        return updatedUser;
      } finally {
        setIsLoading(false);
      }
    },
  };
}



