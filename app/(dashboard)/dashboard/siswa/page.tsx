// app/(dashboard)/dashboard/siswa/page.tsx
import { createClient } from '@/lib/supabase/server'
import SiswaClient from './SiswaClient'

export default async function SiswaPage() {
  const supabase = await createClient()

  // PERHATIKAN: Pastikan kolom 'nama_siswa' dan 'is_aktif' sesuai dengan yang ada di Supabase Anda.
  // Jika di Supabase namanya 'nama' dan 'status_aktif', ubah query select() di bawah ini.
  const { data: siswaList, error } = await supabase
    .from('siswa')
    .select('id, nis, nama_siswa, kelas, is_aktif') 
    .order('kelas', { ascending: true })
    .order('nama_siswa', { ascending: true })

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Gagal memuat data siswa: {error.message}
      </div>
    )
  }

  // Lempar data ke Client Component
  return <SiswaClient data={siswaList ?? []} />
}