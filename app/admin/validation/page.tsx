import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ValidationClient from './validation-client'

export default async function ValidationPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/app')

  // Fetch all pending shifts with user details
  const { data: shifts } = await supabase
    .from('shifts')
    .select('*, users(first_name, last_name, avatar_url, hourly_rate)')
    .eq('status', 'pending')
    .order('date', { ascending: true })

  // Fetch unique employees for the filter
  const { data: employees } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('role', 'employee')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">Validation des heures</h1>
        <p className="text-muted-foreground font-medium">Vérifiez et validez les déclarations de shifts de vos équipes.</p>
      </div>

      <ValidationClient 
        initialShifts={shifts || []} 
        employees={employees || []} 
      />
    </div>
  )
}
