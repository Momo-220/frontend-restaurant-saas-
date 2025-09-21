// Service d'authentification pour NOMO - Backend NestJS
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
    // Configuration de l'URL de base - Backend NestJS
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-de-restaurant-saas-production.up.railway.app';
    // S'assurer que l'URL se termine par /api/v1
    if (!this.baseURL.includes('/api/v1')) {
      this.baseURL = this.baseURL.replace(/\/$/, '') + '/api/v1';
    }
    
    console.log('🔧 AuthService initialized with baseURL:', this.baseURL);
    
    // Initialiser depuis localStorage si disponible
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('nomo_token');
      const storedUser = localStorage.getItem('nomo_user');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
        } catch (e) {
          console.warn('Erreur parsing user localStorage:', e);
        }
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

  setToken(token: string): void {
    this.token = token;
  }

  setUser(user: User): void {
    this.user = user;
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
    const token = this.getToken();
    if (!token) {
      throw new Error('Aucun token d\'authentification');
    }

    try {
      // Timeout de 5 secondes pour éviter que ça traîne
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await this.authenticatedFetch(`${this.baseURL}/auth/profile`, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        if (res.status === 401) {
          // Token expiré ou invalide
          this.logout();
          throw new Error('Token d\'authentification expiré');
        }
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      this.user = data as User;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('nomo_user', JSON.stringify(this.user));
      }
      
      return this.user;
    } catch (error) {
      console.error('Erreur refresh user:', error);
      
      // Si c'est un timeout ou une erreur réseau, garder l'utilisateur en cache
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.warn('Timeout ou erreur réseau, utilisation du cache utilisateur');
        return this.user as User;
      }
      
      this.logout();
      throw error;
    }
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

    // Sauvegarder en localStorage
    if (typeof window !== 'undefined' && this.token) {
      localStorage.setItem('nomo_token', this.token);
      localStorage.setItem('nomo_user', JSON.stringify(this.user));
      
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('auth-login-success', { 
        detail: { user: this.user, token: this.token } 
      }));
    }

    return data;
  }

  // Inscription
  async register(data: RegisterData): Promise<AuthResponse> {
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

    const authData = await res.json();
    this.token = authData.access_token;
    this.user = authData.user;

    // Sauvegarder en localStorage
    if (typeof window !== 'undefined' && this.token) {
      localStorage.setItem('nomo_token', this.token);
      localStorage.setItem('nomo_user', JSON.stringify(this.user));
    }

    return authData;
  }

  // Mettre à jour le profil restaurant
  async updateRestaurantProfile(data: Partial<User['tenant']>): Promise<User['tenant']> {
    if (!this.user?.tenant?.id) throw new Error('Aucun restaurant à mettre à jour');
    
    // Ne transmettre que les champs supportés par le backend
    const allowed: Record<string, any> = {};
    if (typeof data.name !== 'undefined') allowed.name = data.name;
    if (typeof data.slug !== 'undefined') allowed.slug = data.slug;
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
    this.user.tenant = { ...this.user.tenant, ...updatedTenant };
    
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
    
    // Vérifier l'authentification seulement côté client
    if (typeof window !== 'undefined') {
      const checkAuth = () => {
        const currentUser = authService.getUser();
        const currentToken = authService.getToken();
        
        // Si on a déjà un utilisateur en cache, l'utiliser directement
        if (currentUser) {
          setUser(currentUser);
          setIsLoading(false);
          return;
        }
        
        // Si on a un token mais pas d'utilisateur, essayer de récupérer le profil
        if (currentToken && !currentUser) {
          // Vérifier d'abord si on a un utilisateur en localStorage
          const storedUser = localStorage.getItem('nomo_user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              authService.setUser(parsedUser);
              setUser(parsedUser);
              setIsLoading(false);
              return;
            } catch (e) {
              console.warn('Erreur parsing user localStorage:', e);
            }
          }
          
          // Sinon, essayer de récupérer depuis l'API
          authService.refreshUser().then((user) => {
            setUser(user);
            setIsLoading(false);
          }).catch(() => {
            // Token invalide, déconnecter
            authService.logout();
            setUser(null);
            setIsLoading(false);
          });
        } else {
          setUser(currentUser);
          setIsLoading(false);
        }
      };

      checkAuth();
      
      // Écouter les changements de localStorage
      window.addEventListener('storage', checkAuth);
      
      return () => {
        window.removeEventListener('storage', checkAuth);
      };
    } else {
      // Côté serveur, pas de chargement
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      
      // Déclencher un événement pour notifier les autres composants
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth-state-changed', { 
          detail: { user: result.user, isAuthenticated: true } 
        }));
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(data);
      // Mettre à jour l'utilisateur après inscription
      setUser(result.user);
      return result;
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



