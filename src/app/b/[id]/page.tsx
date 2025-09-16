import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import PublicBadgeCreator from '@/components/public/public-badge-creator'
import type { Database } from '@/lib/database.types'

type PublicBadgePageProps = {
  params: {
    id: string
  }
}

export default async function PublicBadgePage({ params }: PublicBadgePageProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: template, error } = await supabase
    .from('event_badge_templates')
    .select('id, name, frame_image_url')
    .eq('id', params.id)
    .eq('is_public', true)
    .single()

  if (error || !template) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">HB</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">HappyBadge</span>
            </div>
          <h1 className="text-2xl font-bold text-gray-800">Générez votre badge</h1>
          <p className="text-gray-600">Uploadez votre photo pour la fusionner avec le cadre de l'événement.</p>
        </header>

        <main>
          <PublicBadgeCreator
            templateId={template.id}
            templateName={template.name}
            frameImageUrl={template.frame_image_url}
          />
        </main>

        <footer className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Propulsé par <a href="#" className="font-semibold hover:underline">HappyBadge</a>
          </p>
        </footer>
      </div>
    </div>
  )
}
