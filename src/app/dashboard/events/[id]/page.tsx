import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import BadgeTemplateManager from '@/components/dashboard/events/BadgeTemplateManager'
import { BadgeTemplate } from '@/types/badge'
import { Event } from '@/types/event'

type EventDetailPageProps = {
  params: {
    id: string
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const supabase = createServerComponentClient({ cookies })
  const { id } = params

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (eventError || !event) {
    notFound()
  }

  const { data: templates, error: templatesError } = await supabase
    .from('event_badge_templates')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: true })

  if (templatesError) {
    console.error('Error fetching templates:', templatesError)
    // Decide how to handle this error - maybe show an error message
    // For now, we'll proceed with an empty array
  }

  // Need to define the types for Event and BadgeTemplate
  const typedEvent: Event = event as Event
  const typedTemplates: BadgeTemplate[] = templates || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{typedEvent.name}</h1>
        <p className="text-lg text-gray-600">{typedEvent.description}</p>
        <p className="text-sm text-gray-500">
          Date: {new Date(typedEvent.date).toLocaleDateString()}
        </p>
      </div>

      <BadgeTemplateManager
        event_id={typedEvent.id}
        initialTemplates={typedTemplates}
      />
    </div>
  )
}
