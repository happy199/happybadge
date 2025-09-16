"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Upload } from 'lucide-react'

import type { Database } from '@/lib/database.types'

type BadgeTemplate = Database['public']['Tables']['event_badge_templates']['Row']

type CreateTemplateFormProps = {
  onFormSubmit: () => void
  onCancel: () => void
  eventId: string
  userId: string
  initialData?: BadgeTemplate | null
}

export default function CreateTemplateForm({
  onFormSubmit,
  onCancel,
  eventId,
  userId,
  initialData = null,
}: CreateTemplateFormProps) {
  const [name, setName] = useState('')
  const [shape, setShape] = useState('square')
  const [frameImage, setFrameImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const isEditMode = !!initialData

  useEffect(() => {
    if (isEditMode && initialData) {
      setName(initialData.name)
      setShape(initialData.shape)
    }
  }, [isEditMode, initialData, setName, setShape])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFrameImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let frameUrl = isEditMode ? initialData.frame_image_url : ''

      // Handle file upload if a new image is provided (for both create and edit)
      if (frameImage) {
        // If editing, delete the old image first
        if (isEditMode && initialData.frame_image_url) {
          const oldFilePath = initialData.frame_image_url.substring(
            initialData.frame_image_url.indexOf('/badge_frames/') + '/badge_frames/'.length
          )
          await supabase.storage.from('badge_frames').remove([oldFilePath])
        }

        const fileExtension = frameImage.name.split('.').pop()
        const randomSuffix = Math.random().toString(36).substring(2, 12)
        const filePath = `${userId}/${eventId}/${name.replace(/\s+/g, '-')}-${randomSuffix}.${fileExtension}`

        const { error: uploadError } = await supabase.storage
          .from('badge_frames')
          .upload(filePath, frameImage)
        if (uploadError) throw new Error(`Erreur d'upload: ${uploadError.message}`)

        const { data: urlData } = supabase.storage
          .from('badge_frames')
          .getPublicUrl(filePath)
        if (!urlData?.publicUrl) throw new Error("Impossible de récupérer l'URL publique de l'image.")
        frameUrl = urlData.publicUrl
      }

      if (isEditMode) {
        // Update logic
        const { error } = await supabase
          .from('event_badge_templates')
          .update({ name, shape, frame_image_url: frameUrl })
          .eq('id', initialData.id)

        if (error) throw error
        toast({ title: "Succès", description: "Modèle mis à jour." })
      } else {
        // Create logic
        if (!frameUrl) {
          toast({ title: "Image manquante", description: "Veuillez sélectionner une image pour le cadre.", variant: "destructive" })
          setLoading(false)
          return
        }
        const { error: insertError } = await supabase
          .from('event_badge_templates')
          .insert({ name, shape, event_id: eventId, user_id: userId, frame_image_url: frameUrl })
        if (insertError) throw new Error(`Erreur base de données: ${insertError.message}`)

        toast({ title: "Modèle créé", description: "Votre nouveau modèle de badge a été créé avec succès." })
      }
      onFormSubmit()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur inattendue s'est produite.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Modifier le modèle' : 'Créer un nouveau modèle de badge'}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Modifiez les détails de votre modèle."
            : "Définissez les propriétés de votre nouveau modèle."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du modèle</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Modèle Standard"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shape">Forme</Label>
            <Input
              id="shape"
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              placeholder="Ex: square, circle"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frameImage">{isEditMode ? "Remplacer l'image du cadre (optionnel)" : "Image du cadre *"}</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <Input
                type="file"
                id="frameImage"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="hidden"
                required={!isEditMode}
              />
              <label htmlFor="frameImage" className="cursor-pointer text-sm text-blue-600 hover:underline">
                {frameImage ? frameImage.name : (isEditMode && initialData?.frame_image_url ? "Sélectionner une nouvelle image" : 'Cliquez pour sélectionner une image')}
              </label>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG (MAX. 5MB)</p>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEditMode ? 'Mise à jour...' : 'Création...') : (isEditMode ? 'Mettre à jour' : 'Créer le modèle')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
