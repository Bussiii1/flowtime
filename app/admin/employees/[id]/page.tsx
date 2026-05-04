import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EmployeeDetailClient from './employee-detail-client'

export default async function EmployeeDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: adminProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (adminProfile?.role !== 'admin') redirect('/app')

  // Fetch employee data
  const [
    { data: employee },
    { data: shifts },
    { data: contracts }
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', params.id).single(),
    supabase.from('shifts').select('*').eq('user_id', params.id).order('date', { ascending: false }),
    supabase.from('contracts').select('*').eq('user_id', params.id).order('created_at', { ascending: false })
  ])

  if (!employee) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <EmployeeDetailClient 
        employee={employee} 
        shifts={shifts || []} 
        contracts={contracts || []} 
      />
    </div>
  )
}
