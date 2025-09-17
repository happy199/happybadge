import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Public client to fetch public templates
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client for analytics insertion, bypassing RLS
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const formData = await request.formData()
  const userImageFile = formData.get('userImage') as File | null
  const templateId = formData.get('templateId') as string | null

  if (!userImageFile || !templateId) {
    return new NextResponse('Missing userImage or templateId', { status: 400 })
  }

  try {
    // 1. Fetch the template data using the public client
    const { data: template, error: templateError } = await supabase
      .from('event_badge_templates')
      .select('frame_image_url, shape')
      .eq('id', templateId)
      .eq('is_public', true)
      .single()

    if (templateError || !template) {
      return new NextResponse('Template not found or not public', { status: 404 })
    }

    // 2. Fetch images into buffers
    const frameImageResponse = await fetch(template.frame_image_url)
    if (!frameImageResponse.ok) throw new Error('Failed to fetch frame image')
    const frameImageBuffer = await frameImageResponse.arrayBuffer()

    const userImageBuffer = await userImageFile.arrayBuffer()

    // 3. Composite images with sharp
    const frameMetadata = await sharp(frameImageBuffer).metadata()
    const frameWidth = frameMetadata.width || 512
    const frameHeight = frameMetadata.height || 512

    const userImageResized = await sharp(userImageBuffer)
      .resize({
        width: Math.floor(frameWidth * 0.8),
        height: Math.floor(frameHeight * 0.8),
        fit: 'cover',
        position: 'center'
      })
      .toBuffer()

    let finalUserImage = userImageResized;
    if (template.shape === 'circle') {
      const radius = Math.floor((frameWidth * 0.8) / 2)
      const circleSvg = Buffer.from(
        `<svg><circle cx="${radius}" cy="${radius}" r="${radius}" /></svg>`
      )
      finalUserImage = await sharp(userImageResized)
        .composite([{ input: circleSvg, blend: 'dest-in' }])
        .png() // Ensure output is png for transparency
        .toBuffer()
    }

    const finalImageBuffer = await sharp(frameImageBuffer)
      .composite([
        {
          input: finalUserImage,
          gravity: 'center',
        },
      ])
      .png()
      .toBuffer()

    // 4. Track the generation event (using admin client to bypass RLS)
    await supabaseAdmin.from('event_badge_generations').insert({
      template_id: templateId,
      metadata: { success: true },
    })

    // 5. Return the final image for download
    return new NextResponse(finalImageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="badge.png"`,
      },
    })

  } catch (error: any) {
    console.error("Error generating badge:", error);
    await supabaseAdmin.from('event_badge_generations').insert({
      template_id: templateId,
      metadata: { success: false, error: error.message },
    })
    return new NextResponse('Error generating badge', { status: 500 })
  }
}
