'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Euro, 
  Clock, 
  FileText, 
  Archive, 
  Save, 
  History,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { updateEmployee } from '@/app/actions/employees'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

export default function EmployeeDetailClient({ employee, shifts, contracts }: any) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status_type: employee.status_type,
    hourly_rate: employee.hourly_rate,
  })

  const calculateHours = (s: any) => {
    const start = new Date(`2000-01-01T${s.start_time}`)
    const end = new Date(`2000-01-01T${s.end_time}`)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return diff - (s.break_minutes / 60)
  }

  const totalHours = shifts.filter((s: any) => s.status === 'validated').reduce((acc: number, s: any) => acc + calculateHours(s), 0)
  const totalPaid = shifts.filter((s: any) => s.status === 'validated').reduce((acc: number, s: any) => acc + (calculateHours(s) * (employee.hourly_rate || 0)), 0)
  
  const studentLimit = 475
  const hoursRemaining = studentLimit - totalHours
  const progressPercent = (totalHours / studentLimit) * 100

  const handleUpdate = async () => {
    setLoading(true)
    const res = await updateEmployee(employee.id, formData)
    if (res.success) toast.success('Profil mis à jour')
    else toast.error(res.error)
    setLoading(false)
  }

  return (
    <div className="space-y-8 pb-20">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/employees">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={employee.avatar_url} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {employee.first_name[0]}{employee.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-black">{employee.first_name} {employee.last_name}</h1>
              <p className="text-muted-foreground">{employee.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="font-bold">
            <FileText className="mr-2 h-4 w-4" /> Contrat PDF
          </Button>
          <Button variant="destructive" className="font-bold opacity-50 hover:opacity-100">
            <Archive className="mr-2 h-4 w-4" /> Archiver
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-2 shadow-none overflow-hidden">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Paramètres Employé</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select 
                  value={formData.status_type} 
                  onValueChange={(v) => setFormData({...formData, status_type: v})}
                >
                  <SelectTrigger className="h-12 border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Étudiant</SelectItem>
                    <SelectItem value="extra">Extra</SelectItem>
                    <SelectItem value="volunteer">Bénévole</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Taux horaire (€)</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    step="0.01"
                    className="h-12 pl-10 border-2" 
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <Button className="w-full h-12 font-bold" onClick={handleUpdate} disabled={loading}>
                {loading ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>

          {employee.status_type === 'student' && (
            <Card className="border-2 shadow-none border-primary/20 bg-primary/5">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" /> Quota étudiant
                  </span>
                  <Badge variant="outline" className="bg-white">{totalHours.toFixed(1)} / {studentLimit}h</Badge>
                </div>
                <Progress value={progressPercent} className="h-3" />
                <p className="text-xs text-muted-foreground text-center">
                  Il reste <strong>{hoursRemaining.toFixed(1)}h</strong> sur le quota légal.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Details & History Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-2 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Heures validées</span>
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <p className="text-3xl font-black mt-2">{totalHours.toFixed(1)}h</p>
              </CardContent>
            </Card>
            <Card className="border-2 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Total brut payé</span>
                  <Euro className="h-4 w-4 text-secondary" />
                </div>
                <p className="text-3xl font-black mt-2">{totalPaid.toLocaleString('fr-FR')} €</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" /> Historique des shifts
              </h3>
            </div>
            <Card className="border-2 shadow-none overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Horaire</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shifts.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(s.date), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {calculateHours(s).toFixed(1)}h
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={s.status === 'validated' ? 'default' : s.status === 'rejected' ? 'destructive' : 'secondary'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {s.status === 'validated' ? 'Validé' : s.status === 'rejected' ? 'Refusé' : 'Attente'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {shifts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic">
                        Aucun shift enregistré.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
