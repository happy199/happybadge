"use client"

import { useState, useRef, useEffect } from 'react'
import { BadgeTemplate } from '@/types/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface PublicBadgeCreatorProps {
  template: BadgeTemplate
}

export default function PublicBadgeCreator({ template }: PublicBadgeCreatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  const frameImage = useRef(new Image())

  useEffect(() => {
    // To avoid CORS issues with canvas.
    frameImage.current.crossOrigin = "anonymous"
    frameImage.current.src = template.frame_image_url
    frameImage.current.onload = () => {
        drawCanvas()
    }
  }, [template.frame_image_url])

  useEffect(() => {
    drawCanvas()
  }, [userImage, scale, position])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // Reset scale and position for new image
          const canvas = canvasRef.current
          if (!canvas) return

          const canvasAspect = canvas.width / canvas.height;
          const imgAspect = img.width / img.height;

          let newScale;
          if (imgAspect > canvasAspect) {
              // Image is wider than canvas
              newScale = canvas.width / img.width;
          } else {
              // Image is taller than canvas
              newScale = canvas.height / img.height;
          }

          setUserImage(img)
          setScale(newScale)
          setPosition({ x: 0, y: 0 })
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)


    // Draw user image (background)
    if (userImage) {
      const scaledWidth = userImage.width * scale
      const scaledHeight = userImage.height * scale
      const x = position.x + (canvas.width - scaledWidth) / 2
      const y = position.y + (canvas.height - scaledHeight) / 2
      ctx.drawImage(userImage, x, y, scaledWidth, scaledHeight)
    }

    // Draw frame image (foreground)
    if (frameImage.current.complete) {
        ctx.drawImage(frameImage.current, 0, 0, canvas.width, canvas.height)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!userImage) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && userImage) {
      const x = e.clientX - dragStart.x
      const y = e.clientY - dragStart.y
      setPosition({ x, y })
    }
  }

  const handleMouseLeave = () => {
      setIsDragging(false)
  }

  const generateBadge = async () => {
    const canvas = canvasRef.current
    if (!canvas || !userImage) {
      toast({
        title: 'Image manquante',
        description: 'Veuillez dabord choisir une photo.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    // Get the image data from the canvas
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast({ title: 'Erreur', description: 'Impossible de générer l\'image.', variant: 'destructive' })
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append('imageData', blob, 'badge.png')
      formData.append('templateId', template.id)
      formData.append('eventId', template.event_id)

      try {
        const response = await fetch('/api/generate-badge', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Une erreur est survenue')
        }

        const finalImageBlob = await response.blob()
        const url = window.URL.createObjectURL(finalImageBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `happybadge-${template.id}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)

        toast({
            title: 'Badge généré !',
            description: 'Votre badge a été téléchargé.'
        })

      } catch (error: any) {
        toast({
          title: 'Erreur de génération',
          description: error.message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }, 'image/png')
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4 space-y-6">
        <div className="aspect-w-1 aspect-h-1">
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full h-full border rounded-lg shadow-lg cursor-grab"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
        </div>

      {!userImage && (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">Commencez par choisir votre photo</h3>
            <p className="text-sm text-gray-500 mb-4">Elle sera placée sous le cadre de l'événement.</p>
            <Button asChild>
                <label htmlFor="image-upload" className="cursor-pointer">
                    Choisir une photo
                    <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
            </Button>
        </div>
      )}

      {userImage && (
        <div className="p-4 border rounded-lg space-y-4">
          <div>
            <Label>Zoom</Label>
            <Slider
              min={0.1}
              max={3}
              step={0.01}
              value={[scale]}
              onValueChange={(value) => setScale(value[0])}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline">
                <label htmlFor="image-upload" className="cursor-pointer">
                    Changer de photo
                    <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </Button>
              <Button onClick={generateBadge} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Génération...' : 'Générer et Télécharger'}
              </Button>
          </div>
        </div>
      )}
    </div>
  )
}
