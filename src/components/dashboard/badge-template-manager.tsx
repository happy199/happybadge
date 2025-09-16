"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
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
  const [supabase] = useState(() => createClient())
  const [templates, setTemplates] = useState<BadgeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BadgeTemplate | null>(null)
  const [viewingTemplate, setViewingTemplate] = useState<BadgeTemplate | null>(null)
  const { toast } = useToast()

  const handleDownload = async () => {
    if (!viewingTemplate) return
    try {
      const response = await fetch(viewingTemplate.frame_image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fileExtension = viewingTemplate.frame_image_url.split('.').pop() || 'png'
      a.download = `${viewingTemplate.name}-frame.${fileExtension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger l'image.",
        variant: "destructive",
      })
    }
  }

  const handleCopyLink = () => {
    if (!viewingTemplate) return
    const publicUrl = `${window.location.origin}/b/${viewingTemplate.id}`
    navigator.clipboard.writeText(publicUrl)
    toast({
      title: "Lien copié !",
      description: "Le lien public a été copié dans votre presse-papiers.",
    })
  }

  const handleTogglePublic = async () => {
    if (!viewingTemplate) return

    const newStatus = !viewingTemplate.is_public

    try {
      const { data, error } = await supabase
        .from('event_badge_templates')
        .update({ is_public: newStatus })
        .eq('id', viewingTemplate.id)
        .select()
        .single()

      if (error) throw error

      setViewingTemplate(data)
      fetchTemplates()
      toast({
        title: "Statut mis à jour",
        description: `Le modèle est maintenant ${newStatus ? 'public' : 'privé'}.`,
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (template: BadgeTemplate) => {
    setViewingTemplate(null)
    setEditingTemplate(template)
    setShowCreateForm(true)
  }

  const handleDelete = async () => {
    if (!viewingTemplate) return

    const isConfirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le modèle "${viewingTemplate.name}" ? Cette action est irréversible.`
    )

    if (isConfirmed) {
      try {
        const url = viewingTemplate.frame_image_url
        const filePath = url.substring(url.indexOf('/badge_frames/') + '/badge_frames/'.length)

        await supabase.storage.from('badge_frames').remove([filePath])

        const { error: dbError } = await supabase
          .from('event_badge_templates')
          .delete()
          .eq('id', viewingTemplate.id)

        if (dbError) throw dbError

        toast({
          title: "Modèle supprimé",
          description: `Le modèle "${viewingTemplate.name}" a été supprimé.`,
        })

        setViewingTemplate(null)
        fetchTemplates()
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

      if (error) throw error

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
  }, [eventId, toast, supabase])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  if (showCreateForm) {
    return (
      <div className="mt-8">
        <CreateTemplateForm
          eventId={eventId}
          userId={userId}
          initialData={editingTemplate}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingTemplate(null)
          }}
          onFormSubmit={() => {
            setShowCreateForm(false)
            setEditingTemplate(null)
            fetchTemplates()
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
        <Button onClick={() => {
          setEditingTemplate(null)
          setShowCreateForm(true)
        }}>
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
            <div className="border-t my-4"></div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="public-status" className="font-medium">Statut Public</Label>
                <Button onClick={handleTogglePublic} size="sm" variant="secondary">
                  {viewingTemplate.is_public ? "Rendre Privé" : "Rendre Public"}
                </Button>
              </div>
              {viewingTemplate.is_public && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="public-link" className="font-medium">Lien de Partage</Label>
                  <Button onClick={handleCopyLink} size="sm">
                    Copier le lien
                  </Button>
                </div>
              )}
            </div>
            <div className="border-t my-4"></div>
            <div className="mt-4 flex justify-between">
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Supprimer
              </Button>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={handleDownload}>
                  Télécharger
                </Button>
                <Button variant="secondary" onClick={() => handleEdit(viewingTemplate)}>
                  Modifier
                </Button>
                <Button variant="outline" onClick={() => setViewingTemplate(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
