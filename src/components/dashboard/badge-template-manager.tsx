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
  const { toast } = useToast()

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
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">Forme: {template.shape}</p>
                </div>
                {/* Placeholder for future actions */}
                <Button variant="outline" size="sm">Gérer</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
