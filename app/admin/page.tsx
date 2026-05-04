import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Users, 
  Clock, 
  Calendar, 
  Euro, 
  CheckCircle2, 
  FileDown, 
  ArrowRight 
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, subDays, isWithinInterval, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import AdminChart from './admin-chart'
import { ErrorBoundary } from '@/components/workforce/error-boundary'

export default async function AdminDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/app')

  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const last14DaysStart = subDays(now, 14)

  // 1. Fetch data
  const [
    { data: activeToday },
    { data: pendingShifts },
    { data: weekShifts },
    { data: chartShifts },
    { data: recentShifts }
  ] = await Promise.all([
    supabase.from('shifts').select('user_id').eq('date', todayStr),
    supabase.from('shifts').select('*').eq('status', 'pending'),
    supabase.from('shifts').select('*, users(hourly_rate)').gte('date', format(weekStart, 'yyyy-MM-dd')).lte('date', format(weekEnd, 'yyyy-MM-dd')),
    supabase.from('shifts').select('date, start_time, end_time, break_minutes').gte('date', format(last14DaysStart, 'yyyy-MM-dd')),
    supabase.from('shifts').select('*, users(first_name, last_name)').order('created_at', { ascending: false }).limit(10)
  ])

  // 2. Process KPIs
  const activeCount = new Set(activeToday?.map(s => s.user_id)).size
  const pendingCount = pendingShifts?.length || 0
  
  const calculateHours = (s: any) => {
    const start = new Date(`2000-01-01T${s.start_time}`)
    const end = new Date(`2000-01-01T${s.end_time}`)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return diff - (s.break_minutes / 60)
  }

  const weekHours = weekShifts?.reduce((acc, s) => acc + calculateHours(s), 0) || 0
  const weekCost = weekShifts?.reduce((acc, s: any) => acc + (calculateHours(s) * (s.users?.hourly_rate || 0)), 0) || 0

  // 3. Process Chart Data
  const chartData = Array.from({ length: 14 }).map((_, i) => {
    const d = subDays(now, 13 - i)
    const dStr = format(d, 'yyyy-MM-dd')
    const dayShifts = chartShifts?.filter(s => s.date === dStr) || []
    const total = dayShifts.reduce((acc, s) => acc + calculateHours(s), 0)
    return {
      name: format(d, 'dd/MM'),
      hours: parseFloat(total.toFixed(1))
    }
  })

  return (
    <ErrorBoundary>
      <div className="space-y-8">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actifs aujourd&apos;hui</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{activeCount}</div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Équipiers sur le pont</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">À valider</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-black">{pendingCount}</div>
              {pendingCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">Action requise</Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Déclarations en attente</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Heures semaine</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{weekHours.toFixed(1)}h</div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Cumul hebdomadaire</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-none bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coût estimé</CardTitle>
            <Euro className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{weekCost.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Dépense brute estimée</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight">Heures prestées (14 derniers jours)</h3>
          </div>
          <Card className="border-2 shadow-none p-6">
            <AdminChart data={chartData} />
          </Card>
        </div>

        {/* Quick Actions Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight">Actions rapides</h3>
          <div className="grid gap-3">
            <Button className="h-16 justify-between px-6 text-lg font-bold" variant="outline">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Valider tout
              </div>
              <ArrowRight className="h-5 w-5 opacity-30" />
            </Button>
            <Button className="h-16 justify-between px-6 text-lg font-bold" variant="outline">
              <div className="flex items-center gap-3">
                <FileDown className="h-6 w-6 text-primary" />
                Export paie
              </div>
              <ArrowRight className="h-5 w-5 opacity-30" />
            </Button>
          </div>

          <Card className="bg-secondary/10 border-2 border-secondary/20 shadow-none">
            <CardContent className="p-4 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-secondary/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-secondary">Prochaine paie</p>
                <p className="text-sm font-medium">Lundi 1er Juin</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">Activité récente</h3>
        <Card className="border-2 shadow-none overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Employé</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Horaires</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentShifts?.map((shift: any) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-bold">
                    {shift.users?.first_name} {shift.users?.last_name}
                  </TableCell>
                  <TableCell>{format(parseISO(shift.date), 'dd MMM', { locale: fr })}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {calculateHours(shift).toFixed(1)}h
                  </TableCell>
                  <TableCell>
                    <Badge variant={shift.status === 'validated' ? 'default' : shift.status === 'rejected' ? 'destructive' : 'secondary'} className="uppercase text-[10px] font-bold">
                      {shift.status === 'validated' ? 'Validé' : shift.status === 'rejected' ? 'Refusé' : 'Attente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Gérer</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
    </ErrorBoundary>
  )
}
