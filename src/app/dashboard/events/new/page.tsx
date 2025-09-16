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
    console.log("handleSubmit called");

    if (!user) {
      console.log("User not found, returning");
      return
    }

    console.log("Setting loading to true");
    setLoading(true)

    try {
      console.log("Inside try block");
      const baseSlug = generateSlug(formData.title)
      console.log("Generated baseSlug:", baseSlug);
      const randomSuffix = Math.random().toString(36).substring(2, 7)
      const slug = `${baseSlug}-${randomSuffix}`
      console.log("Generated final slug:", slug);
      
      console.log("Calling supabase.insert");
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
      console.log("Supabase insert finished. Error:", error, "Data:", data);

      if (error) {
        console.log("Error during insert:", error.message);
        toast({
          title: "Erreur",
          description: "Impossible de créer l'événement. Veuillez réessayer.",
          variant: "destructive",
        })
      } else {
        console.log("Insert successful, redirecting...");
        toast({
          title: "Événement créé",
          description: "Votre événement a été créé avec succès.",
        })
        router.push(`/dashboard/events/${data.id}`)
      }
    } catch (error) {
      console.error("Caught an exception:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      })
    } finally {
      console.log("Setting loading to false in finally block");
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'événement</CardTitle>
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

                <div className="flex justify-end space-x-4 pt-6">
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
