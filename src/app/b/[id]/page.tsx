import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import type { Database } from '@/lib/database.types'

// This is a self-contained version of the page to avoid dependencies on other potentially missing files.

type PublicBadgePageProps = {
  params: {
    id: string
  }
}

export default async function PublicBadgePage({ params }: PublicBadgePageProps) {
  // Using a generic, public client. This is the core of the fix.
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: template, error } = await supabase
    .from('event_badge_templates')
    .select('id, name, frame_image_url, shape')
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

            {/* Inlining the BadgeGenerator for now to reduce dependencies */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userImage" className="text-center block font-medium">Uploadez votre photo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <Input
                    type="file"
                    id="userImage"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    required
                  />
                  <label htmlFor="userImage" className="cursor-pointer text-sm text-blue-600 hover:underline">
                    Cliquez pour sélectionner une image
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG (MAX. 5MB)</p>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Générer et Télécharger mon Badge
              </Button>
            </div>
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
