"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrderSync, type OrderData } from "@/services/tempServices";
import { Bell, Clock, Phone, User } from "lucide-react";

interface RealTimeOrdersProps {
  onNewOrder?: (order: OrderData) => void;
}

export default function RealTimeOrders({ onNewOrder }: RealTimeOrdersProps) {
  const { orders, stats, updateOrderStatus } = useOrderSync();
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Détecter les nouvelles commandes
  useEffect(() => {
    const pendingOrders = orders.filter(order => order.status === 'pending');
    if (pendingOrders.length > newOrdersCount) {
      const newOrders = pendingOrders.slice(newOrdersCount);
      newOrders.forEach(order => {
        onNewOrder?.(order);
        // Notification sonore (optionnel)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Nouvelle commande !', {
            body: `Commande de ${order.customerName} - ${order.total.toLocaleString()} FCFA`,
            icon: '🍽️'
          });
        }
      });
    }
    setNewOrdersCount(pendingOrders.length);
  }, [orders, newOrdersCount, onNewOrder]);

  // Demander la permission pour les notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Commandes en temps réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            En attente de nouvelles commandes...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Nouvelles Commandes ({stats.pendingOrders})
          {stats.pendingOrders > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">
              {stats.pendingOrders} nouvelle{stats.pendingOrders > 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders
          .filter(order => order.status === 'pending')
          .slice(0, 5) // Afficher seulement les 5 plus récentes
          .map((order) => (
            <div key={order.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {order.customerName}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {order.customerPhone}
                  </p>
                  {order.tableNumber && (
                    <p className="text-sm text-gray-600">
                      Table: {order.tableNumber}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">
                    {order.total.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>⏱️</span>
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Articles ({order.items.reduce((sum, item) => sum + item.quantity, 0)}) :
                </p>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Confirmer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  En préparation
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Refuser
                </Button>
              </div>
            </div>
          ))}

        {orders.filter(order => order.status === 'pending').length > 5 && (
          <p className="text-center text-sm text-gray-500">
            ... et {orders.filter(order => order.status === 'pending').length - 5} autre(s) commande(s)
          </p>
        )}
      </CardContent>
    </Card>
  );
}



