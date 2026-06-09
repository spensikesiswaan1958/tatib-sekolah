import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getDisplayName } from '@/lib/auth'
import AbsensiClient from './AbsensiClient'

export default async function AbsensiPage() {
  const supabase = await createClient()

  const today = new Date().toISOString().split('T')[0]

  const [
    { data: absensiHariIni },
    { data: siswaAktif },
    { data: kategoriTerlambat },
    { data: kategoriAlpha },
    currentUser,
  ] = await Promise.all([
    supabase
      .from('absensi')
      .select(`
        id, siswa_id, tanggal, status, log_pelanggaran_id, created_at,
        siswa ( nama_siswa, kelas, nis )
      `)
      .eq('tanggal', today)
      .order('created_at', { ascending: false }),

    supabase
      .from('siswa')
      .select('id, nama_siswa, kelas, nis')
      .eq('is_aktif', true)
      .order('kelas')
      .order('nama_siswa'),

    supabase
      .from('kategori_pelanggaran')
      .select('id, nama_pelanggaran, poin')
      .ilike('nama_pelanggaran', '%terlambat%')
      .limit(5),

    supabase
      .from('kategori_pelanggaran')
      .select('id, nama_pelanggaran, poin')
      .or('nama_pelanggaran.ilike.%alpha%,nama_pelanggaran.ilike.%tidak masuk%,nama_pelanggaran.ilike.%tanpa keterangan%')
      .limit(5),

    getCurrentUser(),   // ✅ BARU
  ])

  // ✅ Siapkan objek pencatat untuk dikirim ke Client Component
  const pencatat = currentUser
    ? {
        id:    currentUser.id,
        nama:  getDisplayName(currentUser),
        peran: (currentUser.peran ?? 'ADMIN') as 'ADMIN' | 'GURU' | 'SISWA',
      }
    : null

  return (
    <AbsensiClient
      absensiHariIni={absensiHariIni ?? []}
      siswaAktif={siswaAktif ?? []}
      tanggalHariIni={today}
      kategoriTerlambat={kategoriTerlambat ?? []}
      kategoriAlpha={kategoriAlpha ?? []}
      pencatat={pencatat}   // ✅ BARU
    />
  )
}
