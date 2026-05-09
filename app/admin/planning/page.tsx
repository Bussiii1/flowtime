'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store } from '@/lib/store'
import { DraggableCard } from '@/components/ui/draggable-card'
import { Button } from '@/components/ui/button'
import { Shift } from '@/types/shift'

export default function PlanningPage() {
  const store = Store.useStore()

  // Toggle a global state via undux
  const toggleGlobalLoading = () => {
    store.set('isGlobalLoading')(!store.get('isGlobalLoading'))
  }

  // Example of using the generated JSON schema to TypeScript interface
  const sampleShift: Partial<Shift> = {
    id: "uuid-1234",
    status: "validated",
    date: "2026-05-15"
  }

  return (
    <div className="space-y-6 relative h-[600px] overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Planning Interactif</h1>
        <p className="text-muted-foreground">
          Gérez vos shifts par glisser-déposer. (Alimenté par <code>draggable</code> et <code>undux</code>)
        </p>
      </div>

      <div className="flex gap-4 items-center">
        <Button onClick={toggleGlobalLoading} variant="outline" className="border-2 font-bold">
          Toggle Global State (Undux)
        </Button>
        {store.get('isGlobalLoading') && (
          <span className="text-primary font-bold animate-pulse">L'état global est ACTIF</span>
        )}
      </div>

      <div className="relative w-full h-full bg-slate-100 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 p-8">
        <p className="text-slate-400 text-center uppercase tracking-widest font-black opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          Zone de Drag & Drop
        </p>

        {/* Draggable Shift Card 1 */}
        <DraggableCard initialPosition={{ x: 50, y: 50 }}>
          <Card className="w-64 border-2 shadow-xl cursor-move bg-white dark:bg-slate-950">
            <CardHeader className="py-3 px-4 bg-primary/10 border-b">
              <CardTitle className="text-sm font-bold text-primary flex justify-between items-center">
                Shift Matin
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">{sampleShift.status}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="font-medium text-sm">📅 {sampleShift.date}</p>
              <p className="text-muted-foreground text-xs mt-1">Glace & Cocktails</p>
            </CardContent>
          </Card>
        </DraggableCard>

        {/* Draggable Shift Card 2 */}
        <DraggableCard initialPosition={{ x: 350, y: 150 }}>
          <Card className="w-64 border-2 shadow-xl cursor-move bg-white dark:bg-slate-950">
            <CardHeader className="py-3 px-4 bg-secondary/10 border-b">
              <CardTitle className="text-sm font-bold text-secondary flex justify-between items-center">
                Shift Soirée
                <span className="text-xs bg-secondary text-white px-2 py-0.5 rounded-full">pending</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="font-medium text-sm">📅 2026-05-16</p>
              <p className="text-muted-foreground text-xs mt-1">Fermeture Bar</p>
            </CardContent>
          </Card>
        </DraggableCard>
      </div>
    </div>
  )
}
