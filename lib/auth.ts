import { createClient } from '@/lib/supabase/server'

export type UserProfile = {
  id: string
  email: string
  nama: string | null
  peran: string | null
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  const { data: akun, error: akunError } = await supabase
    .from('akun')
    .select('nama, peran')
    .eq('id', user.id)
    .single()

  console.log('[auth] user.id:', user.id)
  console.log('[auth] akun:', akun)
  console.log('[auth] akunError:', akunError)

  return {
    id: user.id,
    email: user.email ?? '',
    nama: akun?.nama ?? null,
    peran: akun?.peran ?? null,
  }
}

export function getDisplayName(profile: UserProfile): string {
  if (profile.nama) return profile.nama
  return profile.email.split('@')[0] ?? 'Pengguna'
}
