import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, ChevronRight, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Informasi & Pengumuman',
}

function formatTanggal(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

async function getInformasi() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('konten_informasi')
    .select('id, judul, slug, ringkasan, created_at, thumbnail_url, kategori')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function InformasiPage() {
  const informasi = await getInformasi()

  return (
    <div className="pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2a5298] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#E8A020] text-xs font-semibold uppercase tracking-widest mb-3">
            Terkini
          </p>
          <h1
            className="text-white font-bold"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            }}
          >
            Informasi &amp; Pengumuman
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14">
        {informasi.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Belum ada informasi.</p>
            <p className="text-sm mt-1">Silakan kunjungi kembali nanti.</p>
          </div>
        ) : (
          <>
            {/* Featured: item pertama */}
            <Link
              href={`/informasi/${informasi[0].slug}`}
              className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 mb-8"
            >
              <div className="md:flex">
                <div className="relative md:w-2/5 h-56 md:h-auto bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] flex-shrink-0">
                  {informasi[0].thumbnail_url ? (
                    <Image
                      src={informasi[0].thumbnail_url}
                      alt={informasi[0].judul}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#E8A020] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                      ★ Terbaru
                    </span>
                  </div>
                </div>
                <div className="p-7 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatTanggal(informasi[0].created_at)}
                  </div>
                  <h2
                    className="text-[#1B3A6B] font-bold mb-3 group-hover:text-[#E8A020] transition-colors"
                    style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                    }}
                  >
                    {informasi[0].judul}
                  </h2>
                  {informasi[0].ringkasan && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {informasi[0].ringkasan}
                    </p>
                  )}
                  <div className="mt-5 inline-flex items-center gap-1.5 text-[#1B3A6B] text-sm font-semibold group-hover:text-[#E8A020] transition-colors">
                    Baca selengkapnya <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Grid sisanya */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {informasi.slice(1).map((item) => (
                <Link
                  key={item.id}
                  href={`/informasi/${item.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col"
                >
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
                        <BookOpen className="w-10 h-10 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                      <Calendar className="w-3 h-3" />
                      {formatTanggal(item.created_at)}
                    </div>
                    <h3 className="font-semibold text-sm text-[#2D2D2D] line-clamp-2 group-hover:text-[#1B3A6B] transition-colors flex-1">
                      {item.judul}
                    </h3>
                    {item.ringkasan && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.ringkasan}</p>
                    )}
                    <div className="mt-4 flex items-center text-[#1B3A6B] text-xs font-medium gap-1 group-hover:gap-2 transition-all">
                      Baca selengkapnya <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
