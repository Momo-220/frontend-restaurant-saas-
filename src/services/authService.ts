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
    payment_info?: {
      myNita?: {
        number: string;
        name: string;
      };
      wave?: {
        number: string;
        name: string;
      };
      orangeMoney?: {
        number: string;
        name: string;
      };
    };
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
    // Charger token et utilisateur depuis localStorage si disponibles
    if (typeof window !== 'undefined') {
      const existingUser = localStorage.getItem('nomo_user');
      const existingToken = localStorage.getItem('nomo_token');
      if (existingUser) {
        try { this.user = JSON.parse(existingUser); } catch {}
      }
      if (existingToken) {
        this.token = existingToken;
      }
    }
  }

  // Déconnexion
  logout(): void {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nomo_token');
      localStorage.removeItem('nomo_user');
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean { return !!this.token; }

  // Obtenir le token
  getToken(): string | null {
    if (typeof window !== 'undefined' && !this.token) {
      this.token = localStorage.getItem('nomo_token');
    }
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
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // Faire une requête authentifiée
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = { ...this.getAuthHeaders(), ...(options.headers || {}) };
    return fetch(url, { ...options, headers });
  }

  // Rafraîchir les données utilisateur
  async refreshUser(): Promise<User> {
    // Tente de récupérer le profil depuis l'API si token présent
    const token = this.getToken();
    if (token) {
      const res = await this.authenticatedFetch(`${this.baseURL}/auth/profile`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.user = data as User;
        if (typeof window !== 'undefined') {
          localStorage.setItem('nomo_user', JSON.stringify(this.user));
        }
        return this.user;
      }
    }
    return this.user as User;
  }

  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json().catch(() => undefined) : undefined;
      throw new Error(body?.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    this.token = data.access_token;
    this.user = data.user;

    if (typeof window !== 'undefined' && this.token) {
      localStorage.setItem('nomo_token', this.token);
      localStorage.setItem('nomo_user', JSON.stringify(this.user));
    }

    return data;
  }

  // Inscription
  async register(data: RegisterData): Promise<void> {
    const res = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json().catch(() => undefined) : undefined;
      throw new Error(body?.message || `HTTP ${res.status}: ${res.statusText}`);
    }
  }

  // Mettre à jour le profil restaurant
  async updateRestaurantProfile(data: Partial<User['tenant']>): Promise<User['tenant']> {
    if (!this.user?.tenant?.id) throw new Error('Aucun restaurant à mettre à jour');
    // Ne transmettre que les champs supportés par le backend
    const allowed: Record<string, any> = {};
    if (typeof data.name !== 'undefined') allowed.name = data.name;
    if (typeof data.slug !== 'undefined') allowed.slug = data.slug as any;
    if (typeof data.email !== 'undefined') allowed.email = data.email;
    if (typeof data.phone !== 'undefined') allowed.phone = data.phone;
    if (typeof data.address !== 'undefined') allowed.address = data.address;
    if (typeof data.description !== 'undefined') allowed.description = data.description;
    if (typeof data.website !== 'undefined') allowed.website = data.website;
    if (typeof data.logo_url !== 'undefined') allowed.logo_url = data.logo_url;
    if (typeof data.banner_url !== 'undefined') allowed.banner_url = data.banner_url;
    if (typeof data.payment_info !== 'undefined') allowed.payment_info = data.payment_info;

    const res = await this.authenticatedFetch(`${this.baseURL}/tenants/${this.user.tenant.id}`, {
      method: 'PATCH',
      body: JSON.stringify(allowed),
    });
    if (!res.ok) {
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json().catch(() => undefined) : undefined;
      throw new Error(body?.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    const updatedTenant = await res.json();
    this.user.tenant = { ...this.user.tenant, ...updatedTenant } as any;
    if (typeof window !== 'undefined') {
      localStorage.setItem('nomo_user', JSON.stringify(this.user));
    }
    return this.user.tenant;
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



