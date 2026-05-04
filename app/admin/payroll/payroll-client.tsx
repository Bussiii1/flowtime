'use client'

import React, { useState, useMemo } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  FileSpreadsheet, 
  FileDown, 
  Calendar, 
  Filter, 
  Euro, 
  User,
  Info
} from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO 
} from 'date-fns'
import { fr } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export default function PayrollClient({ initialShifts, employees }: any) {
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  })
  const [filterEmployee, setFilterEmployee] = useState('all')

  const aggregatedData = useMemo(() => {
    const filtered = initialShifts.filter((s: any) => {
      const shiftDate = parseISO(s.date)
      const isInRange = isWithinInterval(shiftDate, { start: dateRange.start, end: dateRange.end })
      const isCorrectEmployee = filterEmployee === 'all' || s.user_id === filterEmployee
      return isInRange && isCorrectEmployee
    })

    const employeesMap: Record<string, any> = {}

    filtered.forEach((s: any) => {
      const uid = s.user_id
      if (!employeesMap[uid]) {
        employeesMap[uid] = {
          id: uid,
          name: `${s.users.first_name} ${s.users.last_name}`,
          status: s.users.status_type,
          hourly_rate: s.users.hourly_rate,
          iban: s.users.iban,
          totalMinutes: 0,
          totalBreak: 0,
          shiftsCount: 0
        }
      }

      const start = new Date(`2000-01-01T${s.start_time}`)
      const end = new Date(`2000-01-01T${s.end_time}`)
      const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
      
      employeesMap[uid].totalMinutes += diffMinutes
      employeesMap[uid].totalBreak += s.break_minutes
      employeesMap[uid].shiftsCount += 1
    })

    return Object.values(employeesMap).map((e: any) => {
      const netMinutes = e.totalMinutes - e.totalBreak
      const hours = netMinutes / 60
      return {
        ...e,
        hours: parseFloat(hours.toFixed(2)),
        totalBrut: hours * e.hourly_rate
      }
    })
  }, [initialShifts, dateRange, filterEmployee])

  const grandTotal = aggregatedData.reduce((acc, e) => acc + e.totalBrut, 0)

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(aggregatedData.map(e => ({
      'Employé': e.name,
      'Statut': e.status,
      'IBAN': e.iban,
      'Heures Totales': e.hours,
      'Pauses Déduites (min)': e.totalBreak,
      'Taux Horaire (€)': e.hourly_rate,
      'Total Brut (€)': e.totalBrut.toFixed(2)
    })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paie")
    XLSX.writeFile(workbook, `FlowTime_Paie_${format(dateRange.start, 'MMM_yyyy')}.xlsx`)
  }

  const exportPDF = () => {
    const doc = new jsPDF() as any
    doc.setFontSize(20)
    doc.text("FlowTime - Rapport de Paie", 14, 22)
    doc.setFontSize(10)
    doc.text(`Période : ${format(dateRange.start, 'dd/MM/yyyy')} au ${format(dateRange.end, 'dd/MM/yyyy')}`, 14, 30)

    doc.autoTable({
      startY: 40,
      head: [['Employé', 'Statut', 'Heures', 'Taux', 'Total Brut']],
      body: aggregatedData.map(e => [
        e.name,
        e.status.toUpperCase(),
        `${e.hours}h`,
        `${e.hourly_rate}€/h`,
        `${e.totalBrut.toFixed(2)}€`
      ]),
      foot: [['', '', '', 'GRAND TOTAL', `${grandTotal.toFixed(2)}€`]],
      theme: 'grid',
      headStyles: { fillStyle: '#FF6B6B' }
    })

    doc.save(`FlowTime_Paie_${format(dateRange.start, 'MMM_yyyy')}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 border-2 rounded-2xl shadow-sm lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <Calendar className="h-4 w-4" />
            Période
          </div>
          <div className="flex gap-2">
            <Input 
              type="date" 
              className="h-10 border-2" 
              value={format(dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange({...dateRange, start: new Date(e.target.value)})}
            />
            <Input 
              type="date" 
              className="h-10 border-2" 
              value={format(dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => setDateRange({...dateRange, end: new Date(e.target.value)})}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filterEmployee} onValueChange={setFilterEmployee}>
            <SelectTrigger className="w-[200px] h-10 border-2">
              <User className="mr-2 h-4 w-4 opacity-50" />
              <SelectValue placeholder="Tous les employés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les employés</SelectItem>
              {employees.map((e: any) => (
                <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button onClick={exportExcel} className="font-bold shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700">
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button onClick={exportPDF} className="font-bold shadow-lg shadow-primary/20">
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <Card className="border-2 shadow-none overflow-hidden bg-white dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Employé</TableHead>
              <TableHead>Heures</TableHead>
              <TableHead>Pauses</TableHead>
              <TableHead>Taux</TableHead>
              <TableHead>Total Brut</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aggregatedData.map((e: any) => (
              <TableRow key={e.id}>
                <TableCell className="font-bold">{e.name}</TableCell>
                <TableCell className="font-black">{e.hours}h</TableCell>
                <TableCell className="text-muted-foreground text-xs">{e.totalBreak} min</TableCell>
                <TableCell>{e.hourly_rate} €/h</TableCell>
                <TableCell className="font-black text-primary">
                  {e.totalBrut.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-[10px] font-bold bg-secondary/5 text-secondary border-secondary/20">
                    {e.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {aggregatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                  Aucune donnée validée pour cette période.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Footer Summary */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-between items-center">
          <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-xs">
            <Info className="h-4 w-4" />
            {aggregatedData.length} employés concernés
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Grand Total Brut</span>
            <div className="text-3xl font-black text-primary">
              {grandTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Simple Card placeholder since we don't have Card in current view, I'll use a div or assume it exists.
// Actually Card is in shadcn ui.
function Card({ children, className }: any) {
  return <div className={`rounded-2xl border ${className}`}>{children}</div>
}
