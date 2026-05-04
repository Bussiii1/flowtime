import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { 
  LifeBuoy, 
  BookOpen, 
  GlassWater, 
  Phone, 
  FileText,
  ChevronRight
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  '🚑': LifeBuoy,
  '📋': BookOpen,
  '🍹': GlassWater,
  '📞': Phone,
  '📝': FileText,
}

export default async function InfoPages() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: pages } = await supabase
    .from('info_pages')
    .select('*')
    .order('order', { ascending: true })

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold">Informations</h1>
        <p className="text-sm text-muted-foreground">Tout ce que vous devez savoir pour travailler au Flow.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {pages?.map((page) => {
          const Icon = ICON_MAP[page.icon] || FileText
          return (
            <Link key={page.id} href={`/app/info/${page.id}`}>
              <Card className="h-full border-2 shadow-sm transition-transform active:scale-95 overflow-hidden group">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-colors group-hover:bg-secondary group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold leading-tight">{page.title}</h3>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {(!pages || pages.length === 0) && (
        <div className="text-center py-12 border-2 border-dashed rounded-2xl text-muted-foreground">
          <p>Aucune page d&apos;information n&apos;a encore été publiée.</p>
        </div>
      )}

      {/* Static "Mon Contrat" link if not in DB */}
      {!pages?.some(p => p.title.toLowerCase().includes('contrat')) && (
        <Link href="/app/contract">
          <Card className="border-2 shadow-sm bg-primary/5 border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-bold">Consulter mon contrat</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      )}
    </div>
  )
}
