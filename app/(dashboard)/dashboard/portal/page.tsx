import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireSiswa } from '@/lib/rbac-server'
import {
  User,
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  ArrowLeft,
  TrendingUp,
  FileText,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

// ─── Ambang sanksi dari DB ─────────────────────────────────────────────────────
const SANKSI_DEFAULT = [
  { poin: 40, label: 'SP1 — Surat Peringatan Pertama' },
  { poin: 60, label: 'SP2 — Surat Peringatan Kedua' },
  { poin: 80, label: 'SP3 — Surat Peringatan Ketiga disertai Pemanggilan Orang Tua' },
  { poin: 100, label: 'Sidang Kesiswaan — dapat berakibat dikembalikan kepada orang tua atau dikeluarkan dari sekolah' },
]

function formatTanggal(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatWaktu(d: string) {
  return new Date(d).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function PortalSiswaPage() {
  const user = await requireSiswa()

  const supabase = await createClient()

  // ── Cari data siswa berdasarkan akun login ─────────────────────────────────
  // Asumsi: tabel `akun` punya kolom `siswa_id` yang link ke tabel `siswa`
  // ATAU cari via email/nis yang cocok
  const { data: akunDetail } = await supabase
    .from('akun')
    .select('siswa_id')
    .eq('id', user.id)
    .single()

  const siswaId = akunDetail?.siswa_id ?? null

  if (!siswaId) {
    // Akun siswa belum terhubung ke data siswa
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Akun Belum Terhubung
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Akun Anda belum terhubung ke data siswa. Silakan hubungi administrator
            sekolah untuk mengatur koneksi akun.
          </p>
        </div>
      </div>
    )
  }

  // ── Ambil semua data siswa ─────────────────────────────────────────────────
  const [siswaRes, pelanggaranRes, rewardRes, sanksiRes] = await Promise.all([
    supabase
      .from('siswa')
      .select('*')
      .eq('id', siswaId)
      .single(),
    supabase
      .from('log_pelanggaran')
      .select(`
        id, waktu_kejadian, keterangan_tambahan, created_at,
        kategori_pelanggaran (
          nama_pelanggaran, poin, kategori
        )
      `)
      .eq('siswa_id', siswaId)
      .order('waktu_kejadian', { ascending: false }),
    supabase
      .from('log_reward')
      .select(`
        id, tanggal_klaim, keterangan, status_verifikasi,
        master_reward (
          kondisi, pengurangan_poin
        )
      `)
      .eq('siswa_id', siswaId)
      .order('tanggal_klaim', { ascending: false }),
    supabase
      .from('ambang_batas_sanksi')
      .select('*')
      .order('poin_minimal', { ascending: true }),
  ])

  const siswa = siswaRes.data
  const pelanggaran = pelanggaranRes.data ?? []
  const rewards = rewardRes.data ?? []
  const sanksiList = sanksiRes.data ?? SANKSI_DEFAULT

  if (!siswa) redirect('/login')

  // ── Hitung total poin ──────────────────────────────────────────────────────
  const totalPoinPelanggaran = pelanggaran.reduce((acc, p) => {
    const src = Array.isArray(p.kategori_pelanggaran)
      ? p.kategori_pelanggaran[0]
      : p.kategori_pelanggaran
    return acc + (src?.poin ?? 0)
  }, 0)

  const totalPoinReward = rewards
    .filter((r) => r.status_verifikasi === 'DISETUJUI')
    .reduce((acc, r) => {
      const src = Array.isArray(r.master_reward) ? r.master_reward[0] : r.master_reward
      return acc + (src?.pengurangan_poin ?? 0)
    }, 0)

  const totalPoinAktif = Math.max(0, totalPoinPelanggaran - totalPoinReward)

  // ── Sanksi aktif ───────────────────────────────────────────────────────────
  const sanksiAktif = sanksiList
    .filter((s) => totalPoinAktif >= s.poin_minimal)
    .sort((a, b) => b.poin_minimal - a.poin_minimal)[0] ?? null

  // ── Ambang berikutnya ──────────────────────────────────────────────────────
  const ambangBerikutnya = sanksiList.find((s) => totalPoinAktif < s.poin_minimal) ?? null

  // ── Kategori warna ─────────────────────────────────────────────────────────
  function getPoinColor(poin: number) {
    if (poin === 0) return 'text-green-600'
    if (poin < 40) return 'text-blue-600'
    if (poin < 60) return 'text-yellow-600'
    if (poin < 80) return 'text-orange-600'
    return 'text-red-600'
  }

  function getKategoriStyle(kategori: string) {
    switch (kategori) {
      case 'RINGAN': return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      case 'SEDANG': return 'bg-orange-50 text-orange-700 border border-orange-200'
      case 'BERAT':  return 'bg-red-50 text-red-700 border border-red-200'
      default:       return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header Siswa ───────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{siswa.nama_siswa}</h1>
            <p className="text-white/75 text-sm">NIS: {siswa.nis}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              siswa.is_aktif
                ? 'bg-green-400/20 text-green-100 border border-green-400/30'
                : 'bg-red-400/20 text-red-100 border border-red-400/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${siswa.is_aktif ? 'bg-green-400' : 'bg-red-400'}`} />
              {siswa.is_aktif ? 'Aktif' : 'Tidak Aktif'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/20">
          <div>
            <p className="text-white/55 text-xs uppercase tracking-wider mb-1">Kelas</p>
            <p className="font-bold text-sm">
              📚 {siswa.kelas}
            </p>
          </div>
          <div>
            <p className="text-white/55 text-xs uppercase tracking-wider mb-1">Total Catatan</p>
            <p className="font-bold text-sm">{pelanggaran.length} catatan</p>
          </div>
          <div>
            <p className="text-white/55 text-xs uppercase tracking-wider mb-1">Terdaftar Sejak</p>
            <p className="font-bold text-sm">{formatTanggal(siswa.created_at)}</p>
          </div>
        </div>
      </div>

      {/* ── Poin + Sanksi ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Total Poin */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 text-sm">Total Poin Pelanggaran</h2>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-5xl font-bold ${getPoinColor(totalPoinAktif)}`}
              style={{ fontVariantNumeric: 'tabular-nums' }}>
              {totalPoinAktif}
            </span>
            <span className="text-gray-400 text-sm">poin</span>
          </div>
          {totalPoinReward > 0 && (
            <p className="text-xs text-green-600 font-medium mb-3">
              Sudah dikurangi reward: -{totalPoinReward} poin
            </p>
          )}

          {/* Progress bar ke ambang berikutnya */}
          {ambangBerikutnya && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Menuju: {ambangBerikutnya.sanksi ?? ambangBerikutnya.label}</span>
                <span>{totalPoinAktif}/{ambangBerikutnya.poin_minimal}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    totalPoinAktif < 40
                      ? 'bg-blue-400'
                      : totalPoinAktif < 60
                      ? 'bg-yellow-400'
                      : totalPoinAktif < 80
                      ? 'bg-orange-400'
                      : 'bg-red-400'
                  }`}
                  style={{
                    width: `${Math.min(100, (totalPoinAktif / ambangBerikutnya.poin_minimal) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Sanksi */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 text-sm">Status Sanksi</h2>
            <ShieldAlert className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2.5">
            {sanksiList.map((sanksi, i) => {
              const tercapai = totalPoinAktif >= sanksi.poin_minimal
              const isAktif = sanksiAktif?.poin_minimal === sanksi.poin_minimal
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg transition-colors ${
                    isAktif
                      ? 'bg-red-50 border border-red-200'
                      : tercapai
                      ? 'bg-orange-50'
                      : ''
                  }`}
                >
                  {isAktif ? (
                    <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  ) : tercapai ? (
                    <CheckCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${
                      isAktif ? 'text-red-700 font-semibold' : tercapai ? 'text-orange-700' : 'text-gray-400'
                    }`}>
                      {sanksi.sanksi ?? sanksi.label}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isAktif ? 'text-red-500' : 'text-gray-400'}`}>
                      ≥{sanksi.poin_minimal} poin
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Banner status */}
          <div className={`mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
            sanksiAktif
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {sanksiAktif ? (
              <>
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs">{sanksiAktif.sanksi ?? sanksiAktif.label}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Tidak ada sanksi aktif</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Riwayat Pelanggaran ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-gray-800 text-sm">Riwayat Pelanggaran</h2>
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
            {pelanggaran.length} catatan
          </span>
        </div>

        {pelanggaran.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <p className="font-semibold text-gray-600">Tidak ada riwayat pelanggaran</p>
            <p className="text-xs text-gray-400 mt-1">Siswa ini memiliki rekam jejak yang bersih</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pelanggaran.map((item) => {
              const kat = Array.isArray(item.kategori_pelanggaran)
                ? item.kategori_pelanggaran[0]
                : item.kategori_pelanggaran
              return (
                <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {kat?.nama_pelanggaran ?? '—'}
                        </p>
                        {kat?.kategori && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getKategoriStyle(kat.kategori)}`}>
                            {kat.kategori}
                          </span>
                        )}
                      </div>
                      {item.keterangan_tambahan && (
                        <p className="text-xs text-gray-500 mb-1">{item.keterangan_tambahan}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatWaktu(item.waktu_kejadian ?? item.created_at)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold text-red-600">
                        +{kat?.poin ?? 0}
                      </span>
                      <p className="text-[10px] text-gray-400">poin</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Riwayat Reward ──────────────────────────────────────────── */}
      {rewards.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <h2 className="font-semibold text-gray-800 text-sm">Reward Diterima</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {rewards.map((item) => {
              const rw = Array.isArray(item.master_reward) ? item.master_reward[0] : item.master_reward
              const statusStyle = ({
                DISETUJUI: 'bg-green-50 text-green-700 border-green-200',
                PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                DITOLAK: 'bg-red-50 text-red-700 border-red-200',
              } as Record<string, string>)[item.status_verifikasi] ?? 'bg-gray-50 text-gray-600'

              return (
                <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{rw?.kondisi ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTanggal(item.tanggal_klaim)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                        {item.status_verifikasi}
                      </span>
                      {item.status_verifikasi === 'DISETUJUI' && (
                        <span className="text-xs font-bold text-green-600">
                          -{rw?.pengurangan_poin ?? 0} poin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
