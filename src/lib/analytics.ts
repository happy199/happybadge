import { createClient } from '@/lib/supabase'

const supabase = createClient()

export interface AnalyticsEvent {
  id: string
  event_id: string
  type: string
  data: Record<string, unknown>
  recorded_at: string
}

export interface EventStats {
  totalViews: number
  totalBadgesGenerated: number
  totalParticipants: number
  conversionRate: number
  topTemplates: Array<{
    templateId: string
    count: number
  }>
  dailyStats: Array<{
    date: string
    views: number
    badgesGenerated: number
    participants: number
  }>
}

export class AnalyticsService {
  static async trackEvent(
    eventId: string,
    type: string,
    data: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await supabase.from('analytics').insert({
        event_id: eventId,
        type,
        data,
      })
    } catch (error) {
      console.error('Erreur lors du tracking:', error)
    }
  }

  static async trackPageView(eventId: string, page: string): Promise<void> {
    await this.trackEvent(eventId, 'page_view', {
      page,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
    })
  }

  static async trackBadgeGenerated(
    eventId: string,
    templateId: string,
    participantEmail: string
  ): Promise<void> {
    await this.trackEvent(eventId, 'badge_generated', {
      template_id: templateId,
      participant_email: participantEmail,
      timestamp: new Date().toISOString(),
    })
  }

  static async trackParticipantRegistered(
    eventId: string,
    participantEmail: string,
    hasTicket: boolean = false
  ): Promise<void> {
    await this.trackEvent(eventId, 'participant_registered', {
      participant_email: participantEmail,
      has_ticket: hasTicket,
      timestamp: new Date().toISOString(),
    })
  }

  static async getEventStats(eventId: string): Promise<EventStats> {
    try {
      // Récupérer toutes les analytics pour cet événement
      const { data: analytics, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('event_id', eventId)

      if (error) throw error

      // Calculer les statistiques
      const stats: EventStats = {
        totalViews: 0,
        totalBadgesGenerated: 0,
        totalParticipants: 0,
        conversionRate: 0,
        topTemplates: [],
        dailyStats: [],
      }

      // Compter les vues
      stats.totalViews = analytics?.filter(a => a.type === 'page_view').length || 0

      // Compter les badges générés
      const badgeGeneratedEvents = analytics?.filter(a => a.type === 'badge_generated') || []
      stats.totalBadgesGenerated = badgeGeneratedEvents.length

      // Compter les participants
      const participantEvents = analytics?.filter(a => a.type === 'participant_registered') || []
      stats.totalParticipants = participantEvents.length

      // Calculer le taux de conversion
      if (stats.totalViews > 0) {
        stats.conversionRate = (stats.totalBadgesGenerated / stats.totalViews) * 100
      }

      // Top templates
      const templateCounts: Record<string, number> = {}
      badgeGeneratedEvents.forEach(event => {
        const templateId = event.data.template_id as string
        templateCounts[templateId] = (templateCounts[templateId] || 0) + 1
      })

      stats.topTemplates = Object.entries(templateCounts)
        .map(([templateId, count]) => ({ templateId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Statistiques quotidiennes (derniers 30 jours)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const dailyData: Record<string, { views: number; badgesGenerated: number; participants: number }> = {}

      analytics?.forEach(event => {
        const date = new Date(event.recorded_at).toISOString().split('T')[0]
        
        if (new Date(event.recorded_at) >= thirtyDaysAgo) {
          if (!dailyData[date]) {
            dailyData[date] = { views: 0, badgesGenerated: 0, participants: 0 }
          }

          switch (event.type) {
            case 'page_view':
              dailyData[date].views++
              break
            case 'badge_generated':
              dailyData[date].badgesGenerated++
              break
            case 'participant_registered':
              dailyData[date].participants++
              break
          }
        }
      })

      stats.dailyStats = Object.entries(dailyData)
        .map(([date, data]) => ({
          date,
          ...data,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return stats
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        totalViews: 0,
        totalBadgesGenerated: 0,
        totalParticipants: 0,
        conversionRate: 0,
        topTemplates: [],
        dailyStats: [],
      }
    }
  }

  static async exportEventData(eventId: string): Promise<string> {
    try {
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)

      if (participantsError) throw participantsError

      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('event_id', eventId)

      if (badgesError) throw badgesError

      // Créer le CSV
      const csvHeaders = [
        'Email',
        'Prénom',
        'Nom',
        'Téléphone',
        'Date d\'inscription',
        'Template utilisé',
        'Badge généré',
        'Statut',
      ]

      const csvRows = participants?.map(participant => {
        const badge = badges?.find(b => b.participant_email === participant.email)
        return [
          participant.email,
          participant.first_name,
          participant.last_name,
          participant.phone || '',
          new Date(participant.registered_at).toLocaleDateString('fr-FR'),
          badge?.template_id || '',
          badge?.generated_image_url ? 'Oui' : 'Non',
          badge?.status || 'Non généré',
        ]
      }) || []

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      return csvContent
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      throw new Error('Impossible d\'exporter les données')
    }
  }
}

// Hook React pour utiliser les analytics
export function useAnalytics() {
  const trackPageView = (eventId: string, page: string) => {
    AnalyticsService.trackPageView(eventId, page)
  }

  const trackBadgeGenerated = (eventId: string, templateId: string, participantEmail: string) => {
    AnalyticsService.trackBadgeGenerated(eventId, templateId, participantEmail)
  }

  const trackParticipantRegistered = (eventId: string, participantEmail: string, hasTicket: boolean = false) => {
    AnalyticsService.trackParticipantRegistered(eventId, participantEmail, hasTicket)
  }

  return {
    trackPageView,
    trackBadgeGenerated,
    trackParticipantRegistered,
  }
}

