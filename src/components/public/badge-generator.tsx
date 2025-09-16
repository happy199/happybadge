"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type BadgeGeneratorProps = {
  templateId: string
  frameImageUrl: string
}

export default function BadgeGenerator({ templateId, frameImageUrl }: BadgeGeneratorProps) {
  const [userImage, setUserImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUserImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userImage) {
      toast({
        title: "Image manquante",
        description: "Veuillez sélectionner votre photo.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)

    const formData = new FormData()
    formData.append('userImage', userImage)
    formData.append('templateId', templateId)

    try {
      const response = await fetch('/api/generate-badge', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('La génération du badge a échoué.')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'badge-genere.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la génération.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userImage" className="text-center block font-medium">Uploadez votre photo</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <Input
            type="file"
            id="userImage"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            className="hidden"
            required
          />
          <label htmlFor="userImage" className="cursor-pointer text-sm text-blue-600 hover:underline">
            {userImage ? userImage.name : 'Cliquez pour sélectionner une image'}
          </label>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG (MAX. 5MB)</p>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Génération en cours...' : 'Générer et Télécharger mon Badge'}
      </Button>
    </form>
  )
}
