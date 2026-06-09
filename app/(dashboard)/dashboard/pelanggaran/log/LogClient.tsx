'use client'

import { useState, useMemo } from 'react'
import { Search, AlertTriangle, Filter } from 'lucide-react'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────
type KategoriInfo = {
  nama_pelanggaran: string
  poin: number
  kategori: string
}

type LogItem = {
  id: string
  nama_siswa_denorm: string | null
  kelas_denorm: string | null
  waktu_kejadian: string
  nama_pencatat_denorm: string | null
  dari_absensi: boolean
  keterangan_tambahan: string | null
  created_at: string
  kategori_pelanggaran: KategoriInfo | null
}

type Props = { data: LogItem[] }

// ── Helpers ────────────────────────────────────────────────────────────────────
const BADGE: Record<string, string> = {
  RINGAN: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  SEDANG: 'bg-orange-100 text-orange-700 border-orange-200',
  BERAT:  'bg-red-100 text-red-700 border-red-200',
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const ITEMS_PER_PAGE = 20

// ── Component ──────────────────────────────────────────────────────────────────
export default function LogClient({ data }: Props) {
  const [search, setSearch]           = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [filterTingkat, setFilterTingkat] = useState('')
  const [page, setPage]               = useState(1)

  // Daftar kelas unik
  const kelasList = useMemo(() =>
    Array.from(new Set(data.map(d => d.kelas_denorm ?? ''))).filter(Boolean).sort()
  , [data])

  // Filter + search
  const filtered = useMemo(() => {
    return data.filter(d => {
      const q = search.toLowerCase()
      const matchSearch =
        (d.nama_siswa_denorm ?? '').toLowerCase().includes(q) ||
        (d.kategori_pelanggaran?.nama_pelanggaran ?? '').toLowerCase().includes(q)
      const matchKelas   = filterKelas   ? d.kelas_denorm === filterKelas   : true
      const matchTingkat = filterTingkat ? d.kategori_pelanggaran?.kategori === filterTingkat : true
      return matchSearch && matchKelas && matchTingkat
    })
  }, [data, search, filterKelas, filterTingkat])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const reset = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="p-6 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            Log Pelanggaran
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filtered.length} dari {data.length} catatan)
            </span>
          </h2>
        </div>
        
        <Link
          href="/dashboard/pelanggaran/tambah"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Input Pelanggaran
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau jenis pelanggaran..."
            value={search}
            onChange={e => reset(() => setSearch(e.target.value))}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <select
              value={filterKelas}
              onChange={e => reset(() => setFilterKelas(e.target.value))}
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">Semua Kelas</option>
              {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <select
            value={filterTingkat}
            onChange={e => reset(() => setFilterTingkat(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="">Semua Tingkat</option>
            <option value="RINGAN">Ringan</option>
            <option value="SEDANG">Sedang</option>
            <option value="BERAT">Berat</option>
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-10">No</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Siswa</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Pelanggaran</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Tingkat</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Poin</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Waktu</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Pencatat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <AlertTriangle className="w-10 h-10 mb-3 text-gray-200" />
                    <p className="font-medium text-gray-500">Belum ada data pelanggaran</p>
                    <p className="text-xs mt-1">Gunakan tombol "Input Pelanggaran" untuk menambah catatan</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((log, idx) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{log.nama_siswa_denorm ?? '-'}</div>
                    <div className="text-xs text-gray-400">{log.kelas_denorm ?? '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">
                      {log.kategori_pelanggaran?.nama_pelanggaran ?? '-'}
                    </div>
                    {log.keterangan_tambahan && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                        {log.keterangan_tambahan}
                      </div>
                    )}
                    {log.dari_absensi && (
                      <span className="inline-block mt-0.5 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                        dari absensi
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.kategori_pelanggaran?.kategori ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                        ${BADGE[log.kategori_pelanggaran.kategori] ?? 'bg-gray-100 text-gray-500'}`}>
                        {log.kategori_pelanggaran.kategori}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 font-semibold text-red-600">
                    +{log.kategori_pelanggaran?.poin ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatTanggal(log.waktu_kejadian)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {log.nama_pencatat_denorm ?? '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Halaman {page} dari {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ← Sebelumnya
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
