"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type PublicBadgeCreatorProps = {
  templateId: string
  templateName: string
  frameImageUrl: string
}

export default function PublicBadgeCreator({ templateId, templateName, frameImageUrl }: PublicBadgeCreatorProps) {
  const [userImage, setUserImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Cleanup function to revoke the object URL to prevent memory leaks
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setUserImage(file)

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl(URL.createObjectURL(file))
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
        const errorText = await response.text()
        throw new Error(errorText || 'La génération du badge a échoué.')
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-center mb-4">{templateName}</h2>
      <div className="relative mb-4 aspect-square w-full bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Aperçu de votre photo"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        ) : (
          <div className="w-full h-full bg-gray-300/50 flex items-center justify-center z-0">
            <p className="text-gray-500 text-sm">Votre photo apparaîtra ici</p>
          </div>
        )}
        <img
          src={frameImageUrl}
          alt="Cadre du badge"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      </div>

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
        <Button type="submit" className="w-full" disabled={loading || !userImage}>
          {loading ? 'Génération en cours...' : 'Générer et Télécharger mon Badge'}
        </Button>
      </form>
    </div>
  )
}
