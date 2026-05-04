import React from 'react'
import Link from 'next/link'
import { Logo } from "@/components/brand/logo"
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Logo className="h-10 w-10" textClassName="text-2xl" />
        </div>
      </header>

      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]"></div>
      
      <main className="container mx-auto flex flex-col items-center px-4 text-center py-20">
        {/* Tagline */}
        <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl dark:text-white">
          Le pointage <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">simplifié</span> pour l&apos;HORECA saisonnier
        </h1>
        
        <p className="mb-12 max-w-2xl text-lg text-slate-600 sm:text-xl dark:text-slate-400">
          FlowTime permet au bar de plage <span className="font-semibold text-slate-900 dark:text-slate-200">The Flow</span> de gérer ses équipes avec une efficacité redoutable. Pointage, planning et rentabilité centralisés.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-5 sm:flex-row">
          <Link href="/login">
            <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-[0_0_20px_rgba(255,107,107,0.3)] transition-transform hover:scale-105 active:scale-95">
              Accès Staff
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="h-14 border-2 px-10 text-lg font-bold transition-transform hover:scale-105 active:scale-95">
              Essayer la Démo
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 flex items-center gap-2 text-sm font-medium text-slate-500">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
          Propulsé par l&apos;innovation saisonnière
        </div>
      </main>
      
      <footer className="mt-auto py-8 w-full text-center text-sm font-medium text-slate-400">
        © {new Date().getFullYear()} FlowTime - The Flow beach bar
      </footer>
    </div>
  )
}
