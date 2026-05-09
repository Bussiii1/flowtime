import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckSquare, 
  FileSpreadsheet, 
  Info, 
  Settings, 
  Bell, 
  Search,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
} from '@/components/ui/dropdown-menu'
import { LogoutButton } from '@/components/auth/logout-button'
import { StoreProvider } from '@/components/providers/store-provider'

export default async function AdminLayout({
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

  if (profile?.role !== 'admin') {
    redirect('/app')
  }

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { label: 'Employés', icon: Users, href: '/admin/employees' },
    { label: 'Plannings', icon: Calendar, href: '/admin/planning' },
    { label: 'Validation heures', icon: CheckSquare, href: '/admin/validation' },
    { label: 'Export paie', icon: FileSpreadsheet, href: '/admin/payroll' },
    { label: 'Infos', icon: Info, href: '/admin/infos' },
    { label: 'Paramètres', icon: Settings, href: '/admin/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <span className="font-black">FT</span>
            </div>
            <span className="text-xl font-bold tracking-tight">FlowTime</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary/5 hover:text-primary dark:text-slate-400 dark:hover:bg-primary/10 dark:hover:text-primary"
            >
              <item.icon className="h-5 w-5 text-slate-400 group-hover:text-primary" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 px-8 backdrop-blur-md dark:bg-slate-900/80">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-10 h-10 border-slate-200 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border bg-slate-50 p-1 pr-3 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-white text-xs">AD</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold leading-none">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase">Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem>Paramètres</DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton variant="dropdown" />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <StoreProvider>
            {children}
          </StoreProvider>
        </main>
      </div>
    </div>
  )
}
