import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getDisplayName } from '@/lib/auth'
import TambahPelanggaranForm from './TambahPelanggaranForm'

export default async function TambahPelanggaranPage() {
  const supabase = await createClient()

  const [
    { data: kategoriList, error },
    currentUser,
  ] = await Promise.all([
    supabase
      .from('kategori_pelanggaran')
      .select('id, no_pelanggaran, nama_pelanggaran, poin, kategori')
      .order('kategori', { ascending: true })
      .order('no_pelanggaran', { ascending: true }),
    getCurrentUser(),
  ])

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Gagal memuat kategori: {error.message}
      </div>
    )
  }

  const pencatat = currentUser
    ? {
        id:    currentUser.id,
        nama:  getDisplayName(currentUser),
        peran: (currentUser.peran ?? 'ADMIN') as 'ADMIN' | 'GURU' | 'SISWA',
      }
    : null

  return (
    <TambahPelanggaranForm
      kategoriList={kategoriList ?? []}
      pencatat={pencatat}
    />
  )
}
