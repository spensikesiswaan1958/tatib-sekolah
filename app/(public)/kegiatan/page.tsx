import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kegiatan Sekolah',
}

function formatTanggal(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

async function getKegiatan() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('konten_kegiatan')
    .select('id, judul, ringkasan, tanggal, thumbnail_url, lokasi, kategori')
    .order('tanggal', { ascending: false })
  return data ?? []
}

export default async function KegiatanPage() {
  const kegiatan = await getKegiatan()

  // Pisahkan mendatang vs selesai
  const today = new Date().toISOString().split('T')[0]
  const mendatang = kegiatan.filter((k) => k.tanggal && k.tanggal >= today)
  const selesai = kegiatan.filter((k) => !k.tanggal || k.tanggal < today)

  return (
    <div className="pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2a5298] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#E8A020] text-xs font-semibold uppercase tracking-widest mb-3">
            Agenda
          </p>
          <h1
            className="text-white font-bold"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            }}
          >
            Kegiatan Sekolah
          </h1>
          <p className="text-white/70 mt-3 text-sm">
            Jadwal dan dokumentasi kegiatan SMPN 1 Wlingi
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-14">
        {kegiatan.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Belum ada kegiatan.</p>
          </div>
        )}

        {/* Kegiatan Mendatang */}
        {mendatang.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#1B3A6B]/10 text-[#1B3A6B] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2
                className="text-[#1B3A6B] font-bold"
                style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.25rem' }}
              >
                Akan Datang
              </h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-4">
              {mendatang.map((item) => (
                <KegiatanRow key={item.id} item={item} isUpcoming />
              ))}
            </div>
          </section>
        )}

        {/* Kegiatan Selesai */}
        {selesai.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#1B3A6B]/10 text-[#1B3A6B] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2
                className="text-[#1B3A6B] font-bold"
                style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.25rem' }}
              >
                Selesai
              </h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selesai.map((item) => (
                <KegiatanCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// ─── Row layout untuk kegiatan mendatang ──────────────────────────────────────
function KegiatanRow({
  item,
  isUpcoming,
}: {
  item: {
    id: string
    judul: string
    ringkasan: string | null
    tanggal: string | null
    thumbnail_url: string | null
    lokasi: string | null
    kategori: string | null
  }
  isUpcoming?: boolean
}) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row">
      <div className="relative sm:w-40 h-36 sm:h-auto bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] flex-shrink-0">
        {item.thumbnail_url ? (
          <Image src={item.thumbnail_url} alt={item.judul} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-white/20" />
          </div>
        )}
      </div>
      <div className="p-5 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {isUpcoming && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Akan Datang
            </span>
          )}
          {item.kategori && (
            <span className="bg-[#E8A020]/15 text-[#E8A020] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {item.kategori}
            </span>
          )}
        </div>
        <h3
          className="font-bold text-[#1B3A6B] mb-1"
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          {item.judul}
        </h3>
        {item.tanggal && (
          <p className="text-xs text-[#E8A020] font-medium mb-1 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {new Date(item.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        )}
        {item.lokasi && (
          <p className="text-xs text-gray-500 mb-2">📍 {item.lokasi}</p>
        )}
        {item.ringkasan && (
          <p className="text-sm text-gray-500 line-clamp-2">{item.ringkasan}</p>
        )}
      </div>
    </div>
  )
}

// ─── Card layout untuk kegiatan selesai ──────────────────────────────────────
function KegiatanCard({
  item,
}: {
  item: {
    id: string
    judul: string
    ringkasan: string | null
    tanggal: string | null
    thumbnail_url: string | null
    lokasi: string | null
    kategori: string | null
  }
}) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col">
      <div className="relative h-44 bg-gradient-to-br from-[#1B3A6B] to-[#2a5298]">
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={item.judul}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-white/20" />
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        {item.tanggal && (
          <p className="text-xs text-[#E8A020] font-medium mb-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(item.tanggal).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        )}
        <h3 className="font-semibold text-sm text-[#2D2D2D] line-clamp-2 flex-1">
          {item.judul}
        </h3>
        {item.ringkasan && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.ringkasan}</p>
        )}
      </div>
    </div>
  )
}
