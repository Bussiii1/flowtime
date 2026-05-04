'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="absolute top-8">
        <Logo className="h-12 w-12" textClassName="text-2xl" />
      </div>

      <div className="relative mb-12">
        <div className="text-[180px] font-black leading-none text-muted/20 select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-40 w-40 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-primary fill-current">
              <path d="M10 50C25 35 35 35 50 50C65 65 75 65 90 50C100 40 100 40 100 40V100H0V40C0 40 5 45 10 50Z" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-black mb-4">Oups, marée basse !</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Cette page a été emportée par le courant. Pas de panique, vous pouvez retrouver votre chemin vers le bar principal.
      </p>

      <div className="flex gap-4">
        <Link href="/">
          <Button className="h-12 px-8 font-bold shadow-lg shadow-primary/20">
            <Home className="mr-2 h-4 w-4" /> Accueil
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="h-12 px-8 font-bold"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
      </div>
    </div>
  )
}
