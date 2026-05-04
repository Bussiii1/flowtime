'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as jose from 'jose'

const BAR_COORDS = { lat: 51.3478, lng: 3.2844 } // Knokke Beach placeholder
const MAX_DISTANCE_M = 200

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export async function processKioskScan(token: string, coords?: { lat: number, lng: number }) {
  const supabase = createClient()
  
  // 1. Verify JWT
  const secret = new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY || 'default_secret')
  let payload
  try {
    const { payload: p } = await jose.jwtVerify(token, secret)
    payload = p
  } catch (e) {
    return { error: 'QR Code invalide ou expiré' }
  }

  const userId = payload.user_id as string

  // 2. Geolocation Check
  if (coords) {
    const dist = calculateDistance(coords.lat, coords.lng, BAR_COORDS.lat, BAR_COORDS.lng)
    if (dist > MAX_DISTANCE_M) {
      return { error: `Trop loin du bar (${Math.round(dist)}m). Rapprochez-vous.` }
    }
  }

  // 3. Find latest shift for today
  const today = new Date().toISOString().split('T')[0]
  const { data: latestShift } = await supabase
    .from('shifts')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })

  // 4. Logic: Check-in or Check-out
  if (latestShift && !latestShift.end_time) {
    // It's a Check-out
    const { error } = await supabase
      .from('shifts')
      .update({ end_time: nowTime })
      .eq('id', latestShift.id)

    if (error) return { error: error.message }

    const { data: user } = await supabase.from('users').select('first_name').eq('id', userId).single()
    
    // Calculate duration for the message
    const start = new Date(`2000-01-01T${latestShift.start_time}`)
    const end = new Date(`2000-01-01T${nowTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs / (1000 * 60)) % 60)

    revalidatePath('/admin/checkin')
    return { 
      success: true, 
      type: 'out', 
      name: user?.first_name, 
      time: nowTime,
      duration: `${diffHrs}h${diffMins.toString().padStart(2, '0')}`
    }
  } else {
    // It's a Check-in
    const { error } = await supabase
      .from('shifts')
      .insert({
        user_id: userId,
        date: today,
        start_time: nowTime,
        status: 'pending' // Or 'validated' automatically if kiosk is trusted
      })

    if (error) return { error: error.message }

    const { data: user } = await supabase.from('users').select('first_name').eq('id', userId).single()
    
    revalidatePath('/admin/checkin')
    return { success: true, type: 'in', name: user?.first_name, time: nowTime }
  }
}
