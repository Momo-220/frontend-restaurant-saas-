"use client";

import React, { useMemo, useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Search,
	Filter,
	ChefHat,
	Clock,
	ShoppingCart,
	CheckCircle2,
	XCircle,
	PackageOpen,
	Truck,
	Phone,
	MessageSquare,
	Eye,
	X,
	RefreshCw
} from "lucide-react";
// Services supprimés - à remplacer par API
// import { ordersService } from "@/services/ordersService";
// import { useOrderSync, type OrderData } from "@/services/orderSyncService";
// import RealTimeOrders from "@/components/orders/real-time-orders";

// Interface OrderData locale
interface OrderData {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  tableNumber?: string;
  items: any[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

type OrderStatus = "nouvelle" | "en_preparation" | "prete" | "livraison" | "terminee" | "annulee";
type SyncOrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled";

interface OrderItem {
	id: string;
	name: string;
	quantity: number;
	price: number;
	image?: string;
}

interface Order {
	id: string;
	code: string;
	client: string;
	phone?: string;
	createdAt: string;
	status: OrderStatus;
	items: OrderItem[];
	notes?: string;
	total: number;
	paymentMethod: "wave" | "mynita" | "cash";
	tableNumber?: string;
}

const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
	nouvelle: { label: "Nouvelle", color: "bg-blue-100 text-blue-700" },
	en_preparation: { label: "En préparation", color: "bg-yellow-100 text-yellow-700" },
	prete: { label: "Prête", color: "bg-purple-100 text-purple-700" },
	livraison: { label: "En livraison", color: "bg-amber-100 text-amber-700" },
	terminee: { label: "Terminée", color: "bg-green-100 text-green-700" },
	annulee: { label: "Annulée", color: "bg-red-100 text-red-700" },
};

function OrdersPageInner() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<OrderStatus | "tous">("tous");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(false);
	const [orders, setOrders] = useState<Order[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [highlighted, setHighlighted] = useState<Record<string, boolean>>({});
	const [toast, setToast] = useState<{ id: number; type: "success" | "error"; message: string } | null>(null);

	// Données réelles - à connecter à l'API (stabilisées)
	const syncedOrders: OrderData[] = useMemo(() => [], []);
	const syncedStats = { total: 0 };
	const updateSyncStatus = (orderId: string, status: string) => {
		console.log('Mise à jour statut:', orderId, status);
		return true;
	};

	// Fonction pour convertir les statuts sync vers dashboard
	const convertSyncStatusToDashboard = (syncStatus: SyncOrderStatus): OrderStatus => {
		switch (syncStatus) {
			case 'pending': return 'nouvelle';
			case 'confirmed': return 'nouvelle';
			case 'preparing': return 'en_preparation';
			case 'ready': return 'prete';
			case 'delivered': return 'terminee';
			case 'cancelled': return 'annulee';
			default: return 'nouvelle';
		}
	};

	// Fonction pour convertir les statuts dashboard vers sync
	const convertDashboardStatusToSync = (dashboardStatus: OrderStatus): SyncOrderStatus => {
		switch (dashboardStatus) {
			case 'nouvelle': return 'pending';
			case 'en_preparation': return 'preparing';
			case 'prete': return 'ready';
			case 'livraison': return 'ready'; // En livraison = prêt dans le système sync
			case 'terminee': return 'delivered';
			case 'annulee': return 'cancelled';
			default: return 'pending';
		}
	};

	// Fonction pour convertir les commandes synchronisées vers le format Order (stable avec useCallback)
	const convertSyncedToOrders = useCallback((syncedOrders: OrderData[]): Order[] => {
		return syncedOrders.map(order => ({
			id: order.id,
			code: order.code || order.id.replace('order_', '').substring(0, 8).toUpperCase(),
			client: order.customerName,
			phone: order.phone,
			tableNumber: order.tableNumber,
			notes: '', // Pas de notes dans OrderData
			paymentMethod: (order.paymentMethod as "cash" | "wave" | "mynita") || 'cash',
			items: order.items.map((item: any) => ({
				id: item.id,
				name: item.name,
				quantity: item.quantity,
				price: item.price,
				image: item.image
			})),
			total: order.totalAmount,
			status: convertSyncStatusToDashboard(order.status as SyncOrderStatus),
			createdAt: new Date(order.createdAt).toISOString()
		}));
	}, []); // Fonction stable

	// Init depuis l'URL
	useEffect(() => {
		const s = searchParams.get("q") || "";
		const st = (searchParams.get("status") || "tous") as OrderStatus | "tous";
		setSearch(s);
		setStatusFilter(st);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sync vers l'URL avec garde pour éviter les boucles
	useEffect(() => {
		const params = new URLSearchParams();
		if (search.trim()) params.set("q", search.trim());
		if (statusFilter !== "tous") params.set("status", statusFilter);
		const nextQs = params.toString();
		const currentQs = typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '';
		if (nextQs !== currentQs) {
			router.replace(`?${nextQs}`);
		}
	}, [router, search, statusFilter]);

	// Intégrer les commandes synchronisées dans la liste principale (avec useMemo pour éviter les boucles)
	const convertedOrders = useMemo(() => {
		const converted = convertSyncedToOrders(syncedOrders);
		console.log('🔄 Commandes synchronisées:', converted.length);
		return converted;
	}, [syncedOrders, convertSyncedToOrders]);

	// Mettre à jour les orders quand les données converties changent
	useEffect(() => {
		setOrders(convertedOrders);
		setLoading(false);
	}, [convertedOrders]);

	const loadOrders = async () => {
		setLoading(true);
		setError(null);
		try {
			// TODO: Connecter à l'API réelle
			console.log('Chargement commandes depuis API');
			setOrders([]);
		} catch (e: any) {
			setError(e?.message || "Erreur de chargement");
			setToast({ id: Date.now(), type: "error", message: e?.message || "Erreur de chargement" });
		} finally {
			setLoading(false);
		}
	};

	// Plus besoin de polling - tout est synchronisé en temps réel

	// WebSocket temps réel (si disponible)
	useEffect(() => {
		if (typeof window === "undefined") return;
		const wsBase = process.env.NEXT_PUBLIC_WS_URL;
		if (!wsBase) return;
		// TODO: Utiliser le token et tenantId depuis le contexte d'authentification
		console.log('🔐 Récupération token/tenantId depuis auth context - À implémenter');
		const token = "";
		const tenantId = "";
		try {
			const url = `${wsBase}${wsBase.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}&tenantId=${encodeURIComponent(tenantId)}`;
						const ws = new WebSocket(url);
						ws.onmessage = (ev) => {
							try {
								const data = JSON.parse(ev.data);
								if (data?.type === 'order_created' && data.payload) {
									// Les commandes WebSocket sont maintenant gérées par useOrderSync
									console.log('📡 Commande WebSocket reçue:', data.payload);
								}
								if (data?.type === 'order_updated' && data.payload) {
									console.log('📡 Mise à jour WebSocket reçue:', data.payload);
								}
							} catch {}
						};
			return () => { try { ws.close(); } catch {} };
		} catch {
			// ignore
		}
	}, []);

	const filtered = useMemo(() => {
		return orders.filter(o => {
			// Filtrer par recherche
			const matchesSearch = !search.trim() ? true : (
				o.code.toLowerCase().includes(search.toLowerCase()) ||
				o.client.toLowerCase().includes(search.toLowerCase()) ||
				(o.phone && o.phone.includes(search))
			);
			
			// Filtrer par statut
			const matchesStatus = statusFilter === "tous" ? true : o.status === statusFilter;
			
			return matchesSearch && matchesStatus;
		});
	}, [orders, search, statusFilter]);

	const updateStatus = async (orderId: string, status: OrderStatus) => {
		// Mettre à jour immédiatement l'UI
		setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
		
		try {
			// Convertir le statut pour le système de synchronisation
			const syncStatus = convertDashboardStatusToSync(status);
			const success = updateSyncStatus(orderId, syncStatus);
			
			if (success) {
				setToast({ id: Date.now(), type: "success", message: "Statut mis à jour avec succès" });
				// Mettre en surbrillance la commande mise à jour
				setHighlighted(prev => ({ ...prev, [orderId]: true }));
				setTimeout(() => {
					setHighlighted(prev => ({ ...prev, [orderId]: false }));
				}, 2000);
			} else {
				throw new Error("Échec de la mise à jour");
			}
		} catch (e) {
			// Recharger les commandes en cas d'erreur
			const convertedOrders = convertSyncedToOrders(syncedOrders);
			setOrders(convertedOrders);
			setToast({ id: Date.now(), type: "error", message: "Erreur lors de la mise à jour du statut" });
		}
	};

	const statusButton = (key: OrderStatus | "tous", icon: React.ReactNode) => (
		<Button
			key={key}
			variant={statusFilter === key ? "default" : "outline"}
			onClick={() => setStatusFilter(key)}
			className={`rounded-2xl ${statusFilter === key ? "bg-[#112319] hover:bg-[#112319]" : ""}`}
		>
			{icon}
			<span className="ml-2 font-medium">{key === "tous" ? "Tous" : STATUS_META[key].label}</span>
		</Button>
	);

	return (
		<div className="space-y-8 p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
			{/* En-tête */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tight">Commandes</h1>
					<p className="text-xl text-gray-600 font-medium max-w-3xl leading-relaxed">
						Gérez vos commandes en temps réel: préparation, statut, livraison et paiement.
					</p>
				</div>
				<div className="flex gap-3">
					<Button variant="outline" className="rounded-2xl" onClick={loadOrders} disabled={loading}>
						<RefreshCw className="h-4 w-4 mr-2" /> {loading ? "Chargement..." : "Rafraîchir"}
					</Button>
					{/* Bouton nouvelle livraison retiré */}
				</div>
			</div>

			{/* Section commandes en temps réel - À connecter */}
			{/* Section temps réel masquée pour les restaurants */}

			{/* Filtres */}
			<Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
						<div className="relative w-full md:max-w-md">
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder="Rechercher par code ou client..."
								className="w-full px-4 py-3 pl-11 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
							/>
							<div className="absolute inset-y-0 left-0 flex items-center pl-4">
								<Search className="h-5 w-5 text-gray-400" />
							</div>
						</div>

						<div className="flex flex-wrap gap-2">
							{statusButton("tous", <Filter className="h-4 w-4" />)}
							{statusButton("nouvelle", <ShoppingCart className="h-4 w-4" />)}
							{statusButton("en_preparation", <ChefHat className="h-4 w-4" />)}
							{statusButton("prete", <CheckCircle2 className="h-4 w-4" />)}
							{statusButton("livraison", <Truck className="h-4 w-4" />)}
							{statusButton("terminee", <CheckCircle2 className="h-4 w-4" />)}
							{statusButton("annulee", <XCircle className="h-4 w-4" />)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Erreur */}
			{error && (
				<Card className="bg-red-50 border-0 rounded-2xl">
					<CardContent className="text-red-700 text-sm">{error}</CardContent>
				</Card>
			)}

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				{[
					{ title: "Nouvelles", value: orders.filter(o => o.status === "nouvelle").length, icon: <ShoppingCart className="h-5 w-5 text-white" />, grad: "from-blue-400 to-blue-600" },
					{ title: "En préparation", value: orders.filter(o => o.status === "en_preparation").length, icon: <ChefHat className="h-5 w-5 text-white" />, grad: "from-yellow-400 to-yellow-600" },
					{ title: "Prêtes", value: orders.filter(o => o.status === "prete").length, icon: <PackageOpen className="h-5 w-5 text-white" />, grad: "from-purple-400 to-purple-600" },
					{ title: "Terminées", value: orders.filter(o => o.status === "terminee").length, icon: <CheckCircle2 className="h-5 w-5 text-white" />, grad: "from-green-400 to-green-600" },
				].map((s, idx) => (
					<Card key={idx} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
						<CardContent className="p-6 flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">{s.title}</p>
								<p className="text-3xl font-black text-gray-900">{s.value}</p>
							</div>
							<div className={`w-12 h-12 bg-gradient-to-br ${s.grad} rounded-2xl flex items-center justify-center`}>{s.icon}</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Liste des commandes */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Colonne liste */}
				<Card className="lg:col-span-2 bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
					<CardHeader className="pb-2">
						<CardTitle className="text-xl font-bold">Commandes</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y divide-gray-100">
							{loading && <div className="p-6 text-sm text-gray-500">Chargement...</div>}
							{filtered.map(order => (
								<div key={order.id} className={`p-5 transition-all flex items-start justify-between ${highlighted[order.id] ? "bg-green-50" : "hover:bg-gray-50"}`}>
									<div>
										<div className="flex items-center gap-3 mb-1">
											<span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
											<Badge className={`${STATUS_META[order.status].color} rounded-xl`}>{STATUS_META[order.status].label}</Badge>
										</div>
										<p className="text-lg font-semibold text-gray-900">#{order.code} • {order.client}</p>
										{order.phone && <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="h-3 w-3" /> {order.phone}</p>}
										{order.tableNumber && <p className="text-sm text-gray-500">Table: {order.tableNumber}</p>}
										<p className="text-sm text-gray-600">{order.items.map(i => `${i.quantity}× ${i.name}`).join(", ")}</p>
									</div>
									<div className="flex items-center gap-2">
										<div className="text-right mr-3">
											<p className="text-lg font-bold text-green-600">{order.total.toLocaleString()} FCFA</p>
											<p className="text-xs text-gray-500">{order.paymentMethod.toUpperCase()}</p>
										</div>
										<Button variant="ghost" className="rounded-xl" onClick={() => setSelectedOrder(order)}>
											<Eye className="h-4 w-4" />
										</Button>
										<Button variant="outline" className="rounded-xl" onClick={() => updateStatus(order.id, "en_preparation")} disabled={loading}>Préparer</Button>
										<Button variant="outline" className="rounded-xl" onClick={() => updateStatus(order.id, "prete")} disabled={loading}>Prête</Button>
										<Button variant="outline" className="rounded-xl" onClick={() => updateStatus(order.id, "livraison")} disabled={loading}>Livrer</Button>
										<Button variant="ghost" className="rounded-xl text-red-600" onClick={() => updateStatus(order.id, "annulee")} disabled={loading}>Annuler</Button>
									</div>
								</div>
							))}
							{!loading && filtered.length === 0 && (
								<div className="p-10 text-center text-gray-500">Aucune commande trouvée.</div>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Colonne détails */}
				<Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl">
					<CardHeader className="pb-2">
						<CardTitle className="text-xl font-bold">Détails</CardTitle>
					</CardHeader>
					<CardContent>
						{selectedOrder ? (
							<div className="space-y-5">
								<div className="flex items-center justify-between">
									<p className="text-lg font-bold">#{selectedOrder.code}</p>
									<Badge className={`${STATUS_META[selectedOrder.status].color} rounded-xl`}>{STATUS_META[selectedOrder.status].label}</Badge>
								</div>
								<p className="text-sm text-gray-600">Client: {selectedOrder.client}</p>
								{selectedOrder.phone && (
									<p className="text-sm text-gray-600 flex items-center gap-2"><Phone className="h-4 w-4" /> {selectedOrder.phone}</p>
								)}
								{selectedOrder.tableNumber && (
									<p className="text-sm text-gray-600">Table: {selectedOrder.tableNumber}</p>
								)}
								<p className="text-sm text-gray-600 flex items-center gap-2"><Clock className="h-4 w-4" /> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
								<p className="text-sm text-gray-600">Paiement: {selectedOrder.paymentMethod.toUpperCase()}</p>

								<div className="border rounded-2xl p-4">
									<p className="font-semibold mb-2">Articles ({selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)})</p>
									<div className="space-y-2">
										{selectedOrder.items.map(item => (
											<div key={item.id} className="flex items-center justify-between text-sm">
												<div className="flex items-center gap-2">
													{item.image && <span className="text-lg">{item.image}</span>}
													<span>{item.quantity}× {item.name}</span>
												</div>
												<span className="font-semibold">{(item.price * item.quantity).toLocaleString()} FCFA</span>
											</div>
										))}
										<div className="flex items-center justify-between pt-2 border-t">
											<span className="text-sm text-gray-600">Total</span>
											<span className="text-lg font-black">{selectedOrder.total.toLocaleString()} FCFA</span>
										</div>
									</div>
								</div>

								{selectedOrder.notes && (
									<div className="border rounded-2xl p-4 bg-blue-50">
										<p className="font-semibold mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Notes</p>
										<p className="text-sm text-gray-700">{selectedOrder.notes}</p>
									</div>
								)}

								<div className="flex flex-wrap gap-2">
									<Button className="rounded-xl bg-[#112319] hover:bg-[#112319]" onClick={() => updateStatus(selectedOrder.id, "en_preparation")} disabled={loading}>Passer en préparation</Button>
									<Button variant="outline" className="rounded-xl" onClick={() => updateStatus(selectedOrder.id, "prete")} disabled={loading}>Marquer prête</Button>
									<Button variant="outline" className="rounded-xl" onClick={() => updateStatus(selectedOrder.id, "livraison")} disabled={loading}>Envoyer en livraison</Button>
									<Button variant="ghost" className="rounded-xl text-red-600" onClick={() => updateStatus(selectedOrder.id, "annulee")} disabled={loading}>Annuler</Button>
								</div>
							</div>
						) : (
							<div className="text-gray-500 text-sm">Sélectionnez une commande pour voir les détails.</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Toast minimal */}
			{toast && (
				<div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg border text-sm ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
					<div className="flex items-center gap-3">
						<div className={`w-2 h-2 rounded-full ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}></div>
						<span>{toast.message}</span>
						<button className="ml-2 text-gray-400 hover:text-gray-600" onClick={() => setToast(null)}>×</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Chargement...</div>}>
      <OrdersPageInner />
    </Suspense>
  );
}








