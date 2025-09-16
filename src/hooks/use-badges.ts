"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { badgeGenerator, BadgeGenerationData } from '@/lib/badge-generator'

type Badge = Database['public']['Tables']['badges']['Row']
type BadgeInsert = Database['public']['Tables']['badges']['Insert']

export function useBadges(eventId?: string) {
  const [supabase] = useState(() => createClient())
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const fetchBadges = async () => {
    if (!eventId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('badges')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setBadges(data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const generateBadge = async (badgeData: BadgeGenerationData): Promise<Badge | null> => {
    try {
      setGenerating(true)
      setError(null)

      // Générer l'image du badge
      const result = await badgeGenerator.generateBadge(badgeData)
      
      if (!result.success || !result.imageUrl) {
        setError(result.error || 'Erreur lors de la génération du badge')
        return null
      }

      // Sauvegarder le badge en base de données
      const badgeInsert: BadgeInsert = {
        event_id: badgeData.eventId,
        participant_email: badgeData.participantEmail,
        participant_name: badgeData.participantName,
        photo_url: badgeData.photoUrl,
        template_id: badgeData.templateId,
        generated_image_url: result.imageUrl,
        status: 'completed',
      }

      const { data, error: insertError } = await supabase
        .from('badges')
        .insert(badgeInsert)
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        return null
      }

      setBadges(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    } finally {
      setGenerating(false)
    }
  }

  const getBadgeById = (badgeId: string): Badge | undefined => {
    return badges.find(badge => badge.id === badgeId)
  }

  const getBadgesByParticipant = (participantEmail: string): Badge[] => {
    return badges.filter(badge => badge.participant_email === participantEmail)
  }

  const getBadgeStats = () => {
    const total = badges.length
    const completed = badges.filter(badge => badge.status === 'completed').length
    const pending = badges.filter(badge => badge.status === 'pending').length
    const failed = badges.filter(badge => badge.status === 'failed').length

    return {
      total,
      completed,
      pending,
      failed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    }
  }

  const getTemplateStats = () => {
    const templateCounts: Record<string, number> = {}
    
    badges.forEach(badge => {
      templateCounts[badge.template_id] = (templateCounts[badge.template_id] || 0) + 1
    })

    return Object.entries(templateCounts)
      .map(([templateId, count]) => ({ templateId, count }))
      .sort((a, b) => b.count - a.count)
  }

  useEffect(() => {
    if (eventId) {
      fetchBadges()
    }
  }, [eventId])

  return {
    badges,
    loading,
    error,
    generating,
    fetchBadges,
    generateBadge,
    getBadgeById,
    getBadgesByParticipant,
    getBadgeStats,
    getTemplateStats,
  }
}

