# 🍽️ NOMO - Restaurant SaaS Platform

**Plateforme SaaS complète pour la gestion de restaurants avec menus digitaux, commandes en temps réel et paiements intégrés.**

## 🎯 **Vue d'ensemble**

NOMO est une solution SaaS multi-tenant qui permet aux restaurants de :
- **Gérer leurs menus** avec photos et descriptions
- **Traiter les commandes** en temps réel via QR codes
- **Intégrer les paiements** (Wave, MyNita, cartes bancaires)
- **Suivre leurs performances** avec analytics avancés
- **Gérer plusieurs établissements** depuis une interface unique

## 🏗️ **Architecture Technique**

### **Frontend**
- **Framework** : Next.js 14 + TypeScript
- **Styling** : Tailwind CSS avec palette NOMO personnalisée
- **Composants** : Shadcn/ui pour l'interface utilisateur
- **Icônes** : Lucide React pour une expérience visuelle cohérente

### **Backend** (Déjà déployé)
- **API** : NestJS + PostgreSQL + Redis
- **URL** : https://backend-de-restaurant-saas-production.up.railway.app
- **Fonctionnalités** : Multi-tenant, JWT, WebSockets, paiements

## 🎨 **Design System NOMO**

### **Palette de Couleurs**
```css
--nomo-primary: #112319      /* Vert très foncé */
--nomo-secondary: #DAD6BE    /* Beige clair */
--nomo-accent-green: #22c55e /* Vert accent */
--nomo-accent-gold: #f59e0b  /* Or accent */
--nomo-accent-red: #ef4444   /* Rouge accent */
```

### **Typographie**
- **Police principale** : Inter (Google Fonts)
- **Police monospace** : JetBrains Mono
- **Hiérarchie** : Responsive et accessible

## 🚀 **Démarrage Rapide**

### **Prérequis**
- Node.js 18+
- npm ou yarn

### **Installation**
```bash
# Cloner le projet
git clone <repository-url>
cd frontend

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp env.example .env.local

# Démarrer en développement
npm run dev
```

### **Variables d'Environnement**
Créez un fichier `.env.local` basé sur `env.example` :
```bash
# Backend API
NEXT_PUBLIC_API_URL=https://backend-de-restaurant-saas-production.up.railway.app
NEXT_PUBLIC_API_VERSION=v1

# Frontend
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## 📱 **Fonctionnalités**

### **Landing Page**
- ✅ **Navigation responsive** avec logo NOMO
- ✅ **Hero Section** avec CTA "Essai Gratuit"
- ✅ **6 cartes fonctionnalités** avec icônes
- ✅ **Statistiques** (500+ restaurants, 99% disponibilité)
- ✅ **Footer** avec liens et informations

### **Dashboard Multi-Tenant**
- ✅ **Sidebar navigation** avec toutes les sections
- ✅ **Header** avec recherche et notifications
- ✅ **Vue d'ensemble** avec statistiques en temps réel
- ✅ **Actions rapides** pour fonctionnalités principales
- ✅ **Responsive design** mobile-first

### **Sections du Dashboard**
- 🏢 **Restaurants** : Gestion multi-tenant
- 🍽️ **Menus** : CRUD avec images et catégories
- 📱 **Commandes** : Suivi temps réel + WebSockets
- 👥 **Utilisateurs** : Rôles et permissions
- 💳 **Paiements** : Intégration Wave/MyNita
- 📊 **Analytics** : Graphiques et rapports

## 🔧 **Structure du Projet**

```
src/
├── app/                    # App Router Next.js 14
│   ├── page.tsx           # Landing Page
│   ├── dashboard/         # Dashboard principal
│   │   ├── layout.tsx     # Layout dashboard
│   │   └── page.tsx       # Page d'accueil dashboard
│   └── auth/              # Pages d'authentification
├── components/             # Composants réutilisables
│   ├── ui/                # Composants Shadcn/ui
│   │   ├── logo.tsx       # Logo NOMO personnalisé
│   │   └── ...            # Autres composants UI
│   └── dashboard/         # Composants spécifiques dashboard
│       ├── sidebar.tsx    # Navigation latérale
│       └── header.tsx     # En-tête dashboard
├── lib/                    # Utilitaires et configurations
│   └── utils.ts           # Fonctions utilitaires
└── types/                  # Types TypeScript
```

## 🎨 **Composants Personnalisés**

### **Logo NOMO**
- **3 variantes** : default, white, minimal
- **3 tailles** : sm, md, lg
- **Responsive** et accessible

### **Sidebar Dashboard**
- **Navigation complète** avec icônes
- **Mode mobile** avec overlay
- **Profil utilisateur** intégré
- **Thème NOMO** cohérent

### **Header Dashboard**
- **Titre dynamique** selon la page
- **Barre de recherche** intégrée
- **Notifications** avec badge
- **Profil utilisateur** avec menu

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile** : < 768px (première priorité)
- **Tablet** : 768px - 1024px
- **Desktop** : > 1024px

### **Fonctionnalités Mobile**
- **Sidebar mobile** avec overlay
- **Navigation tactile** optimisée
- **Grilles adaptatives** pour cartes
- **Boutons et inputs** adaptés au touch

## 🚀 **Déploiement**

### **Développement Local**
```bash
npm run dev          # Démarrer en mode développement
npm run build        # Build de production
npm run start        # Démarrer en mode production
npm run lint         # Vérification ESLint
```

### **Production (Vercel)**
1. **Connecter** le repository GitHub
2. **Configurer** les variables d'environnement
3. **Déployer** automatiquement sur push

## 🔗 **Intégration Backend**

### **API Endpoints**
- **Base URL** : `https://backend-de-restaurant-saas-production.up.railway.app`
- **Version** : `/api/v1`
- **Authentification** : JWT Bearer Token

