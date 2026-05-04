import { z } from 'zod';

/**
 * Schema for shift declaration validation.
 */
export const shiftSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide"),
  breakMinutes: z.number().min(0, "La pause ne peut pas être négative").max(240, "La pause est trop longue"),
}).refine((data) => {
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  
  const startTotal = startH * 60 + startM;
  let endTotal = endH * 60 + endM;
  
  // Handle overnight shifts
  if (endTotal <= startTotal) {
    endTotal += 24 * 60;
  }
  
  return (endTotal - startTotal) > data.breakMinutes;
}, {
  message: "Le temps de pause ne peut pas être supérieur au temps travaillé",
  path: ["breakMinutes"]
});

export type ShiftInput = z.infer<typeof shiftSchema>;

/**
 * Schema for employee profile updates.
 */
export const profileSchema = z.object({
  first_name: z.string().min(2, "Le prénom est trop court"),
  last_name: z.string().min(2, "Le nom est trop court"),
  status_type: z.enum(['student', 'volunteer', 'extra']),
  hourly_rate: z.number().min(0, "Le taux horaire ne peut pas être négatif"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
