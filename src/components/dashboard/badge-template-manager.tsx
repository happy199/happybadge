"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/lib/database.types'

type BadgeTemplate = Database['public']['Tables']['event_badge_templates']['Row']

type BadgeTemplateManagerProps = {
  eventId: string
  userId: string
}

export default function BadgeTemplateManager({ eventId, userId }: BadgeTemplateManagerProps) {
  const [templates, setTemplates] = useState<BadgeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTemplates = async () => {
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
    }

    fetchTemplates()
  }, [eventId, toast])

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Modèles de Badge</CardTitle>
          <CardDescription>Gérez les modèles de badge pour cet événement.</CardDescription>
        </div>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau Modèle
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Chargement des modèles...</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun modèle de badge créé pour cet événement.</p>
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
