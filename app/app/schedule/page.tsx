import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScheduleClient from './schedule-client'

export default async function SchedulePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: availabilities } = await supabase
    .from('availabilities')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Mes Disponibilités</h1>
        <p className="text-sm text-muted-foreground">Indiquez quand vous êtes disponible pour travailler.</p>
      </div>
      
      <ScheduleClient initialAvailabilities={availabilities || []} />
    </div>
  )
}
