'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function LogoutButton({ variant = 'button' }: { variant?: 'button' | 'dropdown' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenuItem 
        onClick={(e) => {
          e.preventDefault()
          handleLogout()
        }} 
        className="text-destructive cursor-pointer"
        disabled={loading}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
        Se déconnecter
      </DropdownMenuItem>
    )
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout} 
      disabled={loading}
      className="w-full border-2 text-destructive border-destructive/20 hover:bg-destructive/5"
    >
      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogOut className="mr-2 h-5 w-5" />}
      Se déconnecter
    </Button>
  )
}
