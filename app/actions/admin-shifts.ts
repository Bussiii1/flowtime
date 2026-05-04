'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function validateShift(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('shifts')
    .update({ 
      status: 'validated',
      validated_by: user.id,
      validated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/validation')
  return { success: true }
}

export async function bulkValidate(ids: string[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('shifts')
    .update({ 
      status: 'validated',
      validated_by: user.id,
      validated_at: new Date().toISOString()
    })
    .in('id', ids)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/validation')
  return { success: true }
}

export async function rejectShift(id: string, notes?: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('shifts')
    .update({ status: 'rejected', notes })
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/validation')
  return { success: true }
}

export async function updateShift(id: string, data: any) {
  const supabase = createClient()
  const { error } = await supabase
    .from('shifts')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/validation')
  return { success: true }
}
