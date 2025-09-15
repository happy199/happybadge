export interface BadgeTemplate {
  id: string
  name: string
  description: string
  previewUrl: string
  config: {
    width: number
    height: number
    backgroundColor: string
    textColor: string
    fontFamily: string
    logoPosition: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom'
    photoPosition: 'left' | 'center' | 'right'
    photoSize: 'small' | 'medium' | 'large'
    borderRadius: number
    shadow: boolean
    gradient?: {
      from: string
      to: string
      direction: 'horizontal' | 'vertical' | 'diagonal'
    }
  }
  isPremium: boolean
}

export const badgeTemplates: BadgeTemplate[] = [
  {
    id: 'template-1',
    name: 'Classique',
    description: 'Design épuré et professionnel',
    previewUrl: '/templates/classic-preview.png',
    config: {
      width: 1080,
      height: 1080,
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter',
      logoPosition: 'top-center',
      photoPosition: 'center',
      photoSize: 'large',
      borderRadius: 12,
      shadow: true,
    },
    isPremium: false,
  },
  {
    id: 'template-2',
    name: 'Moderne',
    description: 'Style contemporain avec gradients',
    previewUrl: '/templates/modern-preview.png',
    config: {
      width: 1080,
      height: 1080,
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      logoPosition: 'top-left',
      photoPosition: 'center',
      photoSize: 'medium',
      borderRadius: 24,
      shadow: true,
      gradient: {
        from: '#3b82f6',
        to: '#8b5cf6',
        direction: 'diagonal',
      },
    },
    isPremium: false,
  },
  {
    id: 'template-3',
    name: 'Élégant',
    description: 'Design sophistiqué pour événements corporate',
    previewUrl: '/templates/elegant-preview.png',
    config: {
      width: 1080,
      height: 1080,
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      fontFamily: 'Playfair Display',
      logoPosition: 'top-center',
      photoPosition: 'center',
      photoSize: 'large',
      borderRadius: 8,
      shadow: true,
      gradient: {
        from: '#1f2937',
        to: '#374151',
        direction: 'vertical',
      },
    },
    isPremium: false,
  },
  {
    id: 'template-4',
    name: 'Festif',
    description: 'Style coloré pour festivals et événements fun',
    previewUrl: '/templates/festive-preview.png',
    config: {
      width: 1080,
      height: 1080,
      backgroundColor: '#f59e0b',
      textColor: '#ffffff',
      fontFamily: 'Inter',
      logoPosition: 'top-right',
      photoPosition: 'center',
      photoSize: 'medium',
      borderRadius: 50,
      shadow: true,
      gradient: {
        from: '#f59e0b',
        to: '#ef4444',
        direction: 'horizontal',
      },
    },
    isPremium: false,
  },
  {
    id: 'template-5',
    name: 'Minimaliste',
    description: 'Design simple et efficace',
    previewUrl: '/templates/minimal-preview.png',
    config: {
      width: 1080,
      height: 1080,
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Inter',
      logoPosition: 'top-center',
      photoPosition: 'center',
      photoSize: 'large',
      borderRadius: 0,
      shadow: false,
    },
    isPremium: false,
  },
]

export function getTemplateById(id: string): BadgeTemplate | undefined {
  return badgeTemplates.find(template => template.id === id)
}

export function getFreeTemplates(): BadgeTemplate[] {
  return badgeTemplates.filter(template => !template.isPremium)
}

export function getPremiumTemplates(): BadgeTemplate[] {
  return badgeTemplates.filter(template => template.isPremium)
}

