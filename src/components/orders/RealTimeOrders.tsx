"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  Clock,
  ShoppingCart,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Phone,
  User,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { useGlobalToast } from "@/hooks/useGlobalToast";
import { ordersService, type Order } from "@/services/ordersService";
import { useAuth } from "@/services/authService";

interface RealTimeOrdersProps {
  onNewOrder?: (order: Order) => void;
  onOrderUpdate?: (order: Order) => void;
}

export default function RealTimeOrders({ onNewOrder, onOrderUpdate }: RealTimeOrdersProps) {
  const { user } = useAuth();
  const { showSuccess, showInfo } = useGlobalToast();
  
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  // Initialiser l'audio pour les notifications
  useEffect(() => {
    // Créer un son de notification simple
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNotificationSound = () => {
      if (!soundEnabled) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    audioRef.current = { play: playNotificationSound } as any;
  }, [soundEnabled]);

  // Connecter au WebSocket
  const connectWebSocket = () => {
    if (!user?.tenant_id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    const ws = new WebSocket(`${wsUrl}/orders/${user.tenant_id}`);

    ws.onopen = () => {
      console.log('✅ WebSocket connecté');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      setLastActivity(new Date());
      
      // Envoyer un ping initial
      ws.send(JSON.stringify({ type: 'ping', tenant_id: user.tenant_id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastActivity(new Date());
        
        switch (data.type) {
          case 'new_order':
            console.log('🔔 Nouvelle commande reçue:', data.order);
            setNewOrdersCount(prev => prev + 1);
            
            // Son de notification
            if (audioRef.current && soundEnabled) {
              audioRef.current.play();
            }
            
            // Notification toast
            showInfo(
              '🛎️ Nouvelle commande !', 
              `${data.order.customer_name} - ${data.order.total_amount.toLocaleString('fr-FR')} FCFA`
            );
            
            // Callback
            if (onNewOrder) {
              onNewOrder(data.order);
            }
            break;
            
          case 'order_updated':
            console.log('📝 Commande mise à jour:', data.order);
            
            // Callback
            if (onOrderUpdate) {
              onOrderUpdate(data.order);
            }
            break;
            
          case 'pong':
            // Réponse au ping
            console.log('🏓 WebSocket pong reçu');
            break;
            
          default:
            console.log('📨 Message WebSocket:', data);
        }
      } catch (error) {
        console.error('❌ Erreur parsing WebSocket:', error);
      }
    };

    ws.onclose = () => {
      console.log('❌ WebSocket déconnecté');
      setIsConnected(false);
      
      // Tentative de reconnexion
      if (reconnectAttempts.current < 5) {
        const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Backoff exponentiel
        console.log(`🔄 Tentative de reconnexion dans ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connectWebSocket();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ Erreur WebSocket:', error);
    };

    wsRef.current = ws;
  };

  // Effet pour la connexion WebSocket
  useEffect(() => {
    if (user?.tenant_id) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user?.tenant_id]);

  // Ping périodique pour maintenir la connexion
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ 
          type: 'ping', 
          tenant_id: user?.tenant_id 
        }));
      }
    }, 30000); // Ping toutes les 30 secondes

    return () => clearInterval(pingInterval);
  }, [user?.tenant_id]);

  // Marquer les nouvelles commandes comme vues
  const markAsViewed = () => {
    setNewOrdersCount(0);
  };

  // Reconnexion manuelle
  const handleReconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectAttempts.current = 0;
    connectWebSocket();
  };

  if (!user) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Statut de connexion */}
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-semibold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                {isConnected ? 'Temps réel actif' : 'Déconnecté'}
              </span>
            </div>
            
            {/* Compteur de nouvelles commandes */}
            {newOrdersCount > 0 && (
              <Badge 
                className="bg-red-500 text-white font-black animate-bounce cursor-pointer"
                onClick={markAsViewed}
              >
                <Bell className="h-3 w-3 mr-1" />
                {newOrdersCount} nouvelle{newOrdersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Toggle son */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={soundEnabled ? 'text-blue-600' : 'text-gray-400'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            {/* Reconnexion manuelle */}
            {!isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Reconnecter
              </Button>
            )}

            {/* Dernière activité */}
            {lastActivity && (
              <span className="text-xs text-gray-500">
                {lastActivity.toLocaleTimeString('fr-FR')}
              </span>
            )}
          </div>
        </div>

        {/* Message informatif */}
        <div className="mt-3 text-sm text-blue-700">
          {isConnected ? (
            <span>🔔 Vous recevrez les nouvelles commandes instantanément</span>
          ) : (
            <span>⚠️ Reconnexion en cours... Les commandes peuvent avoir du retard</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
