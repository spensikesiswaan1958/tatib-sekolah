'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Search, AlertTriangle, Filter,
  Pencil, X, CheckCircle2, Loader2
} from 'lucide-react'
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

type KategoriOption = {
  id: string
  no_pelanggaran: number
  nama_pelanggaran: string
  poin: number
  kategori: string
}

type Props = {
  data: LogItem[]
  peran: string
  kategoriList: KategoriOption[]
}

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

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const ITEMS_PER_PAGE = 20

// ── Edit Modal ─────────────────────────────────────────────────────────────────
type EditModalProps = {
  log: LogItem
  kategoriList: KategoriOption[]
  onClose: () => void
  onSaved: (updated: Partial<LogItem> & { id: string }) => void
}

function EditModal({ log, kategoriList, onClose, onSaved }: EditModalProps) {
  const supabase = createClient()

  // Cari id kategori saat ini dari nama
  const currentKategori = kategoriList.find(
    k => k.nama_pelanggaran === log.kategori_pelanggaran?.nama_pelanggaran
  )

  const [kategoriId, setKategoriId]     = useState(currentKategori?.id ?? '')
  const [waktu, setWaktu]               = useState(toLocalDatetimeValue(log.waktu_kejadian))
  const [keterangan, setKeterangan]     = useState(log.keterangan_tambahan ?? '')
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const selectedKategori = kategoriList.find(k => k.id === kategoriId)

  // Group untuk select
  const grouped = useMemo(() =>
    kategoriList.reduce<Record<string, KategoriOption[]>>((acc, k) => {
      if (!acc[k.kategori]) acc[k.kategori] = []
      acc[k.kategori].push(k)
      return acc
    }, {})
  , [kategoriList])

  const handleSave = async () => {
    if (!kategoriId) { setError('Pilih kategori pelanggaran.'); return }
    setSaving(true)
    setError(null)

    console.log('=== DEBUG EDIT ===')
    console.log('log.id:', log.id)
    console.log('kategori_id:', kategoriId)
    console.log('waktu_kejadian:', new Date(waktu).toISOString())
    console.log('keterangan_tambahan:', keterangan.trim() || null)

    const { data, error: err } = await supabase
      .from('log_pelanggaran')
      .update({
        kategori_id:         kategoriId,
        waktu_kejadian:      new Date(waktu).toISOString(),
        keterangan_tambahan: keterangan.trim() || null,
      })
      .eq('id', log.id)
      .select()  // ← tambah ini untuk cek apakah ada row yang terupdate

    console.log('UPDATE RESULT data:', data)
    console.log('UPDATE RESULT error:', err)

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    // Cek apakah ada row yang benar-benar terupdate
    if (!data || data.length === 0) {
      setError('Update tidak berpengaruh — kemungkinan RLS memblokir. Cek console.')
      setSaving(false)
      return
    }

    onSaved({
      id: log.id,
      waktu_kejadian:      new Date(waktu).toISOString(),
      keterangan_tambahan: keterangan.trim() || null,
      kategori_pelanggaran: selectedKategori
        ? {
            nama_pelanggaran: selectedKategori.nama_pelanggaran,
            poin:             selectedKategori.poin,
            kategori:         selectedKategori.kategori,
          }
        : log.kategori_pelanggaran,
    })

    setSaving(false)
    onClose()
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-500" />
            Edit Pelanggaran
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Info siswa — read only */}
          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-400 mb-0.5">Siswa (tidak dapat diubah)</p>
            <p className="font-medium text-gray-800">{log.nama_siswa_denorm}</p>
            <p className="text-xs text-gray-500">{log.kelas_denorm}</p>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Jenis Pelanggaran <span className="text-red-500">*</span>
            </label>
            <select
              value={kategoriId}
              onChange={e => setKategoriId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="">-- Pilih jenis pelanggaran --</option>
              {Object.entries(grouped).map(([kat, items]) => (
                <optgroup key={kat} label={`▸ ${kat}`}>
                  {items.map(k => (
                    <option key={k.id} value={k.id}>
                      [{k.no_pelanggaran}] {k.nama_pelanggaran} ({k.poin} poin)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedKategori && (
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-medium border
                  ${BADGE[selectedKategori.kategori] ?? 'bg-gray-100 text-gray-500'}`}>
                  {selectedKategori.kategori}
                </span>
                <span className="text-gray-500">
                  Poin: <strong className="text-red-600">+{selectedKategori.poin}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Waktu kejadian */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Waktu Kejadian
            </label>
            <input
              type="datetime-local"
              value={waktu}
              onChange={e => setWaktu(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Keterangan Tambahan
              <span className="text-gray-400 font-normal ml-1">(opsional)</span>
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              placeholder="Kronologi singkat..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-gray-900"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400
                text-white font-medium rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                : <><CheckCircle2 className="w-4 h-4" /> Simpan Perubahan</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function LogClient({ data, peran, kategoriList }: Props) {
  const [logs, setLogs]               = useState<LogItem[]>(data)
  const [search, setSearch]           = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [filterTingkat, setFilterTingkat] = useState('')
  const [page, setPage]               = useState(1)
  const [editingLog, setEditingLog]   = useState<LogItem | null>(null)
  const [toast, setToast]             = useState<string | null>(null)

  const isAdmin = peran === 'ADMIN'

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleSaved = (updated: Partial<LogItem> & { id: string }) => {
    setLogs(prev => prev.map(l =>
      l.id === updated.id ? { ...l, ...updated } : l
    ))
    showToast('Pelanggaran berhasil diperbarui.')
  }

  // Daftar kelas unik
  const kelasList = useMemo(() =>
    Array.from(new Set(logs.map(d => d.kelas_denorm ?? ''))).filter(Boolean).sort()
  , [logs])

  // Filter + search
  const filtered = useMemo(() => {
    return logs.filter(d => {
      const q = search.toLowerCase()
      const matchSearch =
        (d.nama_siswa_denorm ?? '').toLowerCase().includes(q) ||
        (d.kategori_pelanggaran?.nama_pelanggaran ?? '').toLowerCase().includes(q)
      const matchKelas   = filterKelas   ? d.kelas_denorm === filterKelas   : true
      const matchTingkat = filterTingkat ? d.kategori_pelanggaran?.kategori === filterTingkat : true
      return matchSearch && matchKelas && matchTingkat
    })
  }, [logs, search, filterKelas, filterTingkat])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const reset = (fn: () => void) => { fn(); setPage(1) }

  return (
    <div className="p-6 space-y-4">

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium shadow">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toast}
        </div>
      )}

      {/* Edit Modal */}
      {editingLog && (
        <EditModal
          log={editingLog}
          kategoriList={kategoriList}
          onClose={() => setEditingLog(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            Log Pelanggaran
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filtered.length} dari {logs.length} catatan)
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
              {/* Kolom aksi hanya muncul untuk ADMIN */}
              {isAdmin && (
                <th className="px-4 py-3 text-left font-medium text-gray-500">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7}>
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
                  {/* Tombol edit — hanya ADMIN */}
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingLog(log)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition font-medium"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                    </td>
                  )}
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
