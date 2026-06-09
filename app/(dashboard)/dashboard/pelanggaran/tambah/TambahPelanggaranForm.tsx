'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────
type KategoriPelanggaran = {
  id: string
  no_pelanggaran: number
  nama_pelanggaran: string
  poin: number
  kategori: string
}

type Siswa = {
  id: string
  nis: string
  nama_siswa: string
  kelas: string
}

// ✅ BARU: tipe pencatat dari server
type Pencatat = {
  id: string
  nama: string
  peran: 'ADMIN' | 'GURU' | 'SISWA'
} | null

type Props = {
  kategoriList: KategoriPelanggaran[]
  pencatat: Pencatat          // ✅ BARU
}

// ── Helper: group kategori ─────────────────────────────────────────────────────
function groupByKategori(list: KategoriPelanggaran[]) {
  return list.reduce<Record<string, KategoriPelanggaran[]>>((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = []
    acc[item.kategori].push(item)
    return acc
  }, {})
}

const BADGE: Record<string, string> = {
  RINGAN: 'bg-yellow-100 text-yellow-700',
  SEDANG: 'bg-orange-100 text-orange-700',
  BERAT:  'bg-red-100 text-red-700',
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function TambahPelanggaranForm({ kategoriList, pencatat }: Props) {
  const supabase = createClient()

  // Siswa
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Siswa[]>([])
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Form
  const [selectedKategoriId, setSelectedKategoriId] = useState('')
  const [waktuKejadian, setWaktuKejadian] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [keterangan, setKeterangan] = useState('')
  const [dariAbsensi, setDariAbsensi] = useState(false)

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Derived
  const grouped = groupByKategori(kategoriList)
  const selectedKategori = kategoriList.find(k => k.id === selectedKategoriId)

  // ── Search siswa (debounced) ──────────────────────────────────────────────────
  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery(val)
    setSelectedSiswa(null)

    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (val.trim().length < 2) { setSearchResults([]); return }

    setIsSearching(true)
    searchTimeout.current = setTimeout(async () => {
      const { data } = await supabase
        .from('siswa')
        .select('id, nis, nama_siswa, kelas')
        .or(`nama_siswa.ilike.%${val}%,nis.ilike.%${val}%`)
        .eq('is_aktif', true)
        .limit(8)
      setSearchResults(data ?? [])
      setIsSearching(false)
    }, 350)
  }, [supabase])

  const handleSelectSiswa = (siswa: Siswa) => {
    setSelectedSiswa(siswa)
    setSearchQuery(siswa.nama_siswa)
    setSearchResults([])
  }

  const handleClearSiswa = () => {
    setSelectedSiswa(null)
    setSearchQuery('')
    setSearchResults([])
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedSiswa) return showToast('error', 'Pilih siswa terlebih dahulu.')
    if (!selectedKategoriId) return showToast('error', 'Pilih kategori pelanggaran.')
    if (!selectedKategori) return

    setIsSubmitting(true)

    const { error } = await supabase.from('log_pelanggaran').insert({
      siswa_id:             selectedSiswa.id,
      kategori_id:          selectedKategori.id,
      nama_siswa_denorm:    selectedSiswa.nama_siswa,
      kelas_denorm:         selectedSiswa.kelas,
      waktu_kejadian:       new Date(waktuKejadian).toISOString(),
      pencatat_id:          pencatat?.id ?? null,           // ✅ dari session
      nama_pencatat_denorm: pencatat?.nama ?? 'Admin Kesiswaan', // ✅ dari session
      peran_pencatat:       pencatat?.peran ?? 'ADMIN',     // ✅ dari session
      dari_absensi:         dariAbsensi,
      keterangan_tambahan:  keterangan.trim() || null,
    })

    setIsSubmitting(false)

    if (error) {
      showToast('error', `Gagal menyimpan: ${error.message}`)
    } else {
      showToast('success', `Pelanggaran berhasil dicatat untuk ${selectedSiswa.nama_siswa}.`)
      handleClearSiswa()
      setSelectedKategoriId('')
      setWaktuKejadian(new Date().toISOString().slice(0, 16))
      setKeterangan('')
      setDariAbsensi(false)
    }
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-md
          ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* ✅ Info pencatat */}
      {pencatat && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          Dicatat oleh: <strong>{pencatat.nama}</strong>
          <span className="text-blue-400">({pencatat.peran})</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Input Pelanggaran Siswa
          </h2>
        </div>

        <div className="p-6 space-y-5">

          {/* 1. Cari Siswa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Siswa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ketik nama atau NIS siswa..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className={`w-full pl-9 pr-9 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900
                  ${selectedSiswa ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}
              />
              {searchQuery && (
                <button onClick={handleClearSiswa} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}

              {searchResults.length > 0 && !selectedSiswa && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {isSearching ? (
                    <div className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Mencari...
                    </div>
                  ) : (
                    searchResults.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleSelectSiswa(s)}
                        className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="text-sm font-medium text-gray-800">{s.nama_siswa}</div>
                        <div className="text-xs text-gray-400">{s.nis} · {s.kelas}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedSiswa && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span className="font-medium text-green-800">{selectedSiswa.nama_siswa}</span>
                <span className="text-green-600">— {selectedSiswa.kelas} · NIS {selectedSiswa.nis}</span>
              </div>
            )}
          </div>

          {/* 2. Kategori Pelanggaran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Jenis Pelanggaran <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedKategoriId}
              onChange={e => setSelectedKategoriId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="" className="text-gray-900">-- Pilih jenis pelanggaran --</option>
              {Object.entries(grouped).map(([kat, items]) => (
                <optgroup key={kat} label={`▸ ${kat}`} className="text-gray-900 font-semibold bg-gray-50">
                  {items.map(k => (
                    <option key={k.id} value={k.id} className="text-gray-900">
                      [{k.no_pelanggaran}] {k.nama_pelanggaran} ({k.poin} poin)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {selectedKategori && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[selectedKategori.kategori] ?? 'bg-gray-100 text-gray-600'}`}>
                  {selectedKategori.kategori}
                </span>
                <span className="text-gray-500">
                  Poin pelanggaran: <strong className="text-red-600">+{selectedKategori.poin}</strong>
                </span>
              </div>
            )}
          </div>

          {/* 3. Waktu Kejadian */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Waktu Kejadian
            </label>
            <input
              type="datetime-local"
              value={waktuKejadian}
              onChange={e => setWaktuKejadian(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            />
          </div>

          {/* 4. Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Keterangan Tambahan <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan kronologi singkat kejadian..."
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-gray-900"
            />
          </div>

          {/* 5. Dari Absensi */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="dari-absensi"
              checked={dariAbsensi}
              onChange={e => setDariAbsensi(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="dari-absensi" className="text-sm text-gray-700">
              Pelanggaran ini berasal dari data absensi
            </label>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedSiswa || !selectedKategoriId}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400
              text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            ) : (
              'Simpan Pelanggaran'
            )}
          </button>

        </div>
      </div>
    </div>
  )
}
