// Configuration Supabase pour NOMO Restaurant SaaS
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Configuration depuis les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client Supabase pour le navigateur
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Types de base de données (générés automatiquement par Supabase)
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          email: string;
          phone?: string;
          address?: string;
          description?: string;
          website?: string;
          logo_url?: string;
          banner_url?: string;
          payment_info?: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          email: string;
          phone?: string;
          address?: string;
          description?: string;
          website?: string;
          logo_url?: string;
          banner_url?: string;
          payment_info?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          email?: string;
          phone?: string;
          address?: string;
          description?: string;
          website?: string;
          logo_url?: string;
          banner_url?: string;
          payment_info?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description?: string;
          image_url?: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string;
          image_url?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          description?: string;
          image_url?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string;
          name: string;
          description?: string;
          price: number;
          image_url?: string;
          is_available: boolean;
          out_of_stock: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category_id: string;
          name: string;
          description?: string;
          price: number;
          image_url?: string;
          is_available?: boolean;
          out_of_stock?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          category_id?: string;
          name?: string;
          description?: string;
          price?: number;
          image_url?: string;
          is_available?: boolean;
          out_of_stock?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          tenant_id: string;
          order_number: string;
          table_id?: string;
          user_id?: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string;
          status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
          payment_method: 'CASH' | 'CARD' | 'WAVE' | 'MYNITA';
          payment_status: 'PENDING' | 'PAID' | 'FAILED';
          total_amount: number;
          delivery_fee: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          order_number: string;
          table_id?: string;
          user_id?: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string;
          status?: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
          payment_method: 'CASH' | 'CARD' | 'WAVE' | 'MYNITA';
          payment_status?: 'PENDING' | 'PAID' | 'FAILED';
          total_amount: number;
          delivery_fee?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          order_number?: string;
          table_id?: string;
          user_id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string;
          status?: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
          payment_method?: 'CASH' | 'CARD' | 'WAVE' | 'MYNITA';
          payment_status?: 'PENDING' | 'PAID' | 'FAILED';
          total_amount?: number;
          delivery_fee?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Client typé
export const supabaseTyped = supabase as ReturnType<typeof createBrowserClient<Database>>;

// Helpers pour l'authentification
export const auth = supabase.auth;

// Helpers pour le storage
export const storage = supabase.storage;

// Helpers pour les requêtes
export const from = (table: keyof Database['public']['Tables']) => supabase.from(table);
