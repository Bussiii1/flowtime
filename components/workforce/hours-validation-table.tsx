'use client';

import React, { useCallback } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Pencil, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/**
 * Interface representing a single hours entry for validation.
 */
export interface HoursEntry {
  id: string;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  date: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  total_hours: number;
  status: 'pending' | 'validated' | 'rejected';
  hourly_rate: number;
}

interface HoursValidationTableProps {
  entries: HoursEntry[];
  onValidate: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onEdit: (entry: HoursEntry) => void;
}

/**
 * Table component for administrators to validate or reject employee hours.
 */
export const HoursValidationTable = React.memo(({ 
  entries, 
  onValidate, 
  onReject, 
  onEdit 
}: HoursValidationTableProps) => {
  
  const handleAction = useCallback(async (action: (id: string) => Promise<void>, id: string) => {
    try {
      await action(id);
    } catch (error) {
      console.error('Action failed:', error);
    }
  }, []);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Check className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-xl">Tout est à jour !</h3>
          <p className="text-muted-foreground">Aucune demande de validation en attente pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 shadow-sm overflow-hidden bg-white dark:bg-slate-950">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold">Employé</TableHead>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold">Horaires</TableHead>
            <TableHead className="font-bold">Total</TableHead>
            <TableHead className="font-bold">Statut</TableHead>
            <TableHead className="text-right font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id} className="group hover:bg-muted/20 transition-colors">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                    {entry.user_name.slice(0, 2)}
                  </div>
                  <span>{entry.user_name}</span>
                </div>
              </TableCell>
              <TableCell>{entry.date}</TableCell>
              <TableCell className="text-muted-foreground">
                {entry.start_time} - {entry.end_time} 
                <span className="text-[10px] ml-1">({entry.break_minutes}m pause)</span>
              </TableCell>
              <TableCell className="font-black">
                {entry.total_hours.toFixed(1)}h
              </TableCell>
              <TableCell>
                <Badge 
                  variant={entry.status === 'pending' ? 'secondary' : entry.status === 'validated' ? 'default' : 'destructive'}
                  className="uppercase text-[10px] font-black"
                >
                  {entry.status === 'pending' ? 'En attente' : entry.status === 'validated' ? 'Validé' : 'Refusé'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleAction(onValidate, entry.id)}
                    title="Valider"
                    aria-label="Valider l'entrée"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/5"
                    onClick={() => handleAction(onReject, entry.id)}
                    title="Rejeter"
                    aria-label="Rejeter l'entrée"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(entry)}>
                        <Pencil className="mr-2 h-4 w-4" /> Modifier
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

HoursValidationTable.displayName = 'HoursValidationTable';
