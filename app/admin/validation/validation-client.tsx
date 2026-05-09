'use client'

import React, { useState, useMemo, useOptimistic } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Check, 
  X, 
  Edit2, 
  CheckCircle2, 
  Filter, 
  Search,
  Loader2,
  Trash2
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { validateShift, rejectShift, bulkValidate } from '@/app/actions/admin-shifts'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

export default function ValidationClient({ initialShifts, employees }: any) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isBulkLoading, setIsBulkLoading] = useState(false)

  // Optimistic UI for instant feedback
  const [optimisticShifts, removeOptimisticShift] = useOptimistic(
    initialShifts,
    (state: any[], idToRemove: string | string[]) => {
      if (Array.isArray(idToRemove)) {
        return state.filter(s => !idToRemove.includes(s.id))
      }
      return state.filter(s => s.id !== idToRemove)
    }
  )

  const filteredShifts = useMemo(() => {
    return optimisticShifts.filter((s: any) => {
      if (filterEmployee !== 'all' && s.user_id !== filterEmployee) return false
      return true
    })
  }, [optimisticShifts, filterEmployee])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredShifts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredShifts.map((s: any) => s.id))
    }
  }

  const handleValidate = async (id: string) => {
    removeOptimisticShift(id)
    const res = await validateShift(id)
    if (res.success) toast.success('Shift validé avec succès !')
    else toast.error('Erreur lors de la validation')
  }

  const handleReject = async (id: string) => {
    removeOptimisticShift(id)
    const res = await rejectShift(id)
    if (res.success) toast.success('Shift rejeté')
    else toast.error('Erreur')
  }

  const handleBulkValidate = async () => {
    if (selectedIds.length === 0) return
    const idsToProcess = [...selectedIds]
    removeOptimisticShift(idsToProcess)
    setSelectedIds([])
    
    const res = await bulkValidate(idsToProcess)
    if (res.success) {
      toast.success(`${idsToProcess.length} shifts validés !`)
    } else {
      toast.error('Erreur lors de la validation groupée')
    }
  }

  const calculateHours = (s: any) => {
    const start = new Date(`2000-01-01T${s.start_time}`)
    const end = new Date(`2000-01-01T${s.end_time}`)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return diff - (s.break_minutes / 60)
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />
      
      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border-2">
        <div className="flex items-center gap-3">
          <Select value={filterEmployee} onValueChange={setFilterEmployee}>
            <SelectTrigger className="w-[200px] h-10 border-slate-200">
              <Filter className="mr-2 h-4 w-4 opacity-50" />
              <SelectValue placeholder="Filtrer par employé" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les employés</SelectItem>
              {employees.map((e: any) => (
                <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <span className="text-sm font-bold text-primary">{selectedIds.length} sélectionnés</span>
            <Button 
              size="sm" 
              onClick={handleBulkValidate} 
              disabled={isBulkLoading}
              className="font-bold shadow-lg shadow-primary/20"
            >
              {isBulkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Valider la sélection
            </Button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border-2 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedIds.length === filteredShifts.length && filteredShifts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Employé</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Horaire</TableHead>
              <TableHead>Pause</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Total €</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.map((shift: any) => {
              const hours = calculateHours(shift)
              const totalEuro = hours * (shift.users?.hourly_rate || 0)
              
              return (
                <TableRow key={shift.id} className="group transition-colors">
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(shift.id)}
                      onCheckedChange={() => toggleSelect(shift.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={shift.users?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {shift.users?.first_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold">{shift.users?.first_name} {shift.users?.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {format(parseISO(shift.date), 'EEEE d MMM', { locale: fr })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    {shift.break_minutes > 0 ? (
                      <Badge variant="outline" className="text-secondary border-secondary/20 bg-secondary/5 font-bold">
                        {shift.break_minutes}m auto
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Aucune</span>
                    )}
                  </TableCell>
                  <TableCell className="font-black text-slate-900 dark:text-white">
                    {hours.toFixed(2)}h
                  </TableCell>
                  <TableCell className="font-black text-primary">
                    {totalEuro.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={() => handleValidate(shift.id)}
                        disabled={loadingId === shift.id}
                      >
                        {loadingId === shift.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-muted-foreground hover:bg-slate-100"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(shift.id)}
                        disabled={loadingId === shift.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredShifts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
                  Aucun shift en attente de validation pour ces critères.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
