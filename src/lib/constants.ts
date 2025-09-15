// Configuration de l'application
export const APP_CONFIG = {
  name: 'HappyBadge',
  description: 'Plateforme SaaS de génération de badges événementiels',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  supportEmail: 'support@happybadge.fr',
  version: '1.0.0',
} as const

// Limites par défaut pour les plans
export const PLAN_LIMITS = {
  free: {
    events: 1,
    badgesPerMonth: 100,
    templates: 5,
    customTemplates: false,
    analytics: false,
    export: false,
    support: 'email' as const,
  },
  pro: {
    events: -1, // illimité
    badgesPerMonth: 1000,
    templates: -1, // illimité
    customTemplates: true,
    analytics: true,
    export: true,
    support: 'priority' as const,
  },
  enterprise: {
    events: -1, // illimité
    badgesPerMonth: -1, // illimité
    templates: -1, // illimité
    customTemplates: true,
    analytics: true,
    export: true,
    support: 'dedicated' as const,
  },
} as const

// Configuration des templates de badges
export const BADGE_TEMPLATES = {
  defaultSize: {
    width: 1080,
    height: 1080,
  },
  supportedFormats: ['png', 'jpg', 'jpeg', 'webp'] as const,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  quality: 0.9,
} as const

// Configuration des analytics
export const ANALYTICS_CONFIG = {
  retentionDays: 365,
  batchSize: 100,
  flushInterval: 5000, // 5 secondes
} as const

// Configuration des emails
export const EMAIL_CONFIG = {
  from: 'HappyBadge <noreply@happybadge.fr>',
  replyTo: 'support@happybadge.fr',
  templates: {
    welcome: 'welcome',
    eventCreated: 'event-created',
    badgeGenerated: 'badge-generated',
    subscriptionConfirmation: 'subscription-confirmation',
  },
} as const

// Configuration Stripe
export const STRIPE_CONFIG = {
  currency: 'eur',
  taxBehavior: 'exclusive' as const,
  paymentMethods: ['card'] as const,
} as const

// Messages d'erreur
export const ERROR_MESSAGES = {
  auth: {
    notAuthenticated: 'Vous devez être connecté pour accéder à cette page',
    insufficientPermissions: 'Vous n\'avez pas les permissions nécessaires',
    sessionExpired: 'Votre session a expiré, veuillez vous reconnecter',
  },
  events: {
    notFound: 'Événement non trouvé',
    notActive: 'Cet événement n\'est plus actif',
    accessDenied: 'Vous n\'avez pas accès à cet événement',
    limitReached: 'Vous avez atteint la limite d\'événements pour votre plan',
  },
  badges: {
    generationFailed: 'Impossible de générer le badge',
    templateNotFound: 'Template de badge non trouvé',
    invalidImage: 'Format d\'image non supporté',
    fileTooLarge: 'Le fichier est trop volumineux',
  },
  payments: {
    paymentFailed: 'Le paiement a échoué',
    subscriptionNotFound: 'Abonnement non trouvé',
    alreadySubscribed: 'Vous avez déjà un abonnement actif',
  },
  general: {
    serverError: 'Une erreur serveur s\'est produite',
    networkError: 'Erreur de connexion réseau',
    validationError: 'Données invalides',
  },
} as const

// Messages de succès
export const SUCCESS_MESSAGES = {
  auth: {
    loginSuccess: 'Connexion réussie',
    logoutSuccess: 'Déconnexion réussie',
    registerSuccess: 'Inscription réussie',
  },
  events: {
    created: 'Événement créé avec succès',
    updated: 'Événement mis à jour',
    deleted: 'Événement supprimé',
  },
  badges: {
    generated: 'Badge généré avec succès',
    downloaded: 'Badge téléchargé',
    shared: 'Badge partagé',
  },
  payments: {
    subscriptionActivated: 'Abonnement activé',
    subscriptionCancelled: 'Abonnement annulé',
    paymentSuccessful: 'Paiement réussi',
  },
} as const

// Configuration des réseaux sociaux
export const SOCIAL_CONFIG = {
  platforms: {
    facebook: {
      name: 'Facebook',
      url: 'https://facebook.com',
      color: '#1877F2',
    },
    instagram: {
      name: 'Instagram',
      url: 'https://instagram.com',
      color: '#E4405F',
    },
    twitter: {
      name: 'Twitter',
      url: 'https://twitter.com',
      color: '#1DA1F2',
    },
    linkedin: {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      color: '#0077B5',
    },
  },
} as const

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  types: {
    success: {
      icon: '✅',
      color: '#10B981',
    },
    error: {
      icon: '❌',
      color: '#EF4444',
    },
    warning: {
      icon: '⚠️',
      color: '#F59E0B',
    },
    info: {
      icon: 'ℹ️',
      color: '#3B82F6',
    },
  },
  duration: 5000, // 5 secondes
} as const

// Configuration des métadonnées SEO
export const SEO_CONFIG = {
  defaultTitle: 'HappyBadge - Générateur de Badges Événementiels',
  defaultDescription: 'Créez facilement des badges personnalisés "J\'y serai" pour vos événements et augmentez leur visibilité sur les réseaux sociaux.',
  defaultKeywords: [
    'badge',
    'événement',
    'marketing',
    'réseaux sociaux',
    'générateur',
    'personnalisation',
    'partage',
    'engagement',
  ],
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
} as const

// Configuration des routes
export const ROUTES = {
  home: '/',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  dashboard: {
    home: '/dashboard',
    events: '/dashboard/events',
    newEvent: '/dashboard/events/new',
    event: (id: string) => `/dashboard/events/${id}`,
    editEvent: (id: string) => `/dashboard/events/${id}/edit`,
    analytics: '/dashboard/analytics',
    settings: '/dashboard/settings',
    billing: '/dashboard/billing',
  },
  public: {
    event: (slug: string) => `/event/${slug}`,
    badge: (id: string) => `/badge/${id}`,
  },
  api: {
    events: '/api/events',
    badges: '/api/badges',
    analytics: '/api/analytics',
    stripe: '/api/stripe',
    webhooks: '/api/webhooks',
  },
} as const

// Configuration des cookies
export const COOKIE_CONFIG = {
  auth: {
    name: 'happybadge-auth',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
  preferences: {
    name: 'happybadge-preferences',
    maxAge: 365 * 24 * 60 * 60, // 1 an
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
} as const

