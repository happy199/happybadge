"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement file upload and database insert
    console.log({ name, shape, eventId, userId })
    onFormSubmit() // This will eventually refresh the list
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
          {/* Placeholder for file input */}
          <div className="space-y-2">
            <Label>Image du cadre</Label>
            <div className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">L'upload de fichier sera ajouté bientôt.</p>
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
