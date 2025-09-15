import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { badgeGenerationSchema } from '@/lib/validations'
import { badgeGenerator } from '@/lib/badge-generator'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Vérifier l'authentification
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    
    // Valider les données
    const validation = badgeGenerationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      )
    }

    const badgeData = validation.data

    // Vérifier que l'événement appartient à l'utilisateur
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', badgeData.eventId)
      .eq('user_id', session.user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    }

    // Générer le badge
    const result = await badgeGenerator.generateBadge({
      participantName: badgeData.participantName,
      participantEmail: badgeData.participantEmail,
      photoUrl: badgeData.photoUrl,
      eventTitle: event.title,
      eventDate: event.event_date,
      eventLocation: event.location,
      eventLogoUrl: event.logo_url || undefined,
      templateId: badgeData.templateId,
    })

    if (!result.success || !result.imageUrl) {
      return NextResponse.json(
        { error: result.error || 'Erreur lors de la génération du badge' },
        { status: 500 }
      )
    }

    // Sauvegarder le badge en base de données
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .insert({
        event_id: badgeData.eventId,
        participant_email: badgeData.participantEmail,
        participant_name: badgeData.participantName,
        photo_url: badgeData.photoUrl,
        template_id: badgeData.templateId,
        generated_image_url: result.imageUrl,
        status: 'completed',
      })
      .select()
      .single()

    if (badgeError) {
      return NextResponse.json({ error: badgeError.message }, { status: 500 })
    }

    return NextResponse.json({ badge }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

