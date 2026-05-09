'use client'

import { Store } from '@/lib/store'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Store.Container>
      {children}
    </Store.Container>
  )
}
