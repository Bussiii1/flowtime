import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Calendar, Info, User } from 'lucide-react'
import Link from 'next/link'

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-screen justify-center bg-muted/30">
      <div className="flex w-full max-w-[480px] flex-col bg-background shadow-2xl">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 p-4 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dashboard</span>
            <h2 className="text-xl font-bold">Hello {profile?.first_name || 'Toi'} 👋</h2>
          </div>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {(profile?.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-24">
          {children}
        </main>

        {/* Bottom Tab Navigation */}
        <nav className="fixed bottom-0 z-20 flex w-full max-w-[480px] items-center justify-around border-t bg-background/95 p-2 pb-6 backdrop-blur-md">
          <Link href="/app" className="flex flex-col items-center gap-1 p-2 text-primary">
            <Clock className="h-6 w-6" />
            <span className="text-[10px] font-bold">Heures</span>
          </Link>
          <Link href="/app/schedule" className="flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary">
            <Calendar className="h-6 w-6" />
            <span className="text-[10px] font-medium">Planning</span>
          </Link>
          <Link href="/app/info" className="flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary">
            <Info className="h-6 w-6" />
            <span className="text-[10px] font-medium">Infos</span>
          </Link>
          <Link href="/app/profile" className="flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary">
            <User className="h-6 w-6" />
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
