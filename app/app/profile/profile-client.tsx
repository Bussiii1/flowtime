'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile, uploadAvatar, regenerateQR } from '@/app/actions/profile'
import { Loader2, Camera, LogOut, ShieldCheck, Euro, CreditCard, QrCode, RefreshCw, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { QRCodeSVG } from 'qrcode.react'
import { jsPDF } from 'jspdf'
import { LogoutButton } from '@/components/auth/logout-button'

export default function ProfileClient({ profile, contract, userEmail }: any) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    national_number: profile?.national_number || '',
    iban: profile?.iban || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await updateProfile(formData)
    if (result.error) alert(result.error)
    else alert('Profil mis à jour !')
    setLoading(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1]
      const result = await uploadAvatar(base64, file.name)
      if (result.error) alert(result.error)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative group">
          <Avatar className="h-28 w-28 border-4 border-white shadow-xl ring-2 ring-primary/20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black uppercase">
              {profile?.first_name?.[0] || userEmail[0]}
            </AvatarFallback>
          </Avatar>
          <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{formData.first_name} {formData.last_name}</h2>
          <Badge variant="outline" className="mt-1 bg-secondary/5 text-secondary border-secondary/20">
            {profile?.status_type?.toUpperCase() || 'EXTRA'}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input name="first_name" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input name="last_name" value={formData.last_name} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input name="phone" value={formData.phone} onChange={handleChange} required placeholder="04xx xx xx xx" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Données Administratives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Numéro National (RN)
              </Label>
              <Input 
                name="national_number" 
                value={formData.national_number} 
                onChange={handleChange} 
                required 
                placeholder="YY.MM.DD-XXX.XX"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                IBAN Belge
              </Label>
              <Input 
                name="iban" 
                value={formData.iban} 
                onChange={handleChange} 
                required 
                placeholder="BE00 0000 0000 0000"
              />
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Mon QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 p-6">
            <div className="p-4 bg-white rounded-2xl border-2 shadow-inner">
              {profile?.qr_token ? (
                <QRCodeSVG 
                  id="qr-code-svg"
                  value={profile.qr_token} 
                  size={160} 
                  level="H"
                  includeMargin={false}
                />
              ) : (
                <div className="w-40 h-40 flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-4">
                  <QrCode className="h-10 w-10 mb-2 opacity-20" />
                  Aucun QR code généré
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                type="button" 
                variant="outline" 
                className="font-bold border-2"
                onClick={async () => {
                  const res = await regenerateQR()
                  if (!res.success) alert(res.error)
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Régénérer
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="font-bold border-2"
                disabled={!profile?.qr_token}
                onClick={() => {
                  const doc = new jsPDF({ format: [85, 55] }) // Business card size
                  const canvas = document.getElementById('qr-code-svg') as any
                  const svgData = new XMLSerializer().serializeToString(canvas)
                  const img = new Image()
                  img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
                  img.onload = () => {
                    doc.setFontSize(10)
                    doc.text("FlowTime Staff", 42.5, 10, { align: 'center' })
                    doc.addImage(img, 'PNG', 12.5, 15, 30, 30)
                    doc.setFontSize(8)
                    doc.text(`${profile.first_name} ${profile.last_name}`, 42.5, 50, { align: 'center' })
                    doc.save(`FlowTime_QR_${profile.first_name}.pdf`)
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center italic">
              Ce code sert à pointer lors de votre arrivée au bar.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Conditions Contractuelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Euro className="h-4 w-4" /> Taux horaire
              </span>
              <span className="font-bold">{profile?.hourly_rate || '0.00'} €/h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Début contrat</span>
              <span className="font-medium">{contract?.start_date || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Fin contrat</span>
              <span className="font-medium">{contract?.end_date || 'Permanent'}</span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Sauvegarder les modifications'}
        </Button>
      </form>

      <LogoutButton />
    </div>
  )
}
