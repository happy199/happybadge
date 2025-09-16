"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useAuth } from '@/components/providers/auth-provider'

type Event = Database['public']['Tables']['events']['Row']
type EventInsert = Database['public']['Tables']['events']['Insert']
type EventUpdate = Database['public']['Tables']['events']['Update']

export function useEvents() {
  const [supabase] = useState(() => createClient())
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setEvents(data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: EventInsert): Promise<Event | null> => {
    if (!user) return null

    try {
      const { data, error: createError } = await supabase
        .from('events')
        .insert({
          ...eventData,
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) {
        setError(createError.message)
        return null
      }

      setEvents(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    }
  }

  const updateEvent = async (eventId: string, eventData: EventUpdate): Promise<Event | null> => {
    if (!user) return null

    try {
      const { data, error: updateError } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        setError(updateError.message)
        return null
      }

      setEvents(prev => prev.map(event => event.id === eventId ? data : event))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    }
  }

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id)

      if (deleteError) {
        setError(deleteError.message)
        return false
      }

      setEvents(prev => prev.filter(event => event.id !== eventId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    }
  }

  const getEventById = (eventId: string): Event | undefined => {
    return events.find(event => event.id === eventId)
  }

  const getEventBySlug = async (slug: string): Promise<Event | null> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single()

      if (error) {
        setError(error.message)
        return null
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return null
    }
  }

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventBySlug,
  }
}

