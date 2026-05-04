import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PayrollClient from './payroll-client'

export default async function PayrollPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') redirect('/app')

  // Fetch validated shifts with user data
  const { data: shifts } = await supabase
    .from('shifts')
    .select('*, users(id, first_name, last_name, hourly_rate, status_type, iban)')
    .eq('status', 'validated')
    .order('date', { ascending: true })

  // Fetch employees for the filter
  const { data: employees } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('role', 'employee')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">Export Paie</h1>
        <p className="text-muted-foreground font-medium">Générez les rapports pour le secrétariat social et validez les coûts.</p>
      </div>

      <PayrollClient 
        initialShifts={shifts || []} 
        employees={employees || []} 
      />
    </div>
  )
}
