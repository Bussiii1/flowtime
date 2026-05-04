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
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react'
import Link from 'next/link'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { addEmployee } from '@/app/actions/employees'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

export default function EmployeesClient({ initialEmployees }: any) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    email: '',
    status_type: 'extra',
    hourly_rate: 0
  })

  const filteredEmployees = useMemo(() => {
    return initialEmployees.filter((e: any) => {
      const full = `${e.first_name} ${e.last_name}`.toLowerCase()
      return full.includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [initialEmployees, searchTerm])

  const calculateTotalHours = (shifts: any[]) => {
    return shifts?.reduce((acc, s) => {
      if (s.status !== 'validated') return acc
      const start = new Date(`2000-01-01T${s.start_time}`)
      const end = new Date(`2000-01-01T${s.end_time}`)
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return acc + (diff - (s.break_minutes / 60))
    }, 0) || 0
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await addEmployee(newEmployee as any)
    if (res.success) {
      toast.success('Employé ajouté avec succès')
      setIsAddModalOpen(false)
    } else {
      toast.error(res.error || 'Erreur lors de l\'ajout')
    }
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />
      
      {/* Search & Actions Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un employé..." 
            className="pl-10 h-11 border-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 font-bold shadow-lg shadow-primary/20">
              <UserPlus className="mr-2 h-5 w-5" />
              Ajouter un employé
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nouvel Employé</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input 
                    value={newEmployee.first_name}
                    onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input 
                    value={newEmployee.last_name}
                    onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email (Magic Link)</Label>
                <Input 
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select 
                    value={newEmployee.status_type}
                    onValueChange={(v) => setNewEmployee({...newEmployee, status_type: v})}
                  >
                    <SelectTrigger>
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
                  <Input 
                    type="number"
                    step="0.01"
                    value={newEmployee.hourly_rate}
                    onChange={(e) => setNewEmployee({...newEmployee, hourly_rate: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full font-bold h-12">Créer le profil</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employees Table */}
      <div className="rounded-2xl border-2 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Employé</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Taux</TableHead>
              <TableHead>Heures Saison</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((e: any) => {
              const totalHours = calculateTotalHours(e.shifts)
              return (
                <TableRow key={e.id} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                  <TableCell>
                    <Link href={`/admin/employees/${e.id}`} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={e.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {e.first_name[0]}{e.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold">{e.first_name} {e.last_name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{e.email}</span>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase font-bold text-[10px] bg-secondary/5 border-secondary/20 text-secondary">
                      {e.status_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{e.hourly_rate} €/h</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white">{totalHours.toFixed(1)}h</span>
                      {e.status_type === 'student' && (
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${Math.min((totalHours / 475) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/employees/${e.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
