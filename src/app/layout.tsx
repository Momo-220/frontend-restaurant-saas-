import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import LocalStorageCleaner from "@/components/LocalStorageCleaner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOMO - Restaurant SaaS Platform",
  description: "Plateforme SaaS complète pour la gestion de restaurants avec menus digitaux, commandes en temps réel et paiements intégrés.",
  keywords: ["restaurant", "saas", "menu", "commandes", "paiements", "qr codes", "afrique"],
  authors: [{ name: "NOMO Team" }],
  creator: "NOMO",
  publisher: "NOMO",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: "NOMO - Restaurant SaaS Platform",
    description: "Révolutionnez votre restaurant avec notre plateforme SaaS complète",
    url: "http://localhost:3000",
    siteName: "NOMO",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOMO - Restaurant SaaS Platform",
    description: "Révolutionnez votre restaurant avec notre plateforme SaaS complète",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Suppression des attributs d'extension de navigateur */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Supprimer les attributs d'extension de navigateur
              document.addEventListener('DOMContentLoaded', function() {
                const body = document.body;
                if (body) {
                  body.removeAttribute('data-new-gr-c-s-check-loaded');
                  body.removeAttribute('data-gr-ext-installed');
                }
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <LocalStorageCleaner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
