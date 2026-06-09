'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CalendarCheck, Search, CheckCircle2, AlertTriangle,
  Clock, XCircle, Loader2, Users, Info
} from 'lucide-react'

type StatusKehadiran = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'ALPHA'

type AbsensiItem = {
  id: string
  siswa_id: string
  tanggal: string
  status: StatusKehadiran
  log_pelanggaran_id: string | null
  created_at: string
  siswa: {
    nama_siswa: string
    kelas: string
    nis: string
  } | null
}

type SiswaItem = {
  id: string
  nama_siswa: string
  kelas: string
  nis: string
}

type KategoriItem = {
  id: string
  nama_pelanggaran: string
  poin: number
}

// ── Tambahkan type ini ──
type Pencatat = {
  id: string
  nama: string
  peran: 'ADMIN' | 'GURU' | 'SISWA'
} | null

type Props = {
  absensiHariIni: AbsensiItem[]
  siswaAktif: SiswaItem[]
  tanggalHariIni: string
  kategoriTerlambat: KategoriItem[]
  kategoriAlpha: KategoriItem[]
  pencatat: Pencatat   // ✅ BARU
}

const STATUS_CONFIG: Record<StatusKehadiran, { label: string; badge: string; icon: React.ReactNode }> = {
  HADIR:     { label: 'Hadir',     badge: 'bg-green-100 text-green-700 border-green-200',   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  TERLAMBAT: { label: 'Terlambat', badge: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock className="w-3.5 h-3.5" /> },
  IZIN:      { label: 'Izin',      badge: 'bg-blue-100 text-blue-700 border-blue-200',       icon: <Info className="w-3.5 h-3.5" /> },
  SAKIT:     { label: 'Sakit',     badge: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Info className="w-3.5 h-3.5" /> },
  ALPHA:     { label: 'Alpha',     badge: 'bg-red-100 text-red-700 border-red-200',          icon: <XCircle className="w-3.5 h-3.5" /> },
}

// Status yang otomatis membuat log pelanggaran
const STATUS_PELANGGARAN: StatusKehadiran[] = ['TERLAMBAT', 'ALPHA']

export default function AbsensiClient({
  absensiHariIni,
  siswaAktif,
  tanggalHariIni,
  kategoriTerlambat,
  kategoriAlpha,
  pencatat,            // ✅ BARU
}: Props) {
  const supabase = createClient()

  const [absensiList, setAbsensiList] = useState<AbsensiItem[]>(absensiHariIni)
  const [search, setSearch]           = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [filterStatus, setFilterStatus] = useState<StatusKehadiran | ''>('')
  const [loading, setLoading]         = useState<string | null>(null)
  const [toast, setToast]             = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Siswa yang sudah absen hari ini
  const sudahAbsenIds = useMemo(() =>
    new Set(absensiList.map(a => a.siswa_id))
  , [absensiList])

  // Siswa yang BELUM absen
  const belumAbsen = useMemo(() =>
    siswaAktif.filter(s => !sudahAbsenIds.has(s.id))
  , [siswaAktif, sudahAbsenIds])

  // Daftar kelas unik
  const kelasList = useMemo(() =>
    Array.from(new Set(siswaAktif.map(s => s.kelas))).sort()
  , [siswaAktif])

  // Filter absensi
  const filteredAbsensi = useMemo(() => {
    return absensiList.filter(a => {
      const q = search.toLowerCase()
      const matchSearch =
        (a.siswa?.nama_siswa ?? '').toLowerCase().includes(q) ||
        (a.siswa?.nis ?? '').toLowerCase().includes(q)
      const matchKelas  = filterKelas  ? a.siswa?.kelas === filterKelas   : true
      const matchStatus = filterStatus ? a.status === filterStatus         : true
      return matchSearch && matchKelas && matchStatus
    })
  }, [absensiList, search, filterKelas, filterStatus])

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Input absensi manual ─────────────────────────────────────────────────────
  const handleInputAbsensi = async (siswa: SiswaItem, status: StatusKehadiran) => {
    setLoading(`${siswa.id}-${status}`)

    try {
      let logPelanggaranId: string | null = null

      // Jika TERLAMBAT atau ALPHA → buat log pelanggaran dulu
      if (STATUS_PELANGGARAN.includes(status)) {
        const kategori = status === 'TERLAMBAT'
          ? kategoriTerlambat[0]
          : kategoriAlpha[0]

        if (kategori) {
          const { data: logData, error: logError } = await supabase
            .from('log_pelanggaran')
            .insert({
              siswa_id:             siswa.id,
              kategori_id:          kategori.id,
              nama_siswa_denorm:    siswa.nama_siswa,
              kelas_denorm:         siswa.kelas,
              waktu_kejadian:       new Date().toISOString(),
              pencatat_id:          pencatat?.id ?? null,            // ✅
              nama_pencatat_denorm: pencatat?.nama ?? 'Sistem Absensi', // ✅
              peran_pencatat:       pencatat?.peran ?? 'ADMIN',      // ✅
              dari_absensi:         true,
              keterangan_tambahan:  `Otomatis dari absensi: ${status}`,
            })
            .select('id')
            .single()

          if (logError) throw new Error(logError.message)
          logPelanggaranId = logData?.id ?? null
        }
      }

      // Insert absensi
      const { data: absenData, error: absenError } = await supabase
        .from('absensi')
        .insert({
          siswa_id:            siswa.id,
          tanggal:             tanggalHariIni,
          status:              status,
          log_pelanggaran_id:  logPelanggaranId,
          pencatat_id:         pencatat?.id ?? null,   // ✅
        })
        .select(`
          id, siswa_id, tanggal, status, log_pelanggaran_id, created_at,
          siswa ( nama_siswa, kelas, nis )
        `)
        .single()

      if (absenError) throw new Error(absenError.message)

      setAbsensiList(prev => [absenData as AbsensiItem, ...prev])
      showToast('success',
        `${siswa.nama_siswa} dicatat ${status}${STATUS_PELANGGARAN.includes(status) ? ' + pelanggaran otomatis' : ''}.`
      )
    } catch (err: unknown) {
      showToast('error', `Gagal: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  // ── Override status (misal ALPHA → SAKIT/IZIN) ───────────────────────────────
  const handleOverride = async (absensi: AbsensiItem, statusBaru: StatusKehadiran) => {
    setLoading(`override-${absensi.id}`)

    try {
      // Hapus log pelanggaran jika ada dan status baru bukan pelanggaran
      if (absensi.log_pelanggaran_id && !STATUS_PELANGGARAN.includes(statusBaru)) {
        await supabase
          .from('log_pelanggaran')
          .delete()
          .eq('id', absensi.log_pelanggaran_id)
      }

      const { error } = await supabase
        .from('absensi')
        .update({
          status:             statusBaru,
          log_pelanggaran_id: STATUS_PELANGGARAN.includes(statusBaru)
            ? absensi.log_pelanggaran_id
            : null,
        })
        .eq('id', absensi.id)

      if (error) throw new Error(error.message)

      setAbsensiList(prev => prev.map(a =>
        a.id === absensi.id
          ? { ...a, status: statusBaru, log_pelanggaran_id: STATUS_PELANGGARAN.includes(statusBaru) ? a.log_pelanggaran_id : null }
          : a
      ))
      showToast('success', `Status diubah ke ${statusBaru}.`)
    } catch (err: unknown) {
      showToast('error', `Gagal: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(null)
    }
  }

  // Statistik
  const stats = useMemo(() => {
    const total = absensiList.length
    return {
      hadir:     absensiList.filter(a => a.status === 'HADIR').length,
      terlambat: absensiList.filter(a => a.status === 'TERLAMBAT').length,
      izin:      absensiList.filter(a => a.status === 'IZIN').length,
      sakit:     absensiList.filter(a => a.status === 'SAKIT').length,
      alpha:     absensiList.filter(a => a.status === 'ALPHA').length,
      belum:     belumAbsen.length,
      total,
    }
  }, [absensiList, belumAbsen])

  const tanggalFormatted = new Date(tanggalHariIni).toLocaleDateString('id-ID', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })

  return (
    <div className="p-6 space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow
          ${toast.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Absensi Harian</h2>
            <p className="text-xs text-gray-400">{tanggalFormatted}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Users className="w-4 h-4" />
          {stats.belum > 0 && (
            <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg font-medium">
              {stats.belum} belum absen
            </span>
          )}
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[
          { label: 'Hadir',     val: stats.hadir,     color: 'bg-green-50 text-green-700' },
          { label: 'Terlambat', val: stats.terlambat, color: 'bg-orange-50 text-orange-700' },
          { label: 'Izin',      val: stats.izin,      color: 'bg-blue-50 text-blue-700' },
          { label: 'Sakit',     val: stats.sakit,     color: 'bg-purple-50 text-purple-700' },
          { label: 'Alpha',     val: stats.alpha,     color: 'bg-red-50 text-red-700' },
          { label: 'Belum',     val: stats.belum,     color: 'bg-gray-50 text-gray-600' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
            <p className="text-2xl font-bold">{s.val}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Siswa Belum Absen */}
      {belumAbsen.length > 0 && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-red-50 border-b border-red-100">
            <h3 className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Siswa Belum Absen ({belumAbsen.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {belumAbsen
              .filter(s => !filterKelas || s.kelas === filterKelas)
              .map(siswa => (
                <div key={siswa.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{siswa.nama_siswa}</p>
                    <p className="text-xs text-gray-400">{siswa.kelas} · {siswa.nis}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {(['HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT', 'ALPHA'] as StatusKehadiran[]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleInputAbsensi(siswa, st)}
                        disabled={loading === `${siswa.id}-${st}`}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition disabled:opacity-50
                          ${STATUS_CONFIG[st].badge} border hover:opacity-80`}
                      >
                        {loading === `${siswa.id}-${st}`
                          ? <Loader2 className="w-3 h-3 animate-spin inline" />
                          : STATUS_CONFIG[st].label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Log Absensi Hari Ini */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-blue-500" />
            Log Absensi Hari Ini
          </h3>
        </div>

        {/* Filter */}
        <div className="px-5 py-3 border-b border-gray-50 flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterKelas}
            onChange={e => setFilterKelas(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as StatusKehadiran | '')}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            {(Object.keys(STATUS_CONFIG) as StatusKehadiran[]).map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>

        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {filteredAbsensi.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <CalendarCheck className="w-8 h-8 mb-2 text-gray-200" />
              <p className="text-sm text-gray-500">Belum ada data absensi hari ini</p>
            </div>
          ) : (
            filteredAbsensi.map(absensi => (
              <div key={absensi.id}
                className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
                    ${STATUS_CONFIG[absensi.status].badge}`}>
                    {STATUS_CONFIG[absensi.status].icon}
                    {STATUS_CONFIG[absensi.status].label}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {absensi.siswa?.nama_siswa ?? '-'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {absensi.siswa?.kelas} · {absensi.siswa?.nis}
                      {absensi.log_pelanggaran_id && (
                        <span className="ml-2 text-orange-500">⚠ ada pelanggaran</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Override status */}
                <select
                  value={absensi.status}
                  onChange={e => handleOverride(absensi, e.target.value as StatusKehadiran)}
                  disabled={loading === `override-${absensi.id}`}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {(Object.keys(STATUS_CONFIG) as StatusKehadiran[]).map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
