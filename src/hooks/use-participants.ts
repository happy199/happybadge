"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Participant = Database['public']['Tables']['participants']['Row']
type ParticipantInsert = Database['public']['Tables']['participants']['Insert']

export function useParticipants(eventId?: string) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchParticipants = async () => {
    if (!eventId) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setParticipants(data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const addParticipant = async (participantData: ParticipantInsert): Promise<Participant | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('participants')
        .insert(participantData)
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
        return null
      }

      setParticipants(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    }
  }

  const getParticipantByEmail = (email: string): Participant | undefined => {
    return participants.find(participant => participant.email === email)
  }

  const getParticipantStats = () => {
    const total = participants.length
    const withPhone = participants.filter(p => p.phone).length
    const withCustomData = participants.filter(p => p.custom_data).length

    return {
      total,
      withPhone,
      withCustomData,
      phoneRate: total > 0 ? (withPhone / total) * 100 : 0,
      customDataRate: total > 0 ? (withCustomData / total) * 100 : 0,
    }
  }

  const exportParticipants = (): string => {
    const headers = [
      'Email',
      'Prénom',
      'Nom',
      'Téléphone',
      'Date d\'inscription',
      'Données personnalisées',
    ]

    const rows = participants.map(participant => [
      participant.email,
      participant.first_name,
      participant.last_name,
      participant.phone || '',
      new Date(participant.registered_at).toLocaleDateString('fr-FR'),
      participant.custom_data ? JSON.stringify(participant.custom_data) : '',
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return csvContent
  }

  useEffect(() => {
    if (eventId) {
      fetchParticipants()
    }
  }, [eventId])

  return {
    participants,
    loading,
    error,
    fetchParticipants,
    addParticipant,
    getParticipantByEmail,
    getParticipantStats,
    exportParticipants,
  }
}

