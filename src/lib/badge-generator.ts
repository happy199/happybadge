import { BadgeTemplate, getTemplateById } from './badge-templates'

export interface BadgeGenerationData {
  participantName: string
  participantEmail: string
  photoUrl: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventLogoUrl?: string
  templateId: string
}

export interface BadgeGenerationResult {
  success: boolean
  imageUrl?: string
  error?: string
}

export class BadgeGenerator {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
  }

  async generateBadge(data: BadgeGenerationData): Promise<BadgeGenerationResult> {
    try {
      const template = getTemplateById(data.templateId)
      if (!template) {
        return {
          success: false,
          error: 'Template non trouvé',
        }
      }

      if (!this.canvas || !this.ctx) {
        return {
          success: false,
          error: 'Canvas non initialisé',
        }
      }

      // Configuration du canvas
      this.canvas.width = template.config.width
      this.canvas.height = template.config.height

      // Chargement de l'image de fond
      await this.drawBackground(template)
      
      // Chargement et dessin de la photo du participant
      await this.drawParticipantPhoto(data.photoUrl, template)
      
      // Dessin du logo de l'événement
      if (data.eventLogoUrl) {
        await this.drawEventLogo(data.eventLogoUrl, template)
      }
      
      // Dessin du texte
      this.drawText(data, template)

      // Conversion en blob
      const blob = await this.canvasToBlob()
      const imageUrl = URL.createObjectURL(blob)

      return {
        success: true,
        imageUrl,
      }
    } catch (error) {
      console.error('Erreur lors de la génération du badge:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    }
  }

  private async drawBackground(template: BadgeTemplate): Promise<void> {
    if (!this.ctx) return

    const { config } = template
    const { width, height } = config

    // Création du gradient si défini
    if (config.gradient) {
      const gradient = this.createGradient(config.gradient, width, height)
      this.ctx.fillStyle = gradient
    } else {
      this.ctx.fillStyle = config.backgroundColor
    }

    // Dessin du fond avec coins arrondis
    this.drawRoundedRect(0, 0, width, height, config.borderRadius)
    this.ctx.fill()

    // Ajout de l'ombre si activée
    if (config.shadow) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
      this.ctx.shadowBlur = 20
      this.ctx.shadowOffsetX = 0
      this.ctx.shadowOffsetY = 10
    }
  }

  private createGradient(gradient: NonNullable<BadgeTemplate['config']['gradient']>, width: number, height: number): CanvasGradient {
    if (!this.ctx) throw new Error('Context non disponible')

    let canvasGradient: CanvasGradient

    switch (gradient.direction) {
      case 'horizontal':
        canvasGradient = this.ctx.createLinearGradient(0, 0, width, 0)
        break
      case 'vertical':
        canvasGradient = this.ctx.createLinearGradient(0, 0, 0, height)
        break
      case 'diagonal':
        canvasGradient = this.ctx.createLinearGradient(0, 0, width, height)
        break
      default:
        canvasGradient = this.ctx.createLinearGradient(0, 0, width, 0)
    }

    canvasGradient.addColorStop(0, gradient.from)
    canvasGradient.addColorStop(1, gradient.to)

    return canvasGradient
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    if (!this.ctx) return

    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
  }

  private async drawParticipantPhoto(photoUrl: string, template: BadgeTemplate): Promise<void> {
    if (!this.ctx) return

    const image = new Image()
    image.crossOrigin = 'anonymous'
    
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const { config } = template
        const { width, height } = config
        
        // Calcul de la taille et position de la photo
        const photoSize = this.getPhotoSize(config.photoSize, width, height)
        const photoPosition = this.getPhotoPosition(config.photoPosition, width, height, photoSize)
        
        // Dessin de la photo avec coins arrondis
        this.ctx!.save()
        this.drawRoundedRect(
          photoPosition.x,
          photoPosition.y,
          photoSize.width,
          photoSize.height,
          photoSize.width / 2
        )
        this.ctx!.clip()
        
        this.ctx!.drawImage(
          image,
          photoPosition.x,
          photoPosition.y,
          photoSize.width,
          photoSize.height
        )
        
        this.ctx!.restore()
        resolve()
      }
      
      image.onerror = () => {
        reject(new Error('Impossible de charger la photo'))
      }
      
      image.src = photoUrl
    })
  }

  private async drawEventLogo(logoUrl: string, template: BadgeTemplate): Promise<void> {
    if (!this.ctx) return

    const image = new Image()
    image.crossOrigin = 'anonymous'
    
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const { config } = template
        const { width, height } = config
        
        // Calcul de la position du logo
        const logoSize = Math.min(width, height) * 0.15
        const logoPosition = this.getLogoPosition(config.logoPosition, width, height, logoSize)
        
        this.ctx!.drawImage(
          image,
          logoPosition.x,
          logoPosition.y,
          logoSize,
          logoSize
        )
        
        resolve()
      }
      
      image.onerror = () => {
        reject(new Error('Impossible de charger le logo'))
      }
      
      image.src = logoUrl
    })
  }

  private drawText(data: BadgeGenerationData, template: BadgeTemplate): void {
    if (!this.ctx) return

    const { config } = template
    const { width, height } = config

    this.ctx.fillStyle = config.textColor
    this.ctx.font = `bold ${height * 0.08}px ${config.fontFamily}`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    // Dessin du nom du participant
    const participantNameY = height * 0.8
    this.ctx.fillText(data.participantName, width / 2, participantNameY)

    // Dessin du titre de l'événement
    this.ctx.font = `${height * 0.06}px ${config.fontFamily}`
    const eventTitleY = participantNameY + height * 0.1
    this.ctx.fillText(data.eventTitle, width / 2, eventTitleY)

    // Dessin de la date et lieu
    this.ctx.font = `${height * 0.04}px ${config.fontFamily}`
    const eventDetailsY = eventTitleY + height * 0.08
    this.ctx.fillText(`${data.eventDate} - ${data.eventLocation}`, width / 2, eventDetailsY)
  }

  private getPhotoSize(size: string, width: number, height: number): { width: number; height: number } {
    const baseSize = Math.min(width, height) * 0.4
    
    switch (size) {
      case 'small':
        return { width: baseSize * 0.6, height: baseSize * 0.6 }
      case 'medium':
        return { width: baseSize * 0.8, height: baseSize * 0.8 }
      case 'large':
        return { width: baseSize, height: baseSize }
      default:
        return { width: baseSize, height: baseSize }
    }
  }

  private getPhotoPosition(position: string, width: number, height: number, photoSize: { width: number; height: number }): { x: number; y: number } {
    const centerX = (width - photoSize.width) / 2
    const centerY = (height - photoSize.height) / 2
    
    switch (position) {
      case 'left':
        return { x: width * 0.1, y: centerY }
      case 'right':
        return { x: width * 0.9 - photoSize.width, y: centerY }
      case 'center':
      default:
        return { x: centerX, y: centerY }
    }
  }

  private getLogoPosition(position: string, width: number, height: number, logoSize: number): { x: number; y: number } {
    const margin = width * 0.05
    
    switch (position) {
      case 'top-left':
        return { x: margin, y: margin }
      case 'top-center':
        return { x: (width - logoSize) / 2, y: margin }
      case 'top-right':
        return { x: width - logoSize - margin, y: margin }
      case 'center':
        return { x: (width - logoSize) / 2, y: (height - logoSize) / 2 }
      case 'bottom':
        return { x: (width - logoSize) / 2, y: height - logoSize - margin }
      default:
        return { x: margin, y: margin }
    }
  }

  private async canvasToBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas!.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Impossible de convertir le canvas en blob'))
        }
      }, 'image/png', 1.0)
    })
  }
}

// Instance singleton
export const badgeGenerator = new BadgeGenerator()

