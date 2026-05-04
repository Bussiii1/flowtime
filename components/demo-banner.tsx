import React from 'react'
import { Sparkles, Info } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="bg-primary text-white py-1.5 px-4 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] z-[100] relative">
      <Sparkles className="h-3 w-3 animate-pulse" />
      <span>Mode Démo Actif — Réinitialisation quotidienne à 4h00</span>
      <Sparkles className="h-3 w-3 animate-pulse" />
    </div>
  )
}
