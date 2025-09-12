/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // En développement, utiliser le backend Railway directement
    // En production, les requêtes iront directement vers Railway
    return [];
  },
  eslint: {
    // Ignorer les erreurs ESLint pendant le build pour le déploiement
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

