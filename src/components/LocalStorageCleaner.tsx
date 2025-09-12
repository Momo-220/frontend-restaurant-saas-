"use client";

import { useEffect, useState } from 'react';

export default function LocalStorageCleaner() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined' && window.localStorage) {
      // Clés spécifiques à supprimer
      const keysToRemove = [
        'nomo_menu_default',
        'nomo_menu_sections_default',
        'nomo_orders_default',
        'nomo_order_stats_default',
        'nomo_payments_default',
        'nomo_payment_stats_default',
        'nomo_analytics_default',
        'restaurant_profile',
        'menu_items',
        'orders',
        'payments',
        'analytics',
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Supprimer toutes les clés qui commencent par 'nomo_' (sauf token et user)
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('nomo_') && !key.includes('token') && !key.includes('user')) {
          localStorage.removeItem(key);
        }
      });

      console.log('🧹 Anciennes données localStorage supprimées - App maintenant 100% base de données');
      
      // DÉBOGAGE : Vider aussi les tokens d'authentification si invalides
      const token = localStorage.getItem('nomo_token');
      if (token) {
        console.log('🔐 Token d\'authentification détecté - Validation en cours...');
        // Le service d'authentification se chargera de valider le token
      }
    }
  }, [isMounted]);

  return null;
}

