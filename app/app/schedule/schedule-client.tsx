'use client'

import React, { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { format, addMonths, parseISO, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Clock, Trash2, Repeat, Loader2 } from 'lucide-react'
import { createAvailability, deleteAvailability } from '@/app/actions/availabilities'
import { Badge } from '@/components/ui/badge'

interface Availability {
  id: string
  date: string | null
  start_time: string
  end_time: string
  recurring: boolean
}

export default function ScheduleClient({ 
  initialAvailabilities 
}: { 
  initialAvailabilities: Availability[] 
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [recurring, setRecurring] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  const handleAddAvailability = async () => {
    if (!selectedDate) return
    setIsSubmitting(true)

    const result = await createAvailability({
      date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: startTime,
      end_time: endTime,
      recurring,
    })

    if (result.success) {
      setIsDialogOpen(false)
      setRecurring(false)
    } else {
      alert(result.error)
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    const result = await deleteAvailability(id)
    if (!result.success) {
      alert(result.error)
    }
    setIsDeleting(null)
  }

  // Find availabilities for the selected date
  const selectedDayAvailabilities = initialAvailabilities.filter(a => 
    a.date && selectedDate && isSameDay(parseISO(a.date), selectedDate)
  )

  const recurringAvailabilities = initialAvailabilities.filter(a => a.recurring)

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-2 shadow-sm">
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDayClick}
            locale={fr}
            className="w-full"
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            modifiers={{
              hasAvailability: (date) => initialAvailabilities.some(a => a.date && isSameDay(parseISO(a.date), date)),
              isRecurring: (date) => initialAvailabilities.some(a => a.recurring)
            }}
            modifiersStyles={{
              hasAvailability: { fontWeight: 'bold', textDecoration: 'underline', color: 'hsl(var(--primary))' }
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Mes créneaux</h3>
          <Badge variant="outline" className="text-[10px] uppercase font-bold">
            {initialAvailabilities.length} déclarés
          </Badge>
        </div>

        <div className="space-y-3">
          {initialAvailabilities.length === 0 && (
            <p className="text-center py-8 text-sm text-muted-foreground italic">
              Aucune disponibilité déclarée. Cliquez sur un jour dans le calendrier pour en ajouter.
            </p>
          )}
          {initialAvailabilities.map((av) => (
            <Card key={av.id} className="border-2 shadow-none overflow-hidden group">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {av.recurring ? (
                      <Repeat className="h-5 w-5 text-secondary" />
                    ) : (
                      <span className="text-sm font-bold">{av.date ? format(parseISO(av.date), 'd') : '?'}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">
                        {av.recurring ? 'Hebdomadaire' : av.date ? format(parseISO(av.date), 'EEEE d MMMM', { locale: fr }) : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {av.start_time.slice(0, 5)} - {av.end_time.slice(0, 5)}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(av.id)}
                  disabled={isDeleting === av.id}
                >
                  {isDeleting === av.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une disponibilité</DialogTitle>
            <DialogDescription>
              {selectedDate ? format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Début</Label>
                <Input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  className="h-12 border-2"
                />
              </div>
              <div className="space-y-2">
                <Label>Fin</Label>
                <Input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  className="h-12 border-2"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between rounded-xl border-2 p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Récurrent</Label>
                <p className="text-xs text-muted-foreground">Répéter ce créneau chaque semaine</p>
              </div>
              <Switch 
                checked={recurring} 
                onCheckedChange={setRecurring} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full h-12 font-bold" 
              onClick={handleAddAvailability}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Ajouter le créneau
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
