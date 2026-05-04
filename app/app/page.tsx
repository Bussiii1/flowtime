import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function EmployeeDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch recent shifts
  const { data: shifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(10)

  // Calculate week summary
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const { data: weekShifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', format(weekStart, 'yyyy-MM-dd'))
    .lte('date', format(weekEnd, 'yyyy-MM-dd'))

  const totalMinutes = weekShifts?.reduce((acc, shift) => {
    if (shift.status === 'rejected') return acc
    const start = new Date(`2000-01-01T${shift.start_time}`)
    const end = new Date(`2000-01-01T${shift.end_time}`)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60)
    return acc + (diff - shift.break_minutes)
  }, 0) || 0

  const pendingMinutes = weekShifts?.filter(s => s.status === 'pending').reduce((acc, shift) => {
    const start = new Date(`2000-01-01T${shift.start_time}`)
    const end = new Date(`2000-01-01T${shift.end_time}`)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60)
    return acc + (diff - shift.break_minutes)
  }, 0) || 0

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}`
  }

  return (
    <div className="space-y-6 p-4">
      {/* Week Summary Card */}
      <Card className="border-2 border-primary/20 bg-primary/5 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Semaine du {format(weekStart, 'd MMM', { locale: fr })} au {format(weekEnd, 'd MMM', { locale: fr })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-black text-primary">{formatHours(totalMinutes)}</p>
              <p className="text-sm font-medium text-muted-foreground">Total presté</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-secondary">{formatHours(pendingMinutes)}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">En attente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Declare Button */}
      <Link href="/app/declare" className="block">
        <Button className="h-16 w-full text-lg font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95">
          <Plus className="mr-2 h-6 w-6" />
          Déclarer mes heures
        </Button>
      </Link>

      {/* Recent Shifts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Shifts récents</h3>
        <div className="space-y-3">
          {shifts?.map((shift) => (
            <Card key={shift.id} className="overflow-hidden border-2 shadow-sm">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-muted font-bold">
                    <span className="text-[10px] uppercase text-muted-foreground">{format(parseISO(shift.date), 'MMM', { locale: fr })}</span>
                    <span className="text-lg leading-none">{format(parseISO(shift.date), 'd')}</span>
                  </div>
                  <div>
                    <p className="font-bold">{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</p>
                    <p className="text-xs text-muted-foreground">
                      {shift.break_minutes > 0 ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Pause 30 min incl.
                        </span>
                      ) : 'Pas de pause déduite'}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={shift.status === 'validated' ? 'default' : shift.status === 'rejected' ? 'destructive' : 'secondary'}
                  className="font-bold uppercase text-[10px]"
                >
                  {shift.status === 'validated' ? 'Validé' : shift.status === 'rejected' ? 'Refusé' : 'Attente'}
                </Badge>
              </div>
              {shift.notes && (
                <div className="bg-muted/30 px-4 py-2 text-xs italic text-muted-foreground border-t">
                  &quot;{shift.notes}&quot;
                </div>
              )}
            </Card>
          ))}
          {(!shifts || shifts.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <AlertCircle className="mb-2 h-12 w-12 opacity-20" />
              <p>Aucun shift déclaré récemment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
