"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/authService';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  // Désactiver complètement l'auth pour le dashboard (temporaire)
  return <>{children}</>;
}

export function PublicGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

