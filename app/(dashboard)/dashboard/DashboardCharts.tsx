'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

// ─── Types ────────────────────────────────────────────────────────────────────

type MonthlyItem = {
  bulan: string
  total: number
  poin: number
}

type DistribusiItem = {
  name: string
  value: number
  color: string
}

type TopSiswaItem = {
  nama: string
  poin: number
  count: number
}

interface DashboardChartsProps {
  monthlyData: MonthlyItem[]
  distribusiData: DistribusiItem[]
  topSiswa: TopSiswaItem[]
}

// ─── Custom Tooltip Bar Chart ─────────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-blue-600">
        {payload[0]?.value} pelanggaran
      </p>
      <p className="text-orange-500">
        {payload[1]?.value} poin akumulasi
      </p>
    </div>
  )
}

// ─── Custom Tooltip Pie Chart ─────────────────────────────────────────────────

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700">{payload[0]?.name}</p>
      <p style={{ color: payload[0]?.payload?.color }}>
        {payload[0]?.value} catatan
      </p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardCharts({
  monthlyData,
  distribusiData,
  topSiswa,
}: DashboardChartsProps) {

  const totalDistribusi = distribusiData.reduce((s, d) => s + d.value, 0)
  const maxPoin = topSiswa[0]?.poin ?? 1

  return (
    <div className="space-y-4">

      {/* ── Baris 1: Bar Chart + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar Chart: Pelanggaran 6 Bulan */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Tren Pelanggaran 6 Bulan Terakhir
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Jumlah catatan dan akumulasi poin per bulan
            </p>
          </div>

          {monthlyData.every(d => d.total === 0) ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-slate-300 text-sm">Belum ada data pelanggaran</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="bulan"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Pelanggaran" />
                <Bar dataKey="poin"  fill="#fed7aa" radius={[4, 4, 0, 0]} name="Poin" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Legend manual */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-xs text-slate-400">Jumlah Catatan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-orange-200" />
              <span className="text-xs text-slate-400">Akumulasi Poin</span>
            </div>
          </div>
        </div>

        {/* Donut Chart: Distribusi Tingkat */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Distribusi Tingkat Pelanggaran
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proporsi Ringan / Sedang / Berat
            </p>
          </div>

          {totalDistribusi === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-slate-300 text-sm">Belum ada data</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={distribusiData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distribusiData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="space-y-2 mt-2">
                {distribusiData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-slate-600">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-700">{d.value}</span>
                      <span className="text-xs text-slate-400">
                        ({totalDistribusi > 0 ? Math.round((d.value / totalDistribusi) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>

      {/* ── Baris 2: Top Siswa ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Top 5 Siswa Poin Tertinggi
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Berdasarkan akumulasi poin 6 bulan terakhir
          </p>
        </div>

        {topSiswa.length === 0 ? (
          <p className="text-slate-300 text-sm text-center py-6">Belum ada data pelanggaran</p>
        ) : (
          <div className="space-y-3">
            {topSiswa.map((s, idx) => {
              const pct = Math.round((s.poin / maxPoin) * 100)
              const barColor =
                s.poin >= 80 ? 'bg-red-500' :
                s.poin >= 60 ? 'bg-orange-500' :
                s.poin >= 40 ? 'bg-yellow-500' : 'bg-blue-400'
              const medal = ['🥇','🥈','🥉','4️⃣','5️⃣'][idx]
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center flex-shrink-0">{medal}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-700 truncate">{s.nama}</p>
                      <p className="text-xs font-bold text-slate-600 flex-shrink-0 ml-2">
                        {s.poin} poin
                      </p>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.count} catatan pelanggaran</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
