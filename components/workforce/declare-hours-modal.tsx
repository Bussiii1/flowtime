'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { X, Send, Clock, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * Calculates total hours worked based on start time, end time, and break duration.
 * 
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @param breakMinutes - Break duration in minutes
 * @returns Total hours as a number, or 0 if input is invalid
 */
export const calculateTotalHours = (startTime: string, endTime: string, breakMinutes: number): number => {
  if (!startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;

  let startTotalMinutes = startH * 60 + startM;
  let endTotalMinutes = endH * 60 + endM;

  // Handle shifts crossing midnight
  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  const totalMinutes = endTotalMinutes - startTotalMinutes - (breakMinutes || 0);
  return Math.max(0, totalMinutes / 60);
};

interface DeclareHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; startTime: string; endTime: string; breakMinutes: number }) => Promise<void>;
}

/**
 * Modal component for employees to declare their worked hours.
 */
export const DeclareHoursModal = React.memo(({ isOpen, onClose, onSubmit }: DeclareHoursModalProps) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalHours = useMemo(() => 
    calculateTotalHours(startTime, endTime, breakMinutes),
    [startTime, endTime, breakMinutes]
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ date, startTime, endTime, breakMinutes });
      onClose();
    } catch (error) {
      console.error('Failed to submit hours:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [date, startTime, endTime, breakMinutes, onSubmit, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Déclarer mes heures</DialogTitle>
          <DialogDescription>
            Remplissez vos horaires pour validation par l'administration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Début</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">Fin</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="break">Pause (minutes)</Label>
            <Input
              id="break"
              type="number"
              min="0"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div className="bg-primary/5 p-4 rounded-xl flex items-center justify-between border border-primary/10">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Clock className="h-5 w-5" />
              <span>Total estimé</span>
            </div>
            <div className="text-xl font-black text-primary">
              {totalHours.toFixed(2)}h
            </div>
          </div>
          
          {totalHours <= 0 && startTime && endTime && (
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              <span>Durée invalide</span>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || totalHours <= 0}
            className="font-bold"
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

DeclareHoursModal.displayName = 'DeclareHoursModal';
