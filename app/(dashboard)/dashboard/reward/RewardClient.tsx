'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Gift, Search, CheckCircle2, XCircle,
  Clock, Loader2, ChevronDown, ChevronUp,
  BookOpen, ShieldAlert
} from 'lucide-react'

type MasterReward = {
  id: string
  kondisi: string
  pengurangan_poin: number
  periode: string
  verifikator_default: string
}

type LogReward = {
  id: string
  siswa_id: string
  reward_id: string
  tanggal_klaim: string
  keterangan: string | null
  status_verifikasi: 'PENDING' | 'DISETUJUI' | 'DITOLAK'
  catatan_verifikator: string | null
  created_at: string
  siswa: {
    nama_siswa: string
    kelas: string
    nis: string
  } | null
}

type Props = {
  masterReward: MasterReward[]
  logReward: LogReward[]
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  DISETUJUI: 'bg-green-100 text-green-700 border-green-200',
  DITOLAK:   'bg-red-100 text-red-700 border-red-200',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING:   <Clock className="w-3.5 h-3.5" />,
  DISETUJUI: <CheckCircle2 className="w-3.5 h-3.5" />,
  DITOLAK:   <XCircle className="w-3.5 h-3.5" />,
}

// Data aturan reward statis sesuai dokumen resmi
const ATURAN_REWARD = [
  { kode: 'R1', kondisi: 'Tidak ada pelanggaran selama 1 semester penuh',                              poin: 10, periode: 'Per Semester', verifikator: 'Wali Kelas' },
  { kode: 'R2', kondisi: 'Mewakili sekolah dalam lomba/kejuaraan',                                     poin: 3,  periode: 'Per Kegiatan', verifikator: 'Guru Pembimbing' },
  { kode: 'R3', kondisi: 'Menjadi pengurus OSIS aktif selama 1 semester',                              poin: 5,  periode: 'Per Semester', verifikator: 'Ketua OSIS + Pembina' },
  { kode: 'R4', kondisi: 'Mengikuti kegiatan sosial/bakti sekolah',                                    poin: 3,  periode: 'Per Kegiatan', verifikator: 'Panitia Kegiatan' },
  { kode: 'R5', kondisi: 'Berprestasi akademik (Ranking 3 besar) atau Non Akademik (Juara 1–3 Kab.)', poin: 10, periode: 'Per Semester', verifikator: 'Wali Kelas' },
  { kode: 'R6', kondisi: 'Melaporkan pelanggaran teman secara jujur dan bertanggung jawab',            poin: 3,  periode: 'Per Kejadian', verifikator: 'Guru BK / Kesiswaan' },
  { kode: 'R7', kondisi: 'Aktif membantu program kebersihan/penghijauan lingkungan sekolah',           poin: 3,  periode: 'Per Kegiatan', verifikator: 'Koordinator Kegiatan' },
]

const AMBANG_SANKSI = [
  { poin: 40,  label: 'SP1',                      color: 'bg-yellow-50 border-yellow-300 text-yellow-800' },
  { poin: 60,  label: 'SP2',                      color: 'bg-orange-50 border-orange-300 text-orange-800' },
  { poin: 80,  label: 'SP3 + Panggil Orang Tua',  color: 'bg-red-50 border-red-300 text-red-800' },
  { poin: 100, label: 'Sidang Kesiswaan',          color: 'bg-red-100 border-red-400 text-red-900' },
]

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

const ITEMS_PER_PAGE = 15

