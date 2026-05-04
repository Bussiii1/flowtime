'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import * as jose from 'jose'

const profileSchema = z.object({
  first_name: z.string().min(2, 'Le prénom est requis'),
  last_name: z.string().min(2, 'Le nom est requis'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  national_number: z.string().regex(/^\d{2}\.\d{2}\.\d{2}-\d{3}\.\d{2}$/, 'Format requis: YY.MM.DD-XXX.XX'),
  iban: z.string().regex(/^BE\d{14}$/, 'Format requis: BE + 14 chiffres'),
})

export async function updateProfile(formData: z.infer<typeof profileSchema>) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const validatedData = profileSchema.parse(formData)

  const { error } = await supabase
    .from('users')
    .update(validatedData)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/profile')
  return { success: true }
}

export async function uploadAvatar(base64: string, fileName: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const buffer = Buffer.from(base64, 'base64')
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/${fileName}`, buffer, {
      upsert: true,
      contentType: 'image/jpeg'
    })

  if (error) return { error: error.message }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path)

  await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  revalidatePath('/app/profile')
  return { success: true, url: publicUrl }
}

export async function regenerateQR() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const secret = new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY || 'default_secret')
  const token = await new jose.SignJWT({ user_id: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(secret)

  const { error } = await supabase
    .from('users')
    .update({ qr_token: token })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/app/profile')
  return { success: true, token }
}

