import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User, BookOpen, AlertTriangle,
  ShieldAlert, CheckCircle2, Clock
} from 'lucide-react'

type Kategori = 'RINGAN' | 'SEDANG' | 'BERAT'

type KategoriPelanggaran = {
  nama_pelanggaran: string
  poin: number
  kategori: Kategori
}

type AmbangBatas = {
  poin_minimal: number
  sanksi: string
}

type LogItem = {
  id: string
  waktu_kejadian: string
  keterangan_tambahan: string | null
  dari_absensi: boolean
  nama_pencatat_denorm: string | null
  kategori_pelanggaran: KategoriPelanggaran | null
}

export type LogPelanggaranDetail = LogItem

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeKategori(raw: any): KategoriPelanggaran | null {
  if (!raw) return null
  const src = Array.isArray(raw) ? raw[0] : raw
  if (!src) return null
  return {
    nama_pelanggaran: src.nama_pelanggaran ?? '',
    poin: src.poin ?? 0,
    kategori: src.kategori as Kategori,
  }
}

const BADGE: Record<Kategori, string> = {
  RINGAN: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  SEDANG: 'bg-orange-100 text-orange-700 border-orange-200',
  BERAT:  'bg-red-100 text-red-700 border-red-200',
}

const SANKSI_COLOR = (poin: number): string => {
  if (poin >= 100) return 'bg-red-600'
  if (poin >= 80)  return 'bg-red-500'
  if (poin >= 60)  return 'bg-orange-500'
  if (poin >= 40)  return 'bg-yellow-500'
  return 'bg-green-500'
}

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function getSanksiAktif(poin: number, ambang: AmbangBatas[]): AmbangBatas | null {
  return [...ambang].sort((a, b) => b.poin_minimal - a.poin_minimal)
    .find(a => poin >= a.poin_minimal) ?? null
}

function getSanksiBerikutnya(poin: number, ambang: AmbangBatas[]): AmbangBatas | null {
  return [...ambang].sort((a, b) => a.poin_minimal - b.poin_minimal)
    .find(a => a.poin_minimal > poin) ?? null
}

