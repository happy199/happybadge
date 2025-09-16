"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BadgeTemplate } from '@/types/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import CreateTemplateForm from './CreateTemplateForm'
import { useToast } from '@/hooks/use-toast'
import { PlusCircle, MoreHorizontal, Trash2, Edit, Link as LinkIcon, Download, Copy, Check } from 'lucide-react'
import Image from 'next/image'

interface BadgeTemplateManagerProps {
  event_id: string
  initialTemplates: BadgeTemplate[]
}

export default function BadgeTemplateManager({ event_id, initialTemplates }: BadgeTemplateManagerProps) {
  const [templates, setTemplates] = useState<BadgeTemplate[]>(initialTemplates)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<BadgeTemplate | null>(null)
  const [templateToDelete, setTemplateToDelete] = useState<BadgeTemplate | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const { toast } = useToast()

  const handleFormSuccess = (newOrUpdatedTemplate: BadgeTemplate) => {
    if (selectedTemplate) {
      // Update
      setTemplates(templates.map(t => t.id === newOrUpdatedTemplate.id ? newOrUpdatedTemplate : t))
    } else {
      // Create
      setTemplates([...templates, newOrUpdatedTemplate])
    }
    setIsModalOpen(false)
    setSelectedTemplate(null)
  }

  const openCreateModal = () => {
    setSelectedTemplate(null)
    setIsModalOpen(true)
  }

  const openEditModal = (template: BadgeTemplate) => {
    setSelectedTemplate(template)
    setIsModalOpen(true)
  }

  const openDeleteDialog = (template: BadgeTemplate) => {
    setTemplateToDelete(template);
    setIsDeleteDialogOpen(true);
  };

  const deleteImage = async (imageUrl: string) => {
    try {
        const url = new URL(imageUrl)
        const path = url.pathname.split('/badge_frames/')[1]
        if (!path) return

        await supabase.storage.from('badge_frames').remove([path])
    } catch (error) {
        console.error("Erreur lors de la suppression de l'image:", error)
    }
  }

  const handleDelete = async () => {
    if (!templateToDelete) return

    try {
      // First, delete the record from the database
      const { error } = await supabase
        .from('event_badge_templates')
        .delete()
        .eq('id', templateToDelete.id)

      if (error) throw error

      // If DB deletion is successful, delete the image from storage
      if (templateToDelete.frame_image_url) {
          await deleteImage(templateToDelete.frame_image_url)
      }

      setTemplates(templates.filter(t => t.id !== templateToDelete.id))
      toast({
        title: 'Template supprimé',
        description: 'Le template a été supprimé avec succès.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
        setIsDeleteDialogOpen(false)
        setTemplateToDelete(null)
    }
  }

  const handleCopyLink = (templateId: string) => {
    const link = `${window.location.origin}/b/${templateId}`
    navigator.clipboard.writeText(link).then(() => {
        setCopiedLink(templateId)
        setTimeout(() => setCopiedLink(null), 2000) // Reset after 2s
    }).catch(err => {
        toast({ title: 'Erreur', description: 'Impossible de copier le lien', variant: 'destructive' })
    })
  }

  const handleTogglePublic = async (template: BadgeTemplate) => {
      try {
          const { data, error } = await supabase
            .from('event_badge_templates')
            .update({ is_public: !template.is_public })
            .eq('id', template.id)
            .select()
            .single()

          if (error) throw error

          setTemplates(templates.map(t => t.id === data.id ? data : t))
          toast({ title: 'Statut mis à jour', description: `Le template est maintenant ${data.is_public ? 'public' : 'privé'}.`})

      } catch (error: any) {
          toast({ title: 'Erreur', description: error.message, variant: 'destructive'})
      }
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Badges de l'événement</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{selectedTemplate ? 'Modifier le template' : 'Créer un nouveau template'}</DialogTitle>
              <DialogDescription>
                Configurez les détails de votre template de badge ici.
              </DialogDescription>
            </DialogHeader>
            <CreateTemplateForm
              event_id={event_id}
              existingTemplate={selectedTemplate}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsModalOpen(false)
                setSelectedTemplate(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">Aucun template de badge pour cet événement.</p>
            <p className="text-sm text-gray-400">Cliquez sur "Nouveau Template" pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="border rounded-lg shadow-sm overflow-hidden">
              <div className="relative w-full h-48 bg-gray-100">
                <Image
                    src={template.frame_image_url}
                    alt={template.name}
                    layout="fill"
                    objectFit="contain"
                    className="p-2"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditModal(template)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Modifier</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublic(template)}>
                            {template.is_public ? 'Rendre privé' : 'Rendre public'}
                        </DropdownMenuItem>
                        {template.is_public && (
                            <DropdownMenuItem onClick={() => handleCopyLink(template.id)}>
                                {copiedLink === template.id ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                                <span>Copier le lien public</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                           <a href={template.frame_image_url} download={`frame-${template.id}.png`}>
                             <Download className="mr-2 h-4 w-4" />
                             <span>Télécharger le cadre</span>
                           </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={() => openDeleteDialog(template)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Supprimer</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <p className={`text-sm ${template.is_public ? 'text-green-600' : 'text-gray-500'}`}>
                    {template.is_public ? 'Public' : 'Privé'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce template ?</AlertDialogTitle>
            <AlertDialogDescription>
                Cette action est irréversible. Le template et son image de cadre associée seront définitivement supprimés.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                Supprimer
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
