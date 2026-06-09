import { createClient } from '@/lib/supabase/server'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserProfile = {
  id: string
  email: string
  nama_lengkap: string | null
  peran: string | null
}

// ─── Helper: ambil user + profil dari tabel akun ──────────────────────────────

/**
 * Digunakan di Server Components.
 * Mengembalikan data user yang sedang login, lengkap dengan nama dari tabel `akun`.
 * Kembalikan null jika belum login.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  // Ambil nama dari tabel akun (jika ada)
  const { data: akun } = await supabase
    .from('akun')
    .select('id, nama_lengkap, peran')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? '',
    nama_lengkap: akun?.nama_lengkap ?? null,
    peran: akun?.peran ?? null,
  }
}

/**
 * Nama tampilan: gunakan nama_lengkap dari tabel akun, fallback ke bagian email sebelum @
 */
export function getDisplayName(profile: UserProfile): string {
  if (profile.nama_lengkap) return profile.nama_lengkap
  return profile.email.split('@')[0] ?? 'Pengguna'
}
