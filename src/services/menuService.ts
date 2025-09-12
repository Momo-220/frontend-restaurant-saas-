// Service pour la gestion des menus - Intégration Backend NOMO
export interface Menu {
	id: number;
	name: string;
	description: string;
	price: number;
	category: string;
	image?: string;
	status: 'Disponible' | 'Indisponible' | 'En rupture';
	preparationTime: string;
	rating: number;
	orders: number;
	restaurantId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateMenuRequest {
	name: string;
	description: string;
	price: number;
	category: string;
	image?: string;
	preparationTime: string;
}

export interface UpdateMenuRequest extends Partial<CreateMenuRequest> {
	status?: 'Disponible' | 'Indisponible' | 'En rupture';
}

class MenuService {
	private baseUrl: string;
	private tenantId: string;

	constructor() {
		// Configuration depuis les variables d'environnement
		// Utilise le proxy Next.js en développement pour éviter CORS
		if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('192.168'))) {
			this.baseUrl = '/api/v1'; // Proxy Next.js
		} else {
			const raw = (process.env.NEXT_PUBLIC_API_URL || 'https://backend-de-restaurant-saas-production.up.railway.app').replace(/\/$/, '');
			this.baseUrl = raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
		}
		this.tenantId = '';
	}

	private async parseOrThrow(response: Response) {
		if (!response.ok) {
			let details = '';
			try { details = await response.text(); } catch {}
			throw new Error(`Erreur ${response.status}: ${response.statusText}${details ? ` – ${details}` : ''}`);
		}
		try { return await response.json(); } catch { return null as any; }
	}

	// Définir le tenant ID (restaurant connecté)
	setTenantId(tenantId: string) {
		this.tenantId = tenantId;
	}

	// Headers d'authentification et multi-tenancy
	private getHeaders(): HeadersInit {
		// Pour JSON
		const base = this.getAuthHeaders();
		return { ...base, 'Content-Type': 'application/json' };
	}

	// Headers sans Content-Type (laisse le navigateur définir pour FormData)
	private getAuthHeaders(): HeadersInit {
		if (typeof window === 'undefined') return {};
		// TODO: Utiliser le token et tenant depuis le contexte d'authentification
		console.log('🔐 Récupération token/tenant depuis auth context - À implémenter');
		const token = '';
		const tenant = this.tenantId || '';
		const headers: HeadersInit = {};
		if (token) headers['Authorization'] = `Bearer ${token}`;
		if (tenant) headers['X-Tenant-Id'] = tenant;
		return headers;
	}

	// Récupérer tous les menus du restaurant
	async getMenus(): Promise<Menu[]> {
		const response = await fetch(`${this.baseUrl}/menus`, {
			method: 'GET',
			headers: this.getHeaders(),
		});
		return this.parseOrThrow(response);
	}

	// Récupérer un menu par ID
	async getMenuById(id: number): Promise<Menu> {
		const response = await fetch(`${this.baseUrl}/menus/${id}`, {
			method: 'GET',
			headers: this.getHeaders(),
		});
		return this.parseOrThrow(response);
	}

	// Créer un nouveau menu
	async createMenu(menuData: CreateMenuRequest): Promise<Menu> {
		const response = await fetch(`${this.baseUrl}/menus`, {
			method: 'POST',
			headers: this.getHeaders(),
			body: JSON.stringify(menuData),
		});
		return this.parseOrThrow(response);
	}

	// Créer un menu avec image (multipart/form-data)
	async createMenuFormData(form: FormData): Promise<Menu> {
		const response = await fetch(`${this.baseUrl}/menus`, {
			method: 'POST',
			headers: this.getAuthHeaders(),
			body: form,
		});
		return this.parseOrThrow(response);
	}

	// Mettre à jour un menu
	async updateMenu(id: number, menuData: UpdateMenuRequest): Promise<Menu> {
		const response = await fetch(`${this.baseUrl}/menus/${id}`, {
			method: 'PATCH',
			headers: this.getHeaders(),
			body: JSON.stringify(menuData),
		});
		return this.parseOrThrow(response);
	}

	// Mettre à jour un menu avec image (multipart/form-data)
	async updateMenuFormData(id: number, form: FormData): Promise<Menu> {
		const response = await fetch(`${this.baseUrl}/menus/${id}`, {
			method: 'PATCH',
			headers: this.getAuthHeaders(),
			body: form,
		});
		return this.parseOrThrow(response);
	}

	// Supprimer un menu
	async deleteMenu(id: number): Promise<void> {
		const response = await fetch(`${this.baseUrl}/menus/${id}`, {
			method: 'DELETE',
			headers: this.getHeaders(),
		});
		if (!response.ok) { throw new Error(`Erreur ${response.status}: ${response.statusText}`); }
	}

	// Récupérer les menus par catégorie
	async getMenusByCategory(category: string): Promise<Menu[]> {
		const response = await fetch(`${this.baseUrl}/menus?category=${encodeURIComponent(category)}`, {
			method: 'GET',
			headers: this.getHeaders(),
		});
		return this.parseOrThrow(response);
	}

	// Rechercher des menus
	async searchMenus(query: string): Promise<Menu[]> {
		const response = await fetch(`${this.baseUrl}/menus/search?q=${encodeURIComponent(query)}`, {
			method: 'GET',
			headers: this.getHeaders(),
		});
		return this.parseOrThrow(response);
	}

	// Mettre à jour le statut d'un menu
	async updateMenuStatus(id: number, status: 'Disponible' | 'Indisponible' | 'En rupture'): Promise<Menu> {
		return this.updateMenu(id, { status });
	}

	// Récupérer les statistiques des menus
	async getMenuStats(): Promise<{
		totalMenus: number;
		totalOrders: number;
		totalRevenue: number;
		averageRating: number;
	}> {
		const response = await fetch(`${this.baseUrl}/menus/stats`, {
			method: 'GET',
			headers: this.getHeaders(),
		});
		return this.parseOrThrow(response);
	}
}

// Instance singleton du service
export const menuService = new MenuService();

// Hook personnalisé pour utiliser le service (pour React)
export const useMenuService = () => {
	return {
		getMenus: menuService.getMenus.bind(menuService),
		getMenuById: menuService.getMenuById.bind(menuService),
		createMenu: menuService.createMenu.bind(menuService),
		updateMenu: menuService.updateMenu.bind(menuService),
		deleteMenu: menuService.deleteMenu.bind(menuService),
		getMenusByCategory: menuService.getMenusByCategory.bind(menuService),
		searchMenus: menuService.searchMenus.bind(menuService),
		updateMenuStatus: menuService.updateMenuStatus.bind(menuService),
		getMenuStats: menuService.getMenuStats.bind(menuService),
		setTenantId: menuService.setTenantId.bind(menuService),
	};
};



