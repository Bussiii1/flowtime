'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, Loader2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createShift } from '@/app/actions/shifts'
import Link from 'next/link'

export default function DeclareHoursPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [totalHours, setTotalHours] = useState(0)

  useEffect(() => {
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    
    if (end < start) {
      end.setDate(end.getDate() + 1)
    }
    
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    setTotalHours(diff)
  }, [startTime, endTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await createShift({
      date: format(date, 'yyyy-MM-dd'),
      start_time: startTime,
      end_time: endTime,
      notes,
    })

    if (result.success) {
      router.push('/app')
    } else {
      alert(result.error || 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const hasBreak = totalHours > 7.5

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/app">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Déclarer un shift</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Détails du shift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date du shift</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal border-2",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-12 pl-10 border-2" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-12 pl-10 border-2" 
                  />
                </div>
              </div>
            </div>

            {/* Auto-calculation Result */}
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total calculé:</span>
                <span className="text-xl font-black text-primary">
                  {totalHours.toFixed(2).replace('.', 'h')}
                </span>
              </div>
              {hasBreak && (
                <p className="mt-2 text-[10px] font-bold text-secondary uppercase tracking-tight">
                  ✨ 30 min de pause déduite automatiquement
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Textarea 
                placeholder="Précisez un imprévu, une tâche spécifique..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] border-2"
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="h-14 w-full text-lg font-bold shadow-lg shadow-primary/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Valider la déclaration'
          )}
        </Button>
      </form>
    </div>
  )
}
