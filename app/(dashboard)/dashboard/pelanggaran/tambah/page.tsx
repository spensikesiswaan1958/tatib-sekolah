import { requireAdminOrGuru } from '@/lib/rbac-server'
import { createClient } from '@/lib/supabase/server'
import { getDisplayName } from '@/lib/auth'
import TambahPelanggaranForm from './TambahPelanggaranForm'

export default async function TambahPelanggaranPage() {
  const user = await requireAdminOrGuru()
  const supabase = await createClient()

  const { data: kategoriList, error } = await supabase
    .from('kategori_pelanggaran')
    .select('id, no_pelanggaran, nama_pelanggaran, poin, kategori')
    .order('kategori', { ascending: true })
    .order('no_pelanggaran', { ascending: true })

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Gagal memuat kategori: {error.message}
      </div>
    )
  }

  const pencatat = {
    id:    user.id,
    nama:  getDisplayName(user),
    peran: (user.peran ?? 'ADMIN') as 'ADMIN' | 'GURU' | 'SISWA',
  }

  return (
    <TambahPelanggaranForm
      kategoriList={kategoriList ?? []}
      pencatat={pencatat}
    />
  )
}
