"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { generateSlug } from '@/lib/utils'
import { ArrowLeft, Calendar, MapPin, Upload } from 'lucide-react'
import Link from 'next/link'

export default function NewEventPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    logo_url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer un événement.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const baseSlug = generateSlug(formData.title)
      const randomSuffix = Math.random().toString(36).substring(2, 7)
      const slug = `${baseSlug}-${randomSuffix}`
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          event_date: formData.event_date,
          location: formData.location,
          logo_url: formData.logo_url || null,
          slug,
          status: 'active',
          settings: {},
        })
        .select()
        .single()

      if (error) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible de créer l'événement. Veuillez réessayer.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Événement créé",
          description: "Votre événement a été créé avec succès.",
        })
        router.push(`/dashboard/events/${data.id}`)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HB</span>
              </div>
              <span className="text-xl font-bold text-gray-900">HappyBadge</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Créer un nouvel événement
            </h1>
            <p className="text-gray-600">
              Remplissez les informations de base pour créer votre événement et commencer à générer des badges.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informations de l'événement</CardTitle>
              <CardDescription>
                Ces informations seront visibles sur la page publique de génération de badges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Nom de l'événement *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Conférence Tech 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre événement..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Date de l'événement *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Lieu *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="Ex: Paris, France"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL du logo (optionnel)</Label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="logo_url"
                      placeholder="https://exemple.com/logo.png"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Vous pourrez ajouter un logo plus tard dans les paramètres de l'événement.
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard">Annuler</Link>
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Création...' : 'Créer l\'événement'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
