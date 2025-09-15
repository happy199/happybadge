export interface Plan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    events: number
    badgesPerMonth: number
    templates: number
    customTemplates: boolean
    analytics: boolean
    export: boolean
    support: 'email' | 'priority' | 'dedicated'
  }
  stripePriceId?: string
  popular?: boolean
}

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Parfait pour tester',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    features: [
      '1 événement actif',
      '100 badges générés/mois',
      '5 templates prédéfinis',
      'Analytics basiques',
      'Support par email',
    ],
    limits: {
      events: 1,
      badgesPerMonth: 100,
      templates: 5,
      customTemplates: false,
      analytics: false,
      export: false,
      support: 'email',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les organisateurs actifs',
    price: 29,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Événements illimités',
      '1000 badges générés/mois',
      'Templates personnalisables',
      'Billetterie intégrée',
      'Analytics avancés',
      'Export CSV',
      'Support prioritaire',
    ],
    limits: {
      events: -1, // -1 = illimité
      badgesPerMonth: 1000,
      templates: -1,
      customTemplates: true,
      analytics: true,
      export: true,
      support: 'priority',
    },
    stripePriceId: 'price_pro_monthly',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour les grandes organisations',
    price: 99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Tout du plan Pro',
      'Badges illimités',
      'Support dédié',
      'API personnalisée',
      'White-label',
      'Intégrations CRM',
      'Formation personnalisée',
    ],
    limits: {
      events: -1,
      badgesPerMonth: -1,
      templates: -1,
      customTemplates: true,
      analytics: true,
      export: true,
      support: 'dedicated',
    },
    stripePriceId: 'price_enterprise_monthly',
  },
]

export function getPlanById(id: string): Plan | undefined {
  return plans.find(plan => plan.id === id)
}

export function getFreePlan(): Plan {
  return plans.find(plan => plan.id === 'free')!
}

export function getPaidPlans(): Plan[] {
  return plans.filter(plan => plan.id !== 'free')
}

export function canUserAccessFeature(userPlan: string, feature: keyof Plan['limits']): boolean {
  const plan = getPlanById(userPlan)
  if (!plan) return false

  const limit = plan.limits[feature]
  
  // -1 signifie illimité
  if (limit === -1) return true
  
  // Pour les fonctionnalités booléennes
  if (typeof limit === 'boolean') return limit
  
  // Pour les limites numériques, on retourne true si la limite est > 0
  return limit > 0
}

export function getUserBadgeLimit(userPlan: string): number {
  const plan = getPlanById(userPlan)
  return plan?.limits.badgesPerMonth || 0
}

export function getUserEventLimit(userPlan: string): number {
  const plan = getPlanById(userPlan)
  return plan?.limits.events || 0
}

export function formatPrice(plan: Plan): string {
  if (plan.price === 0) return 'Gratuit'
  
  const price = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: plan.currency,
  }).format(plan.price)
  
  return `${price}/${plan.interval === 'month' ? 'mois' : 'an'}`
}

