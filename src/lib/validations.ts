import { z } from 'zod'

// Schémas de validation pour l'authentification
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  company: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

// Schémas de validation pour les événements
export const eventSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  event_date: z.string().min(1, 'La date est requise'),
  location: z.string().min(2, 'Le lieu doit contenir au moins 2 caractères').max(100, 'Le lieu ne peut pas dépasser 100 caractères'),
  logo_url: z.string().url('URL invalide').optional().or(z.literal('')),
})

export const eventUpdateSchema = eventSchema.partial()

// Schémas de validation pour les participants
export const participantSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  customData: z.record(z.any()).optional(),
})

// Schémas de validation pour les badges
export const badgeGenerationSchema = z.object({
  participantName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  participantEmail: z.string().email('Email invalide'),
  photoUrl: z.string().url('URL de photo invalide'),
  templateId: z.string().min(1, 'Template requis'),
  eventId: z.string().uuid('ID d\'événement invalide'),
})

// Schémas de validation pour les templates
export const templateSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().max(200, 'La description ne peut pas dépasser 200 caractères'),
  config: z.object({
    width: z.number().min(100).max(2000),
    height: z.number().min(100).max(2000),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
    fontFamily: z.string().min(1, 'Police requise'),
    logoPosition: z.enum(['top-left', 'top-center', 'top-right', 'center', 'bottom']),
    photoPosition: z.enum(['left', 'center', 'right']),
    photoSize: z.enum(['small', 'medium', 'large']),
    borderRadius: z.number().min(0).max(100),
    shadow: z.boolean(),
    gradient: z.object({
      from: z.string().regex(/^#[0-9A-F]{6}$/i),
      to: z.string().regex(/^#[0-9A-F]{6}$/i),
      direction: z.enum(['horizontal', 'vertical', 'diagonal']),
    }).optional(),
  }),
  isPremium: z.boolean(),
})

// Schémas de validation pour les analytics
export const analyticsSchema = z.object({
  eventId: z.string().uuid('ID d\'événement invalide'),
  type: z.enum(['page_view', 'badge_generated', 'participant_registered', 'custom']),
  data: z.record(z.any()),
})

// Schémas de validation pour les paiements
export const checkoutSessionSchema = z.object({
  priceId: z.string().min(1, 'ID de prix requis'),
  customerEmail: z.string().email('Email invalide'),
  successUrl: z.string().url('URL de succès invalide'),
  cancelUrl: z.string().url('URL d\'annulation invalide'),
  metadata: z.record(z.string()).optional(),
})

// Schémas de validation pour les paramètres d'URL
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Slug invalide')

export const uuidSchema = z.string().uuid('UUID invalide')

// Schémas de validation pour les fichiers
export const fileSchema = z.object({
  name: z.string().min(1, 'Nom de fichier requis'),
  size: z.number().max(5 * 1024 * 1024, 'Le fichier ne peut pas dépasser 5MB'),
  type: z.string().regex(/^image\/(png|jpeg|jpg|webp)$/, 'Format d\'image non supporté'),
})

// Schémas de validation pour les formulaires de contact
export const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
})

// Schémas de validation pour les paramètres de recherche
export const searchSchema = z.object({
  query: z.string().min(1, 'Recherche requise'),
  page: z.number().min(1, 'Page invalide').default(1),
  limit: z.number().min(1).max(100, 'Limite invalide').default(10),
  sort: z.enum(['created_at', 'title', 'event_date']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Schémas de validation pour les filtres
export const filterSchema = z.object({
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  location: z.string().optional(),
})

// Types TypeScript dérivés des schémas
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type EventInput = z.infer<typeof eventSchema>
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>
export type ParticipantInput = z.infer<typeof participantSchema>
export type BadgeGenerationInput = z.infer<typeof badgeGenerationSchema>
export type TemplateInput = z.infer<typeof templateSchema>
export type AnalyticsInput = z.infer<typeof analyticsSchema>
export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type FilterInput = z.infer<typeof filterSchema>

// Fonctions utilitaires de validation
export function validateEmail(email: string): boolean {
  return z.string().email().safeParse(email).success
}

export function validatePassword(password: string): boolean {
  return z.string().min(8).safeParse(password).success
}

export function validateUrl(url: string): boolean {
  return z.string().url().safeParse(url).success
}

export function validateUuid(uuid: string): boolean {
  return z.string().uuid().safeParse(uuid).success
}

export function validateSlug(slug: string): boolean {
  return z.string().regex(/^[a-z0-9-]+$/).safeParse(slug).success
}

// Fonction pour valider et transformer les données
export function validateAndTransform<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return {
      success: false,
      errors: result.error.errors.map(err => err.message),
    }
  }
}