export default function RewardClient({ masterReward, logReward }: Props) {
  const supabase = createClient()

  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage]                 = useState(1)
  const [showAturan, setShowAturan]     = useState(false)
  const [showMaster, setShowMaster]     = useState(false)
  const [updating, setUpdating]         = useState<string | null>(null)
  const [toast, setToast]               = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [logs, setLogs]                 = useState<LogReward[]>(logReward)

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const q = search.toLowerCase()
      const matchSearch =
        (l.siswa?.nama_siswa ?? '').toLowerCase().includes(q) ||
        (l.siswa?.nis ?? '').toLowerCase().includes(q)
      const matchStatus = filterStatus ? l.status_verifikasi === filterStatus : true
      return matchSearch && matchStatus
    })
  }, [logs, search, filterStatus])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const pendingCount = logs.filter(l => l.status_verifikasi === 'PENDING').length

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const handleVerifikasi = async (
    id: string,
    status: 'DISETUJUI' | 'DITOLAK',
    catatan?: string
  ) => {
    setUpdating(id)
    const { error } = await supabase
      .from('log_reward')
      .update({ status_verifikasi: status, catatan_verifikator: catatan ?? null })
      .eq('id', id)

    if (error) {
      showToast('error', `Gagal: ${error.message}`)
    } else {
      setLogs(prev => prev.map(l =>
        l.id === id
          ? { ...l, status_verifikasi: status, catatan_verifikator: catatan ?? null }
          : l
      ))
      showToast('success', `Reward ${status === 'DISETUJUI' ? 'disetujui' : 'ditolak'}.`)
    }
    setUpdating(null)
  }

  // Cek kesesuaian master_reward dengan aturan resmi
  const kesesuaian = ATURAN_REWARD.map(aturan => {
    const match = masterReward.find(m =>
      m.pengurangan_poin === aturan.poin &&
      m.periode.toLowerCase().includes(aturan.periode.split(' ')[1].toLowerCase())
    )
    return { ...aturan, sesuai: !!match }
  })
  const jumlahSesuai = kesesuaian.filter(k => k.sesuai).length

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
          <Gift className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800">
            Reward Siswa
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                {pendingCount} pending
              </span>
            )}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAturan(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-purple-600 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition font-medium"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Aturan Reward
            {showAturan ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setShowMaster(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Master DB
            {showMaster ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Panel Aturan Reward Resmi */}
      {showAturan && (
        <div className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Sistem Reward — Pengurangan Poin (Dokumen Resmi)
            </h3>
            <p className="text-purple-200 text-xs mt-0.5">
              Catatan: Poin tidak bisa menjadi minus (batas bawah = 0)
            </p>
          </div>

          {/* Status kesesuaian database */}
          <div className={`px-6 py-3 border-b flex items-center gap-2 text-sm
            ${jumlahSesuai === ATURAN_REWARD.length
              ? 'bg-green-50 border-green-100 text-green-700'
              : 'bg-yellow-50 border-yellow-100 text-yellow-700'}`}>
            {jumlahSesuai === ATURAN_REWARD.length
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <ShieldAlert className="w-4 h-4 shrink-0" />}
            <span className="font-medium">
              {jumlahSesuai === ATURAN_REWARD.length
                ? 'Database sudah sesuai dengan semua aturan reward resmi.'
                : `${jumlahSesuai} dari ${ATURAN_REWARD.length} aturan cocok di database. Jalankan seed SQL untuk melengkapi.`}
            </span>
          </div>

          {/* Tabel Aturan */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 w-12">Kode</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Kondisi / Prestasi</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Pengurangan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Periode</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Verifikator</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status DB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {kesesuaian.map(r => (
                  <tr key={r.kode} className={r.sesuai ? 'bg-white' : 'bg-yellow-50'}>
                    <td className="px-4 py-3">
                      <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg text-xs">
                        {r.kode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.kondisi}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-green-600">-{r.poin} poin</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.periode}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.verifikator}</td>
                    <td className="px-4 py-3">
                      {r.sesuai ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          <CheckCircle2 className="w-3 h-3" /> Ada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                          <ShieldAlert className="w-3 h-3" /> Belum ada
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ambang Batas Sanksi */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              Ambang Batas Sanksi
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AMBANG_SANKSI.map(a => (
                <div key={a.poin} className={`px-3 py-2.5 rounded-xl border text-center ${a.color}`}>
                  <p className="text-xl font-bold">{a.poin}</p>
                  <p className="text-xs font-medium mt-0.5">{a.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Master DB (collapsible) */}
      {showMaster && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3">
            Data Master Reward di Database ({masterReward.length} entri)
          </p>
          {masterReward.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Belum ada data. Jalankan SQL seed di atas untuk mengisi.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {masterReward.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-purple-100 px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800">{r.kondisi}</p>
                    <span className="text-sm font-bold text-green-600 shrink-0">
                      -{r.pengurangan_poin} poin
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {r.periode} · {r.verifikator_default}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIS siswa..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="DISETUJUI">Disetujui</option>
          <option value="DITOLAK">Ditolak</option>
        </select>
      </div>

      {/* Tabel Log Reward */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 w-10">No</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Siswa</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Keterangan</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Tanggal</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center py-14 text-gray-400">
                    <Gift className="w-10 h-10 mb-3 text-gray-200" />
                    <p className="font-medium text-gray-500">Belum ada data reward</p>
                    <p className="text-xs mt-1">Data akan muncul setelah siswa mengklaim reward</p>
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
                    <p className="font-medium text-gray-800">{log.siswa?.nama_siswa ?? '-'}</p>
                    <p className="text-xs text-gray-400">{log.siswa?.kelas} · {log.siswa?.nis}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                    <p className="truncate">{log.keterangan ?? '-'}</p>
                    {log.catatan_verifikator && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        Catatan: {log.catatan_verifikator}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatTanggal(log.tanggal_klaim)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border
                      ${STATUS_BADGE[log.status_verifikasi]}`}>
                      {STATUS_ICON[log.status_verifikasi]}
                      {log.status_verifikasi}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {log.status_verifikasi === 'PENDING' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleVerifikasi(log.id, 'DISETUJUI')}
                          disabled={updating === log.id}
                          className="px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 text-xs rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1"
                        >
                          {updating === log.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <CheckCircle2 className="w-3 h-3" />}
                          Setujui
                        </button>
                        <button
                          onClick={() => handleVerifikasi(log.id, 'DITOLAK', 'Tidak memenuhi syarat')}
                          disabled={updating === log.id}
                          className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Tolak
                        </button>
                      </div>
                    )}
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
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">
              ← Sebelumnya
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">
              Berikutnya →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
