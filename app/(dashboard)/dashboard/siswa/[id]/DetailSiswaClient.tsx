'use client'

import { useState, useMemo } from 'react'
import { Search, AlertTriangle, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LogPelanggaranDetail } from './page'

const PAGE_SIZE = 10

const BADGE: Record<string, string> = {
  RINGAN: 'bg-blue-100 text-blue-700',
  SEDANG: 'bg-orange-100 text-orange-700',
  BERAT:  'bg-red-100 text-red-700',
}

export default function DetailSiswaClient({
  log,
  totalPoin,
}: {
  log: LogPelanggaranDetail[]
  totalPoin: number
}) {
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState<'SEMUA'|'RINGAN'|'SEDANG'|'BERAT'>('SEMUA')
  const [page,     setPage]     = useState(1)

  const filtered = useMemo(() => {
    let r = log
    if (filter !== 'SEMUA') r = r.filter((l) => l.kategori_pelanggaran?.kategori === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter((l) =>
        l.kategori_pelanggaran?.nama_pelanggaran.toLowerCase().includes(q) ||
        l.keterangan_tambahan?.toLowerCase().includes(q) ||
        l.nama_pencatat_denorm?.toLowerCase().includes(q)
      )
    }
    return r
  }, [log, search, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Riwayat Pelanggaran</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {filtered.length} dari {log.length} catatan · Total {totalPoin} poin
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pelanggaran..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-slate-50 w-48 placeholder:text-slate-400"
            />
          </div>
          {/* Filter tingkat */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
            {(['SEMUA','RINGAN','SEDANG','BERAT'] as const).map((k) => (
              <button
                key={k}
                onClick={() => { setFilter(k); setPage(1) }}
                className={`px-3 py-2 transition-colors ${
                  filter === k ? 'bg-blue-600 text-white font-medium' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {k === 'SEMUA' ? 'Semua' : k.charAt(0) + k.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel atau empty state */}
      {paginated.length === 0 ? (
        <div className="py-16 text-center">
          <AlertTriangle size={28} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">
            {log.length === 0 ? 'Belum ada catatan pelanggaran' : 'Tidak ada hasil'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">Waktu</th>
                  <th className="text-left px-4 py-3">Pelanggaran</th>
                  <th className="text-center px-4 py-3">Tingkat</th>
                  <th className="text-center px-4 py-3">Poin</th>
                  <th className="text-left px-4 py-3">Pencatat</th>
                  <th className="text-left px-5 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map((item, idx) => {
                  const kat   = item.kategori_pelanggaran
                  const tgl   = new Date(item.waktu_kejadian)
                  return (
                    <tr key={item.id} className={`hover:bg-blue-50/40 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-1.5">
                          <Clock size={12} className="text-slate-300 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-700 text-xs">
                              {tgl.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {tgl.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        {item.dari_absensi && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                            <BookOpen size={9} /> Absensi
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="font-medium text-slate-700 leading-snug line-clamp-2 text-xs">
                          {kat?.nama_pelanggaran ?? '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {kat ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE[kat.kategori]}`}>
                            {kat.kategori.charAt(0) + kat.kategori.slice(1).toLowerCase()}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`font-bold ${
                          (kat?.poin ?? 0) >= 10 ? 'text-red-600' :
                          (kat?.poin ?? 0) >= 5  ? 'text-orange-500' : 'text-slate-600'
                        }`}>
                          {kat?.poin ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-500 text-xs">{item.nama_pencatat_denorm ?? '—'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-400 text-xs max-w-[160px] line-clamp-2">
                          {item.keterangan_tambahan ?? <span className="italic">—</span>}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <p className="text-slate-400">
                {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} dari {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <PBtn onClick={() => setPage(p => p-1)} disabled={page===1}><ChevronLeft size={14}/></PBtn>
                {Array.from({length: totalPages}, (_,i) => i+1)
                  .filter(p => p===1 || p===totalPages || Math.abs(p-page)<=1)
                  .reduce<(number|'...')[]>((acc,p,i,arr) => {
                    if (i>0 && (p as number)-(arr[i-1] as number)>1) acc.push('...')
                    acc.push(p); return acc
                  },[])
                  .map((p,i) => p==='...'
                    ? <span key={`d${i}`} className="px-1 text-slate-300">…</span>
                    : <PBtn key={p} onClick={() => setPage(p as number)} active={p===page}>{p}</PBtn>
                  )}
                <PBtn onClick={() => setPage(p => p+1)} disabled={page===totalPages}><ChevronRight size={14}/></PBtn>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function PBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled} className={`
      min-w-[28px] h-7 px-1.5 rounded text-xs font-medium transition-colors
      ${active ? 'bg-blue-600 text-white' : disabled ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}
    `}>{children}</button>
  )
}
