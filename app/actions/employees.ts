'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const employeeSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  role: z.enum(['admin', 'employee']).default('employee'),
  status_type: z.enum(['student', 'volunteer', 'extra']).default('extra'),
  hourly_rate: z.number().min(0).default(0),
})

export async function addEmployee(data: z.infer<typeof employeeSchema>) {
  const supabase = createClient()
  
  // Create auth user? Actually, in Supabase magic link flow, we might just invite them or wait for them to log in.
  // But the 'users' table needs an entry.
  // For simplicity, we create the profile. 
  // In a real app, you'd use supabase.auth.admin.inviteUserByEmail.
  
  const { error } = await supabase.from('users').insert(data)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/employees')
  return { success: true }
}

export async function updateEmployee(id: string, data: any) {
  const supabase = createClient()
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath(`/admin/employees/${id}`)
  revalidatePath('/admin/employees')
  return { success: true }
}
