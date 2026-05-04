import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EmployeesClient from './employees-client'

export default async function EmployeesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/app')

  // Fetch all employees
  const { data: employees } = await supabase
    .from('users')
    .select('*, shifts(start_time, end_time, break_minutes, status)')
    .eq('role', 'employee')
    .order('last_name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">Gestion des Employés</h1>
        <p className="text-muted-foreground font-medium">Gérez votre staff, les contrats et les limites d&apos;heures.</p>
      </div>

      <EmployeesClient initialEmployees={employees || []} />
    </div>
  )
}
