'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { shiftSchema } from '@/lib/validations'

export async function createShift(formData: any) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { date, start_time, end_time, notes } = shiftSchema.parse(formData)

  // Calculate duration to determine break
  const start = new Date(`${date}T${start_time}`)
  const end = new Date(`${date}T${end_time}`)
  
  // Handle cross-day shifts if needed (basic implementation)
  if (end < start) {
    end.setDate(end.getDate() + 1)
  }

  const durationMs = end.getTime() - start.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  
  // Auto-deduct 30 min break if shift > 7.5 hours
  const break_minutes = durationHours > 7.5 ? 30 : 0

  const { error } = await supabase.from('shifts').insert({
    user_id: user.id,
    date,
    start_time,
    end_time,
    break_minutes,
    notes,
    status: 'pending',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app')
  return { success: true }
}
