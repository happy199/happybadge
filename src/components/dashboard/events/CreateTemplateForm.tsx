"use client"

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { BadgeTemplate } from '@/types/badge'
import Image from 'next/image'

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  is_public: z.boolean(),
  frame_image_url: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CreateTemplateFormProps {
  event_id: string
  existingTemplate?: BadgeTemplate | null
  onSuccess: (template: BadgeTemplate) => void
  onCancel: () => void
}

export default function CreateTemplateForm({
  event_id,
  existingTemplate,
  onSuccess,
  onCancel,
}: CreateTemplateFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(existingTemplate?.frame_image_url || null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: existingTemplate?.name || '',
      is_public: existingTemplate?.is_public || false,
      frame_image_url: existingTemplate?.frame_image_url || '',
    },
  })

  const isPublic = watch('is_public')

  useEffect(() => {
    if (existingTemplate) {
      setValue('name', existingTemplate.name)
      setValue('is_public', existingTemplate.is_public)
      setValue('frame_image_url', existingTemplate.frame_image_url)
      setImagePreview(existingTemplate.frame_image_url)
    }
  }, [existingTemplate, setValue])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${event_id}-${Date.now()}.${fileExt}`
    const filePath = `badge_frames/${fileName}`

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('badge_frames')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Erreur d'upload de l'image: ${uploadError.message}`)
    }

    const { data: publicUrlData } = supabase.storage
      .from('badge_frames')
      .getPublicUrl(filePath)

    if (!publicUrlData) {
        throw new Error("Impossible d'obtenir l'URL publique de l'image.")
    }

    return publicUrlData.publicUrl
  }

  const deleteImage = async (imageUrl: string) => {
    try {
        const url = new URL(imageUrl)
        const path = url.pathname.split('/badge_frames/')[1]
        if (!path) return

        await supabase.storage.from('badge_frames').remove([path])
    } catch (error) {
        console.error("Erreur lors de la suppression de l'ancienne image:", error)
    }
  }


  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
        let imageUrl = existingTemplate?.frame_image_url || ''

        // Si une nouvelle image est sélectionnée, la télécharger
        if (imageFile) {
            // Si une ancienne image existait, la supprimer
            if(existingTemplate?.frame_image_url) {
                await deleteImage(existingTemplate.frame_image_url)
            }
            imageUrl = await uploadImage(imageFile)
        } else if (!imageUrl && !existingTemplate) {
            // Si aucune image n'est fournie pour un nouveau template
            toast({
                title: 'Erreur',
                description: 'Veuillez sélectionner une image de cadre.',
                variant: 'destructive',
            })
            setLoading(false)
            return
        }

        const templateData = {
            name: data.name,
            is_public: data.is_public,
            frame_image_url: imageUrl,
            event_id: event_id,
        }

        let result
        if (existingTemplate) {
            // Mise à jour
            const { data: updatedData, error } = await supabase
            .from('event_badge_templates')
            .update(templateData)
            .eq('id', existingTemplate.id)
            .select()
            .single()

            if (error) throw error
            result = updatedData
        } else {
            // Création
            const { data: newData, error } = await supabase
            .from('event_badge_templates')
            .insert(templateData)
            .select()
            .single()

            if (error) throw error
            result = newData
        }

        toast({
            title: existingTemplate ? 'Template mis à jour' : 'Template créé',
            description: 'Le template a été sauvegardé avec succès.',
        })

        if(result) {
          onSuccess(result)
        }

    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du template</Label>
        <Input id="name" {...register('name')} placeholder="Ex: Cadre VIP" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div className="flex items-center space-x-4">
        <Label htmlFor="is_public">Rendre public?</Label>
        <Switch
          id="is_public"
          checked={isPublic}
          onCheckedChange={(checked) => setValue('is_public', checked)}
        />
        <span className="text-sm text-gray-500">
          {isPublic ? 'Accessible par tous via un lien.' : 'Privé et uniquement visible par vous.'}
        </span>
      </div>
      <div className="space-y-2">
        <Label>Image du cadre</Label>
        <div
            className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
        >
            {imagePreview ? (
                <Image src={imagePreview} alt="Aperçu du cadre" width={192} height={192} className="object-contain h-full" />
            ) : (
                <span className="text-gray-500">Cliquez pour choisir une image</span>
            )}
        </div>
        <Input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
        />
      </div>
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Sauvegarde...' : (existingTemplate ? 'Mettre à jour' : 'Créer')}
        </Button>
      </div>
    </form>
  )
}
