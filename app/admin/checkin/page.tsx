'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  QrCode, 
  Lock, 
  Unlock, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  LogOut,
  Loader2,
  XCircle
} from 'lucide-react'
import { processKioskScan } from '@/app/actions/kiosk'
import confetti from 'canvas-confetti'
import { toast, Toaster } from 'sonner'

export default function KioskPage() {
  const [isLocked, setIsLocked] = useState(true)
  const [pin, setPin] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const CORRECT_PIN = '1234' // Should be an env var or settings

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.error('Geoloc denied')
      )
    }
  }, [])

  const startScanner = () => {
    setError(null)
    const html5QrCode = new Html5Qrcode("reader")
    scannerRef.current = html5QrCode
    
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        handleScan(decodedText)
      },
      (errorMessage) => {
        // Ignored for performance
      }
    ).catch(err => {
      setError("Erreur caméra: " + err)
      setIsScanning(false)
    })
    setIsScanning(true)
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScan = async (token: string) => {
    // Prevent multiple scans
    if (isScanning) {
      await stopScanner()
    }

    const res = await processKioskScan(token, coords || undefined)
    
    if (res.success) {
      setLastResult(res)
      
      // Play sound
      const audio = new Audio(res.type === 'in' ? '/sounds/checkin.mp3' : '/sounds/checkout.mp3')
      audio.play().catch(() => {})

      // Confetti for success
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: res.type === 'in' ? ['#FF6B6B', '#FFF'] : ['#4ECDC4', '#FFF']
      })

      // Auto clear after 5s
      setTimeout(() => {
        setLastResult(null)
        startScanner()
      }, 5000)
    } else {
      toast.error(res.error)
      // Resume scanner after short delay
      setTimeout(() => startScanner(), 2000)
    }
  }

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary p-6 text-white">
        <QrCode className="mb-8 h-24 w-24 opacity-20" />
        <h1 className="mb-8 text-4xl font-black tracking-tight uppercase">Mode Kiosque</h1>
        <div className="w-full max-w-xs space-y-4">
          <Input 
            type="password" 
            placeholder="Code PIN" 
            className="h-16 text-center text-3xl font-black tracking-[1em] text-black" 
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value)
              if (e.target.value === CORRECT_PIN) setIsLocked(false)
            }}
          />
          <p className="text-center text-sm font-medium opacity-60">Entrez le code pour déverrouiller la borne</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-white overflow-hidden">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-white/10 px-8 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-black">FT</div>
          <span className="text-xl font-bold tracking-tight">FlowTime Kiosk</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <MapPin className={coords ? "h-4 w-4 text-green-500" : "h-4 w-4 text-red-500"} />
            {coords ? 'Position OK' : 'Localisation requise'}
          </div>
          <Button variant="ghost" onClick={() => setIsLocked(true)} className="text-muted-foreground hover:text-white">
            <Lock className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Scanner Area */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-8">
        {!lastResult ? (
          <div className="w-full max-w-2xl aspect-square relative">
            <div id="reader" className="w-full h-full rounded-3xl overflow-hidden border-4 border-white/20"></div>
            
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 rounded-3xl z-10 p-12 text-center">
                <Camera className="h-20 w-20 mb-6 text-primary" />
                <h2 className="text-3xl font-black mb-4">Prêt pour le pointage</h2>
                <p className="text-muted-foreground mb-8 text-lg">Activez la caméra pour commencer à scanner les QR codes des employés.</p>
                <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-2xl" onClick={startScanner}>
                  Activer la caméra
                </Button>
                {error && <p className="mt-4 text-red-500 font-bold">{error}</p>}
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none border-[60px] border-slate-950/40 rounded-3xl">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
                <div className="absolute inset-x-0 top-1/2 h-1 bg-primary/30 animate-pulse shadow-[0_0_15px_rgba(255,107,107,0.5)]"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in zoom-in fade-in duration-500 flex flex-col items-center text-center max-w-xl">
            <div className={`h-40 w-40 rounded-full flex items-center justify-center mb-8 shadow-2xl ${lastResult.type === 'in' ? 'bg-primary' : 'bg-secondary'}`}>
              {lastResult.type === 'in' ? <CheckCircle2 className="h-24 w-24" /> : <LogOut className="h-24 w-24" />}
            </div>
            <h1 className="text-6xl font-black mb-4">{lastResult.name}</h1>
            <p className="text-3xl font-medium opacity-80">
              {lastResult.type === 'in' ? `Entrée à ${lastResult.time}` : `Sortie à ${lastResult.time}`}
            </p>
            {lastResult.type === 'out' && (
              <div className="mt-6 px-8 py-3 bg-white/10 rounded-full text-2xl font-black text-secondary border border-secondary/20">
                {lastResult.duration} travaillées
              </div>
            )}
            <p className="mt-12 text-sm text-muted-foreground animate-pulse">Redémarrage automatique de la caméra...</p>
          </div>
        )}
      </main>

      {/* Footer Instructions */}
      <footer className="p-8 text-center text-muted-foreground">
        <p className="text-lg">Scannez votre QR Code personnel pour pointer.</p>
      </footer>
    </div>
  )
}
