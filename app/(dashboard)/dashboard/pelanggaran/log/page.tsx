import { requireAdminOrGuru } from '@/lib/rbac-server'
import { createClient } from '@/lib/supabase/server'
import LogClient from './LogClient'

export default async function LogPelanggaranPage() {
  const user = await requireAdminOrGuru()
  const supabase = await createClient()

  const [
    { data: logs, error },
    { data: kategoriList },
  ] = await Promise.all([
    supabase
      .from('log_pelanggaran')
      .select(`
        id,
        nama_siswa_denorm,
        kelas_denorm,
        waktu_kejadian,
        nama_pencatat_denorm,
        dari_absensi,
        keterangan_tambahan,
        created_at,
        kategori_pelanggaran (
          nama_pelanggaran,
          poin,
          kategori
        )
      `)
      .order('waktu_kejadian', { ascending: false })
      .limit(500),
    supabase
      .from('kategori_pelanggaran')
      .select('id, no_pelanggaran, nama_pelanggaran, poin, kategori')
      .order('kategori')
      .order('no_pelanggaran'),
  ])

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Gagal memuat log pelanggaran: {error.message}
      </div>
    )
  }

  return (
    <LogClient
      data={(logs as any) ?? []}
      peran={user.peran ?? ''}
      kategoriList={kategoriList ?? []}
    />
  )
}
