import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import PublicBadgeCreator from '@/components/public/PublicBadgeCreator'
import { BadgeTemplate } from '@/types/badge'
import { Event } from '@/types/event'

type PublicBadgePageProps = {
  params: {
    id: string
  }
}

// Create a separate, anonymous Supabase client for public access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function PublicBadgePage({ params }: PublicBadgePageProps) {
  const { id } = params

  const { data: template, error: templateError } = await supabase
    .from('event_badge_templates')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (templateError || !template) {
    notFound()
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('name, description')
    .eq('id', template.event_id)
    .single()

  if (eventError || !event) {
      // Even if the template is public, if the event doesn't exist, it's a 404
      notFound()
  }

  const typedTemplate: BadgeTemplate = template as BadgeTemplate

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        <header className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">HB</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">HappyBadge</span>
            </div>
          <h1 className="text-3xl font-bold text-gray-800">Générez votre badge pour {event.name}</h1>
          <p className="text-lg text-gray-600 mt-2">{event.description}</p>
        </header>
        <main>
          <PublicBadgeCreator template={typedTemplate} />
        </main>
        <footer className="text-center mt-12 text-sm text-gray-500">
            <p>Propulsé par HappyBadge</p>
        </footer>
      </div>
    </div>
  )
}
