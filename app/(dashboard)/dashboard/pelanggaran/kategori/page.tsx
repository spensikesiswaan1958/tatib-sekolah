// Server Component (default — tidak perlu "use client")
// Mengambil data langsung dari Supabase di server, aman & cepat
import { requireAdmin } from '@/lib/rbac-server'
import { createClient } from '@/lib/supabase/server'
import { KategoriPelanggaran } from '@/types/supabase'

// Helper untuk warna badge berdasarkan kategori
function getBadgeStyle(kategori: string): string {
  switch (kategori) {
    case 'RINGAN':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
    case 'SEDANG':
      return 'bg-orange-100 text-orange-800 border border-orange-300'
    case 'BERAT':
      return 'bg-red-100 text-red-800 border border-red-300'
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-300'
  }
}

// Helper untuk warna poin
function getPoinStyle(poin: number): string {
  if (poin <= 3) return 'text-yellow-600 font-semibold'
  if (poin <= 6) return 'text-orange-600 font-semibold'
  return 'text-red-600 font-bold'
}

export default async function KategoriPelanggaranPage() {
  const user = await requireAdmin()
  // 1. Buat Supabase server client
  const supabase = await createClient()

  // 2. Fetch data dari tabel kategori_pelanggaran
  const { data, error } = await supabase
    .from('kategori_pelanggaran')
    .select('*')
    .order('no_pelanggaran', { ascending: true })

  // 3. Tangani error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h3 className="text-red-700 font-semibold text-lg">Gagal memuat data</h3>
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  const kategoriList = data as KategoriPelanggaran[]

  // 4. Hitung ringkasan per kategori
  const summary = {
    RINGAN: kategoriList.filter((k) => k.kategori === 'RINGAN').length,
    SEDANG: kategoriList.filter((k) => k.kategori === 'SEDANG').length,
    BERAT: kategoriList.filter((k) => k.kategori === 'BERAT').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Kategori Pelanggaran
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Daftar kategori dan poin pelanggaran tata tertib sekolah
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
          Total: <span className="font-semibold text-gray-700">{kategoriList.length} item</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-xs text-yellow-600 uppercase font-semibold tracking-wide">
            Pelanggaran Ringan
          </p>
          <p className="text-3xl font-bold text-yellow-700 mt-1">{summary.RINGAN}</p>
          <p className="text-xs text-yellow-500 mt-1">item kategori</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-xs text-orange-600 uppercase font-semibold tracking-wide">
            Pelanggaran Sedang
          </p>
          <p className="text-3xl font-bold text-orange-700 mt-1">{summary.SEDANG}</p>
          <p className="text-xs text-orange-500 mt-1">item kategori</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 uppercase font-semibold tracking-wide">
            Pelanggaran Berat
          </p>
          <p className="text-3xl font-bold text-red-700 mt-1">{summary.BERAT}</p>
          <p className="text-xs text-red-500 mt-1">item kategori</p>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Header Tabel */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Pelanggaran
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                  Poin
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Keterangan Tindakan
                </th>
              </tr>
            </thead>
            {/* Body Tabel */}
            <tbody className="bg-white divide-y divide-gray-100">
              {kategoriList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    Belum ada data kategori pelanggaran.
                  </td>
                </tr>
              ) : (
                kategoriList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500 text-center">
                      {item.no_pelanggaran}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {item.nama_pelanggaran}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm ${getPoinStyle(item.poin)}`}>
                        {item.poin}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(item.kategori)}`}
                      >
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.keterangan_tindakan}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer Tabel */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-medium">{kategoriList.length}</span> kategori pelanggaran
          </p>
        </div>
      </div>
    </div>
  )
}