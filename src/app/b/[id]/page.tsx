import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import BadgeGenerator from '@/components/public/badge-generator'

type PublicBadgePageProps = {
  params: {
    id: string
  }
}

export default async function PublicBadgePage({ params }: PublicBadgePageProps) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: template, error } = await supabase
    .from('event_badge_templates')
    .select('*')
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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-center mb-4">{template.name}</h2>

            <div className="relative mb-4 aspect-square w-full bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={template.frame_image_url}
                alt={`Cadre pour ${template.name}`}
                className="absolute inset-0 w-full h-full object-cover z-10"
              />
              <div className="w-full h-full bg-gray-300/50 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Votre photo ici</p>
              </div>
            </div>

            <BadgeGenerator
              templateId={template.id}
              frameImageUrl={template.frame_image_url}
            />
          </div>
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
