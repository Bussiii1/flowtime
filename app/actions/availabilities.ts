'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const availabilitySchema = z.object({
  date: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  recurring: z.boolean().default(false),
})

export async function createAvailability(formData: z.infer<typeof availabilitySchema>) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const data = availabilitySchema.parse(formData)

  const { error } = await supabase.from('availabilities').insert({
    user_id: user.id,
    date: data.date || null,
    start_time: data.start_time,
    end_time: data.end_time,
    recurring: data.recurring,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/schedule')
  return { success: true }
}

export async function deleteAvailability(id: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('availabilities')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/schedule')
  return { success: true }
}
