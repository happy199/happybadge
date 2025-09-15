"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'
import { useToast } from '@/hooks/use-toast'
import { Calendar, MapPin, Upload, Download, Share2 } from 'lucide-react'

type Event = Database['public']['Tables']['events']['Row']

export default function EventPage() {
  const params = useParams()
  const slug = params.slug as string
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    photo: null as File | null,
  })
  const [selectedTemplate, setSelectedTemplate] = useState('template-1')
  const [generatedBadge, setGeneratedBadge] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchEvent()
    }
  }, [slug])

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single()

      if (error) {
        toast({
          title: "Événement non trouvé",
          description: "Cet événement n'existe pas ou n'est plus actif.",
          variant: "destructive",
        })
      } else {
        setEvent(data)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger l'événement.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
    }
  }

  const handleGenerateBadge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event || !formData.photo) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs et télécharger une photo.",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)

    try {
      // Simulation de la génération de badge
      // Dans une vraie implémentation, vous feriez appel à votre API de génération d'images
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Pour la démo, on génère une URL d'image factice
      const badgeUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`
      
      setGeneratedBadge(badgeUrl)
      
      toast({
        title: "Badge généré !",
        description: "Votre badge personnalisé a été créé avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le badge. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (generatedBadge) {
      const link = document.createElement('a')
      link.href = generatedBadge
      link.download = `badge-${event?.title}-${formData.firstName}-${formData.lastName}.png`
      link.click()
    }
  }

  const handleShare = () => {
    if (navigator.share && generatedBadge) {
      navigator.share({
        title: `J'y serai à ${event?.title} !`,
        text: `Rejoignez-moi à ${event?.title} !`,
        url: window.location.href,
      })
    } else {
      // Fallback : copier le lien
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Lien copié",
        description: "Le lien a été copié dans le presse-papiers.",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'événement...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Événement non trouvé
            </h2>
            <p className="text-gray-600 mb-6">
              Cet événement n'existe pas ou n'est plus disponible.
            </p>
            <Button asChild>
              <a href="/">Retour à l'accueil</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HB</span>
            </div>
            <span className="text-xl font-bold text-gray-900">HappyBadge</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Event Info */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>
            <div className="flex items-center justify-center space-x-6 text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {new Date(event.event_date).toLocaleDateString('fr-FR')}
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {event.location}
              </div>
            </div>
            {event.description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {event.description}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Badge Generator Form */}
            <Card>
              <CardHeader>
                <CardTitle>Créez votre badge "J'y serai"</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous pour générer votre badge personnalisé.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateBadge} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="photo">Votre photo *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        required
                      />
                      <label htmlFor="photo" className="cursor-pointer">
                        <span className="text-sm text-gray-600">
                          {formData.photo ? formData.photo.name : 'Cliquez pour télécharger votre photo'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean.dupont@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Template de badge</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['template-1', 'template-2', 'template-3'].map((template) => (
                        <button
                          key={template}
                          type="button"
                          className={`p-2 border rounded-lg ${
                            selectedTemplate === template
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="w-full h-16 bg-gray-100 rounded"></div>
                          <span className="text-xs mt-1">Template {template.split('-')[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={generating}>
                    {generating ? 'Génération en cours...' : '🎨 Générer mon Badge'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Badge Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Aperçu du badge</CardTitle>
                <CardDescription>
                  Votre badge personnalisé apparaîtra ici après génération.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  {generatedBadge ? (
                    <div className="text-center">
                      <img
                        src={generatedBadge}
                        alt="Badge généré"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="mt-4 flex space-x-2">
                        <Button onClick={handleDownload} className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                        <Button variant="outline" onClick={handleShare}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Partager
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <p>Votre badge apparaîtra ici</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

