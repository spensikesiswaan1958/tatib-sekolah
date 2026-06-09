// app/(dashboard)/dashboard/siswa/SiswaClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { Search, Users, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Siswa = {
  id: string
  nis: string
  nama_siswa: string // Sesuaikan nama kolom dengan database Anda
  kelas: string
  is_aktif: boolean  // Sesuaikan nama kolom dengan database Anda
}

type Props = {
  data: Siswa[]
}

const ITEMS_PER_PAGE = 20

export default function SiswaClient({ data }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [page, setPage] = useState(1)

  // Ambil daftar kelas unik untuk dropdown filter
  const kelasList = useMemo(() => {
    const unique = Array.from(new Set(data.map((s) => s.kelas))).sort()
    return unique
  }, [data])

  // Filter + search
  const filtered = useMemo(() => {
    return data.filter((s) => {
      // Menangani null safety jika ada data kosong
      const nama = s.nama_siswa?.toLowerCase() || ''
      const nis = s.nis?.toLowerCase() || ''
      
      const matchSearch =
        nama.includes(search.toLowerCase()) ||
        nis.includes(search.toLowerCase())

      const matchKelas = filterKelas ? s.kelas === filterKelas : true
      return matchSearch && matchKelas
    })
  }, [data, search, filterKelas])

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Reset page saat filter berubah
  const handleSearch = (val: string) => { setSearch(val); setPage(1) }
  const handleFilter = (val: string) => { setFilterKelas(val); setPage(1) }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">
          Daftar Siswa
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filtered.length} dari {data.length} siswa)
          </span>
        </h2>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterKelas}
          onChange={(e) => handleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Semua Kelas</option>
          {kelasList.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-10">No</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">NIS</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nama Siswa</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Kelas</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada data siswa yang ditemukan.
                </td>
              </tr>
            ) : (
              paginated.map((siswa, idx) => (
                <tr
                  key={siswa.id}
                  className="hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/siswa/${siswa.id}`)}
                >
                  <td className="px-4 py-3 text-gray-400">
                    {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">{siswa.nis}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{siswa.nama_siswa}</td>
                  <td className="px-4 py-3 text-gray-600">{siswa.kelas}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      siswa.is_aktif
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {siswa.is_aktif ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/siswa/${siswa.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Eye size={13} />
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}