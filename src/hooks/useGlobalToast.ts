import { useToastContext } from '@/contexts/ToastContext';

// Hook pour utiliser les toasts globalement avec fallback SSR
export const useGlobalToast = () => {
  try {
    const context = useToastContext();
    if (context) {
      return context;
    }
  } catch (error) {
    // Fallback en cas d'erreur (SSR ou contexte non disponible)
    console.warn('Toast context non disponible, utilisation du fallback');
  }

  // Fallback pour SSR ou erreurs
  return {
    showSuccess: (title: string, message?: string) => {
      console.log(`✅ ${title}${message ? `: ${message}` : ''}`);
    },
    showError: (title: string, message?: string) => {
      console.error(`❌ ${title}${message ? `: ${message}` : ''}`);
    },
    showInfo: (title: string, message?: string) => {
      console.info(`ℹ️ ${title}${message ? `: ${message}` : ''}`);
    },
  };
};