### **Fonctionnalités Intégrées**
- ✅ **Multi-tenant** : Isolation complète des données
- ✅ **WebSockets** : Notifications temps réel
- ✅ **Paiements** : Wave + MyNita + cartes
- ✅ **Fichiers** : QR codes + images

## 🧪 **Tests et Qualité**

### **Tests Automatisés**
- **Tests unitaires** : Jest + React Testing Library
- **Tests E2E** : Playwright
- **Tests de composants** : Storybook

### **Qualité du Code**
- **ESLint** : Règles strictes TypeScript
- **Prettier** : Formatage automatique
- **Husky** : Hooks Git pré-commit

## 📈 **Roadmap**

### **Phase 1 : Setup & Design** ✅
- [x] Projet Next.js 14 configuré
- [x] Shadcn/ui installé et configuré
- [x] Palette de couleurs NOMO
- [x] Composants de base (Logo, Sidebar, Header)

### **Phase 2 : Landing Page** ✅
- [x] Navigation responsive
- [x] Hero Section avec CTA
- [x] Fonctionnalités (6 cartes)
- [x] Statistiques et footer

### **Phase 3 : Dashboard** ✅
- [x] Layout principal avec sidebar
- [x] Page d'accueil avec statistiques
- [x] Navigation complète
- [x] Design responsive

### **Phase 4 : Pages Fonctionnelles** 🔄
- [ ] Gestion des restaurants
- [ ] Gestion des menus
- [ ] Gestion des commandes
- [ ] Gestion des utilisateurs

### **Phase 5 : Authentification** ⏳
- [ ] Pages login/register
- [ ] Middleware d'authentification
- [ ] Intégration JWT backend
- [ ] Protection des routes

### **Phase 6 : Finalisation** ⏳
- [ ] Tests complets
- [ ] Optimisation performance
- [ ] Déploiement Vercel
- [ ] Documentation utilisateur

## 🤝 **Contribution**

1. **Fork** le projet
2. **Créer** une branche feature
3. **Commit** les changements
4. **Push** et ouvrir une Pull Request

## 📄 **License**

Ce projet est sous licence privée. Tous droits réservés à NOMO.

## 📞 **Support**

- **Email** : support@nomo.com
- **Documentation** : [docs.nomo.com](https://docs.nomo.com)
- **Status** : [status.nomo.com](https://status.nomo.com)

---
**NOMO - Révolutionnez votre Restaurant** 🍽️✨
