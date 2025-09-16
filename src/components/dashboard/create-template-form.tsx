"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { Upload } from 'lucide-react'

type CreateTemplateFormProps = {
  onFormSubmit: () => void
  onCancel: () => void
  eventId: string
  userId: string
}

export default function CreateTemplateForm({
  onFormSubmit,
  onCancel,
  eventId,
  userId,
}: CreateTemplateFormProps) {
  const [name, setName] = useState('')
  const [shape, setShape] = useState('square')
  const [frameImage, setFrameImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFrameImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!frameImage) {
      toast({
        title: "Image manquante",
        description: "Veuillez sélectionner une image pour le cadre.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // 1. Upload frame image to Supabase Storage
      const fileExtension = frameImage.name.split('.').pop()
      const randomSuffix = Math.random().toString(36).substring(2, 12)
      const filePath = `${userId}/${eventId}/${name.replace(/\s+/g, '-')}-${randomSuffix}.${fileExtension}`

      const { error: uploadError } = await supabase.storage
        .from('badge_frames')
        .upload(filePath, frameImage)

      if (uploadError) {
        throw new Error(`Erreur d'upload: ${uploadError.message}`)
      }

      // 2. Get public URL of the uploaded image
      const { data: urlData } = supabase.storage
        .from('badge_frames')
        .getPublicUrl(filePath)

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Impossible de récupérer l'URL publique de l'image.")
      }

      // 3. Insert new template into the database
      const { error: insertError } = await supabase
        .from('event_badge_templates')
        .insert({
          name,
          shape,
          event_id: eventId,
          user_id: userId,
          frame_image_url: urlData.publicUrl,
        })

      if (insertError) {
        throw new Error(`Erreur base de données: ${insertError.message}`)
      }

      toast({
        title: "Modèle créé",
        description: "Votre nouveau modèle de badge a été créé avec succès.",
      })
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
        <CardTitle>Créer un nouveau modèle de badge</CardTitle>
        <CardDescription>
          Définissez les propriétés de votre nouveau modèle.
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
            <Label htmlFor="frameImage">Image du cadre</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <Input
                type="file"
                id="frameImage"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label htmlFor="frameImage" className="cursor-pointer text-sm text-blue-600 hover:underline">
                {frameImage ? frameImage.name : 'Cliquez pour sélectionner une image'}
              </label>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG (MAX. 5MB)</p>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le modèle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