export default async function DetailSiswaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: siswa, error: errSiswa },
    { data: rawLogs },
    { data: ambang },
  ] = await Promise.all([
    supabase
      .from('siswa')
      .select('id, nis, nama_siswa, kelas, is_aktif, created_at')
      .eq('id', id)
      .single(),
    supabase
      .from('log_pelanggaran')
      .select(`
        id, waktu_kejadian, keterangan_tambahan,
        dari_absensi, nama_pencatat_denorm,
        kategori_pelanggaran ( nama_pelanggaran, poin, kategori )
      `)
      .eq('siswa_id', id)
      .order('waktu_kejadian', { ascending: false }),
    supabase
      .from('ambang_batas_sanksi')
      .select('poin_minimal, sanksi')
      .order('poin_minimal', { ascending: true }),
  ])

  if (errSiswa || !siswa) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logList: LogItem[] = (rawLogs ?? []).map((r: any) => ({
    id: r.id,
    waktu_kejadian: r.waktu_kejadian,
    keterangan_tambahan: r.keterangan_tambahan,
    dari_absensi: r.dari_absensi,
    nama_pencatat_denorm: r.nama_pencatat_denorm,
    kategori_pelanggaran: normalizeKategori(r.kategori_pelanggaran),
  }))

  const ambangList = (ambang ?? []) as AmbangBatas[]

  const totalPoin = logList.reduce((sum, l) =>
    sum + (l.kategori_pelanggaran?.poin ?? 0), 0)

  const sanksiAktif      = getSanksiAktif(totalPoin, ambangList)
  const sanksiBerikutnya = getSanksiBerikutnya(totalPoin, ambangList)
  const progressPersen   = sanksiBerikutnya
    ? Math.min(100, Math.round((totalPoin / sanksiBerikutnya.poin_minimal) * 100))
    : 100

  const distribusi = logList.reduce<Record<string, number>>((acc, l) => {
    const kat = l.kategori_pelanggaran?.kategori ?? 'LAINNYA'
    acc[kat] = (acc[kat] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">

      <Link href="/dashboard/siswa"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Data Siswa
      </Link>

      {/* Profil */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{siswa.nama_siswa}</h1>
              <p className="text-blue-100 text-sm mt-0.5">NIS: {siswa.nis}</p>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                ${siswa.is_aktif ? 'bg-green-400/20 text-green-100' : 'bg-gray-400/20 text-gray-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${siswa.is_aktif ? 'bg-green-300' : 'bg-gray-400'}`} />
                {siswa.is_aktif ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Kelas</p>
            <p className="font-semibold text-gray-800 mt-0.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" />{siswa.kelas}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total Pelanggaran</p>
            <p className="font-semibold text-gray-800 mt-0.5">{logList.length} catatan</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Terdaftar Sejak</p>
            <p className="font-semibold text-gray-800 mt-0.5">
              {new Date(siswa.created_at).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Poin & Sanksi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500 font-medium">Total Poin Pelanggaran</p>
          <div className="flex items-end gap-3 mt-2">
            <span className={`text-4xl font-bold
              ${totalPoin >= 80 ? 'text-red-600' : totalPoin >= 40 ? 'text-orange-500' : 'text-gray-800'}`}>
              {totalPoin}
            </span>
            <span className="text-gray-400 text-sm mb-1">poin</span>
          </div>
          {sanksiBerikutnya && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Menuju: {sanksiBerikutnya.sanksi.split('–')[0].trim()}</span>
                <span>{totalPoin}/{sanksiBerikutnya.poin_minimal}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${SANKSI_COLOR(totalPoin)}`}
                  style={{ width: `${progressPersen}%` }} />
              </div>
            </div>
          )}
          {logList.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {Object.entries(distribusi).map(([kat, count]) => (
                <span key={kat} className={`px-2 py-0.5 rounded-full text-xs font-medium border
                  ${BADGE[kat as Kategori] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {kat}: {count}x
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm text-gray-500 font-medium">Status Sanksi</p>
          <div className="mt-3 space-y-2">
            {ambangList.map((a) => {
              const tercapai = totalPoin >= a.poin_minimal
              const aktif    = sanksiAktif?.poin_minimal === a.poin_minimal
              return (
                <div key={a.poin_minimal}
                  className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-sm
                    ${aktif ? 'bg-red-50 border border-red-200'
                      : tercapai ? 'bg-orange-50 border border-orange-100'
                      : 'bg-gray-50 border border-gray-100'}`}>
                  {aktif
                    ? <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    : tercapai
                      ? <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      : <Clock className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />}
                  <div>
                    <span className={`font-medium
                      ${aktif ? 'text-red-700' : tercapai ? 'text-orange-600' : 'text-gray-400'}`}>
                      {a.sanksi.split('–')[0].trim()}
                    </span>
                    <span className={`ml-1.5 text-xs ${aktif ? 'text-red-500' : 'text-gray-400'}`}>
                      (≥{a.poin_minimal} poin)
                    </span>
                    {aktif && (
                      <span className="ml-1.5 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                        AKTIF
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
            {totalPoin === 0 && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700 font-medium">Tidak ada sanksi aktif</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Riwayat */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Riwayat Pelanggaran
          </h2>
          <Link href="/dashboard/pelanggaran/tambah"
            className="text-xs text-blue-600 hover:underline">
            + Input Pelanggaran
          </Link>
        </div>
        {logList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-gray-400">
            <CheckCircle2 className="w-10 h-10 mb-3 text-green-200" />
            <p className="font-medium text-gray-500">Tidak ada riwayat pelanggaran</p>
            <p className="text-xs mt-1">Siswa ini memiliki rekam jejak yang bersih</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logList.map((log, idx) => (
              <div key={log.id} className="px-6 py-4 flex gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-800 text-sm">
                      {log.kategori_pelanggaran?.nama_pelanggaran ?? 'Tidak diketahui'}
                    </p>
                    <span className="font-bold text-red-600 text-sm shrink-0">
                      +{log.kategori_pelanggaran?.poin ?? 0} poin
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {log.kategori_pelanggaran?.kategori && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border
                        ${BADGE[log.kategori_pelanggaran.kategori] ?? 'bg-gray-100 text-gray-500'}`}>
                        {log.kategori_pelanggaran.kategori}
                      </span>
                    )}
                    {log.dari_absensi && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100">
                        dari absensi
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatTanggal(log.waktu_kejadian)}
                    </span>
                  </div>
                  {log.keterangan_tambahan && (
                    <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 px-2 py-1.5 rounded-lg">
                      {log.keterangan_tambahan}
                    </p>
                  )}
                  {log.nama_pencatat_denorm && (
                    <p className="text-xs text-gray-400 mt-1">
                      Dicatat oleh: {log.nama_pencatat_denorm}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}