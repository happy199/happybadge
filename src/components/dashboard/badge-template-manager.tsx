"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/database.types'
import CreateTemplateForm from './create-template-form'

type BadgeTemplate = Database['public']['Tables']['event_badge_templates']['Row']

type BadgeTemplateManagerProps = {
  eventId: string
  userId: string
}

export default function BadgeTemplateManager({ eventId, userId }: BadgeTemplateManagerProps) {
  const [templates, setTemplates] = useState<BadgeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewingTemplate, setViewingTemplate] = useState<BadgeTemplate | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!viewingTemplate) return

    const isConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le modèle "${viewingTemplate.name}" ? Cette action est irréversible.`
    )

    if (isConfirmed) {
      try {
        // 1. Delete image from storage
        const url = viewingTemplate.frame_image_url
        const filePath = url.substring(url.indexOf('/badge_frames/') + '/badge_frames/'.length)

        const { error: storageError } = await supabase.storage
          .from('badge_frames')
          .remove([filePath])

        if (storageError) {
          // Log error but proceed, as the user might have deleted the file manually
          console.error("Could not delete storage object, but proceeding with DB deletion:", storageError)
        }

        // 2. Delete template from database
        const { error: dbError } = await supabase
          .from('event_badge_templates')
          .delete()
          .eq('id', viewingTemplate.id)

        if (dbError) {
          throw dbError
        }

        toast({
          title: "Modèle supprimé",
          description: `Le modèle "${viewingTemplate.name}" a été supprimé.`,
        })

        setViewingTemplate(null)
        fetchTemplates() // Refresh the list
      } catch (error: any) {
        toast({
          title: "Erreur de suppression",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('event_badge_templates')
        .select('*')
        .eq('event_id', eventId)

      if (error) {
        throw error
      }

      setTemplates(data || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les modèles de badges.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [eventId, toast])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  if (showCreateForm) {
    return (
      <div className="mt-8">
        <CreateTemplateForm
          eventId={eventId}
          userId={userId}
          onCancel={() => setShowCreateForm(false)}
          onFormSubmit={() => {
            setShowCreateForm(false)
            fetchTemplates() // Refresh the list after creation
          }}
        />
      </div>
    )
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Modèles de Badge</CardTitle>
          <CardDescription>Gérez les modèles de badge pour cet événement.</CardDescription>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau Modèle
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Chargement des modèles...</p>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">Aucun modèle de badge créé pour cet événement.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Créer votre premier modèle
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={template.frame_image_url}
                    alt={`Cadre pour ${template.name}`}
                    className="h-16 w-16 rounded-md object-cover bg-gray-100"
                  />
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">Forme: {template.shape}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setViewingTemplate(template)}>
                  Gérer
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {viewingTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setViewingTemplate(null)}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-xl max-w-xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">{viewingTemplate.name}</h2>
            <div className="relative">
              <img
                src={viewingTemplate.frame_image_url}
                alt={`Aperçu pour ${viewingTemplate.name}`}
                className="w-full h-auto rounded-md object-contain max-h-[70vh]"
              />
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Supprimer
              </Button>
              <Button variant="outline" onClick={() => setViewingTemplate(null)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
