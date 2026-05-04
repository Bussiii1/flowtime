import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <p className="text-sm text-muted-foreground">Gérez vos informations personnelles et administratives.</p>
      </div>

      <ProfileClient profile={profile} contract={contract} userEmail={user.email!} />
    </div>
  )
}
