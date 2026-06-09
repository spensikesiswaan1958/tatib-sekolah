import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getDisplayName } from '@/lib/auth'
import Link from 'next/link'
import {
  Users, List, AlertTriangle, CalendarX, Plus, ArrowRight
} from 'lucide-react'
import DashboardCharts from './DashboardCharts'

// ─── Helper: proses data untuk chart ─────────────────────────────────────────

function processMonthly(log: any[]) {
  const months: Record<string, { bulan: string; total: number; poin: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    months[key] = { bulan: label, total: 0, poin: 0 }
  }
  log.forEach((item) => {
    const d   = new Date(item.waktu_kejadian)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (months[key]) {
      months[key].total++
      months[key].poin += item.kategori_pelanggaran?.poin ?? 0
    }
  })
  return Object.values(months)
}

function processDistribusi(log: any[]) {
  const dist = { RINGAN: 0, SEDANG: 0, BERAT: 0 }
  log.forEach((item) => {
    const k = item.kategori_pelanggaran?.kategori as keyof typeof dist
    if (k && k in dist) dist[k]++
  })
  return [
    { name: 'Ringan', value: dist.RINGAN, color: '#3b82f6' },
    { name: 'Sedang', value: dist.SEDANG, color: '#f97316' },
    { name: 'Berat',  value: dist.BERAT,  color: '#ef4444' },
  ]
}

function processTopSiswa(log: any[]) {
  const map: Record<string, { nama: string; poin: number; count: number }> = {}
  log.forEach((item) => {
    const sid = item.siswa_id
    if (!map[sid]) map[sid] = { nama: item.nama_siswa_denorm ?? '—', poin: 0, count: 0 }
    map[sid].poin  += item.kategori_pelanggaran?.poin ?? 0
    map[sid].count += 1
  })
  return Object.values(map)
    .sort((a, b) => b.poin - a.poin)
    .slice(0, 5)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase    = await createClient()
  const currentUser = await getCurrentUser()
  const namaUser    = currentUser ? getDisplayName(currentUser) : 'Pengguna'

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  sixMonthsAgo.setDate(1)

  // Fetch semua data paralel
  const [
    { count: totalSiswa },
    { count: totalKategori },
    { count: totalLog },
    { data: recentRaw },
    { data: chartRaw },
  ] = await Promise.all([
    supabase
      .from('siswa')
      .select('*', { count: 'exact', head: true })
      .eq('is_aktif', true),
    supabase
      .from('kategori_pelanggaran')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('log_pelanggaran')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('log_pelanggaran')
      .select(`
        id, waktu_kejadian, nama_siswa_denorm, kelas_denorm,
        kategori_pelanggaran ( nama_pelanggaran, poin, kategori )
      `)
      .order('waktu_kejadian', { ascending: false })
      .limit(5),
    supabase
      .from('log_pelanggaran')
      .select(`
        waktu_kejadian, siswa_id, nama_siswa_denorm,
        kategori_pelanggaran ( poin, kategori )
      `)
      .gte('waktu_kejadian', sixMonthsAgo.toISOString()),
  ])

  const monthlyData    = processMonthly(chartRaw ?? [])
  const distribusiData = processDistribusi(chartRaw ?? [])
  const topSiswa       = processTopSiswa(chartRaw ?? [])
  const recentLog      = (recentRaw ?? []) as any[]

  const BADGE: Record<string, string> = {
    RINGAN: 'bg-blue-100 text-blue-700',
    SEDANG: 'bg-orange-100 text-orange-700',
    BERAT:  'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-5">

      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-xl p-5 text-white shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold">Dashboard Tata Tertib Digital</h1>
            <p className="text-blue-100 text-sm mt-0.5">
              Selamat datang, <span className="font-semibold text-white">{namaUser}</span>
              {' '}— UPT SMP Negeri 1 Wlingi
            </p>
          </div>
          <Link
            href="/dashboard/pelanggaran/tambah"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Input Pelanggaran
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Siswa Aktif"
          value={totalSiswa ?? 0}
          suffix="siswa"
          icon={<Users size={20} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          href="/dashboard/siswa"
        />
        <StatCard
          label="Kategori Pelanggaran"
          value={totalKategori ?? 0}
          suffix="jenis"
          icon={<List size={20} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          href="/dashboard/pelanggaran/kategori"
        />
        <StatCard
          label="Total Log Pelanggaran"
          value={totalLog ?? 0}
          suffix="catatan"
          icon={<AlertTriangle size={20} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-500"
          valueColor={totalLog && totalLog > 0 ? 'text-orange-500' : undefined}
          href="/dashboard/pelanggaran/log"
        />
        <StatCard
          label="Pelanggaran Bulan Ini"
          value={monthlyData.at(-1)?.total ?? 0}
          suffix="catatan"
          icon={<CalendarX size={20} />}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          valueColor={monthlyData.at(-1)?.total ?? 0 > 0 ? 'text-red-500' : undefined}
          href="/dashboard/pelanggaran/log"
        />
      </div>

      {/* ── Charts (Client Component) ── */}
      <DashboardCharts
        monthlyData={monthlyData}
        distribusiData={distribusiData}
        topSiswa={topSiswa}
      />

      {/* ── Pelanggaran Terbaru ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Pelanggaran Terbaru</h2>
            <p className="text-xs text-slate-400 mt-0.5">5 catatan pelanggaran terakhir</p>
          </div>
          <Link
            href="/dashboard/pelanggaran/log"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Lihat semua <ArrowRight size={13} />
          </Link>
        </div>

        {recentLog.length === 0 ? (
          <div className="py-14 text-center">
            <AlertTriangle size={28} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium text-sm">Belum ada catatan pelanggaran</p>
            <p className="text-slate-300 text-xs mt-1">
              Data muncul otomatis setelah pelanggaran pertama dicatat.
            </p>
            <Link
              href="/dashboard/pelanggaran/tambah"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={13} /> Input Pelanggaran Pertama
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Siswa</th>
                  <th className="text-left px-4 py-3">Pelanggaran</th>
                  <th className="text-center px-4 py-3">Tingkat</th>
                  <th className="text-center px-4 py-3">Poin</th>
                  <th className="text-left px-5 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentLog.map((item: any) => {
                  const kat = item.kategori_pelanggaran
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-700 text-xs">{item.nama_siswa_denorm}</p>
                        <p className="text-slate-400 text-[10px]">{item.kelas_denorm}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600 max-w-[180px] line-clamp-2">
                          {kat?.nama_pelanggaran ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kat?.kategori && (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${BADGE[kat.kategori]}`}>
                            {kat.kategori.charAt(0) + kat.kategori.slice(1).toLowerCase()}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${
                          (kat?.poin ?? 0) >= 10 ? 'text-red-600' :
                          (kat?.poin ?? 0) >= 5  ? 'text-orange-500' : 'text-slate-600'
                        }`}>
                          {kat?.poin ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs text-slate-500">
                          {new Date(item.waktu_kejadian).toLocaleDateString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(item.waktu_kejadian).toLocaleTimeString('id-ID', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  label, value, suffix, icon, iconBg, iconColor, valueColor, href
}: {
  label: string
  value: number
  suffix: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  valueColor?: string
  href: string
}) {
  return (
    <Link href={href} className="group bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all block">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 ${iconBg} ${iconColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-400 transition-colors mt-1" />
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-black ${valueColor ?? 'text-slate-700'}`}>
          {value.toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{suffix}</p>
        <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
      </div>
    </Link>
  )
}