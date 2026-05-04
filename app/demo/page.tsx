'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'
import { User, ShieldCheck, Sparkles, ArrowRight, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast, Toaster } from 'sonner'

export default function DemoPage() {
  const router = useRouter()
  const supabase = createClient()

  const loginAs = async (email: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'password123'
    })

    if (error) {
      toast.error("Erreur de connexion démo. Vérifiez que le seed a été lancé.")
    } else {
      toast.success("Connexion réussie !")
      router.push(email.includes('elin') ? '/admin' : '/app')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <Toaster position="top-center" richColors />
      
      <div className="mb-12 text-center">
        <Logo className="h-16 w-16 mx-auto mb-6" textClassName="text-4xl" />
        <h1 className="text-4xl font-black mb-2">Espace Démonstration</h1>
        <p className="text-muted-foreground font-medium">Bienvenue sur le prototype de FlowTime.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 w-full max-w-4xl">
        {/* Admin Card */}
        <Card className="border-2 shadow-xl hover:border-primary transition-all group overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="text-center pt-8">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black">Accès Admin (Elin)</CardTitle>
            <CardDescription className="text-base">Gérez l'équipe, validez les heures et exportez la paie.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <Button 
              className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" 
              onClick={() => loginAs('elin@theflow.be')}
            >
              Lancer le Dashboard Admin <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Employee Card */}
        <Card className="border-2 shadow-xl hover:border-secondary transition-all group overflow-hidden">
          <div className="h-2 bg-secondary w-full" />
          <CardHeader className="text-center pt-8">
            <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <User className="h-10 w-10 text-secondary" />
            </div>
            <CardTitle className="text-2xl font-black">Accès Employé (Pablo)</CardTitle>
            <CardDescription className="text-base">Déclarez vos heures, gérez votre planning et vos infos.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <Button 
              variant="outline"
              className="w-full h-14 text-lg font-bold border-2 hover:bg-secondary hover:text-white transition-colors" 
              onClick={() => loginAs('pablo@example.com')}
            >
              Lancer l'Espace Staff <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 max-w-lg">
        <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-2xl border-2 border-primary/10">
          <Sparkles className="h-6 w-6 text-primary shrink-0 mt-1" />
          <div>
            <p className="font-bold text-primary mb-1">MODE DÉMO ACTIF</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Toutes les données (utilisateurs, shifts, planning) sont automatiquement réinitialisées chaque nuit à 4h00 pour garantir une expérience propre à chaque testeur.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
