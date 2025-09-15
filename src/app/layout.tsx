import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HappyBadge - Générateur de Badges Événementiels',
  description: 'Créez facilement des badges personnalisés "J\'y serai" pour vos événements et augmentez leur visibilité sur les réseaux sociaux.',
  keywords: ['badge', 'événement', 'marketing', 'réseaux sociaux', 'générateur'],
  authors: [{ name: 'HappyBadge Team' }],
  openGraph: {
    title: 'HappyBadge - Générateur de Badges Événementiels',
    description: 'Créez facilement des badges personnalisés "J\'y serai" pour vos événements',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

