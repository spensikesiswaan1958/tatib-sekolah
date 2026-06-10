import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnimatedCounter from '@/components/public/AnimatedCounter'
import {
  ArrowRight,
  BookOpen,
  Trophy,
  Users,
  Calendar,
  ChevronRight,
  Star,
} from 'lucide-react'

// ─── Helper: format tanggal Indonesia ────────────────────────────────────────
function formatTanggal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Fetch data dari Supabase ─────────────────────────────────────────────────
async function getHomeData() {
  const supabase = await createClient()

  const [infoRes, kegiatanRes, siswaRes] = await Promise.all([
    supabase
      .from('konten_informasi')
      .select('id, judul, slug, ringkasan, created_at, thumbnail_url')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('konten_kegiatan')
      .select('id, judul, slug, ringkasan, tanggal, thumbnail_url')
      .order('tanggal', { ascending: false })
      .limit(3),
    supabase
      .from('siswa')
      .select('id', { count: 'exact', head: true })
      .eq('is_aktif', true),
  ])

  return {
    informasi: infoRes.data ?? [],
    kegiatan: kegiatanRes.data ?? [],
    totalSiswa: siswaRes.count ?? 0,
  }
}

// ─── Komponen kartu informasi ─────────────────────────────────────────────────
function InfoCard({
  item,
}: {
  item: {
    id: string
    judul: string
    slug: string
    ringkasan: string | null
    created_at: string
    thumbnail_url: string | null
  }
}) {
  return (
    <Link
      href={`/informasi/${item.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col"
    >
      <div className="relative h-44 bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] overflow-hidden">
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={item.judul}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-[#E8A020] text-white text-xs font-semibold px-3 py-1 rounded-full">
            Informasi
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-xs text-gray-400 mb-2">{formatTanggal(item.created_at)}</p>
        <h3 className="font-semibold text-[#2D2D2D] text-sm leading-snug line-clamp-2 group-hover:text-[#1B3A6B] transition-colors flex-1">
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
  )
}

// ─── Komponen kartu kegiatan ──────────────────────────────────────────────────
function KegiatanCard({
  item,
}: {
  item: {
    id: string
    judul: string
    slug: string
    ringkasan: string | null
    tanggal: string | null
    thumbnail_url: string | null
  }
}) {
  return (
    <Link
      href={`/kegiatan`}
      className="group flex gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100"
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#1B3A6B] to-[#2a5298]">
        {item.thumbnail_url ? (
          <Image
            src={item.thumbnail_url}
            alt={item.judul}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-white/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-[#2D2D2D] line-clamp-2 group-hover:text-[#1B3A6B] transition-colors">
          {item.judul}
        </h3>
        {item.tanggal && (
          <p className="text-xs text-[#E8A020] font-medium mt-1">
            {formatTanggal(item.tanggal)}
          </p>
        )}
        {item.ringkasan && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.ringkasan}</p>
        )}
      </div>
    </Link>
  )
}

// ─── PAGE UTAMA ───────────────────────────────────────────────────────────────
export default async function HomePage() {
  const { informasi, kegiatan, totalSiswa } = await getHomeData()

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background JPG */}
        <Image
          src="/images/hero-bg.jpg"
          alt="SMPN 1 Wlingi"
          fill
          priority
          className="object-cover"
          quality={85}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B3A6B]/80 via-[#1B3A6B]/60 to-[#1B3A6B]/90" />
        {/* Noise texture subtle */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-[#E8A020]/20 border border-[#E8A020]/40 text-[#E8A020] text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-current" />
            Sekolah Unggulan Kabupaten Blitar
          </div>

          {/* Headline utama */}
          <h1
            className="text-white font-bold leading-tight mb-6"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}
          >
            SMP Negeri 1{' '}
            <span className="text-[#E8A020] italic">Wlingi</span>
          </h1>

          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Mewujudkan generasi yang cerdas, berkarakter mulia, dan berdaya
            saing — berlandaskan ilmu, iman, dan semangat kebangsaan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/profil"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E8A020] hover:bg-[#d4911c] text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-[#E8A020]/30 hover:-translate-y-0.5"
            >
              Profil Sekolah <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/informasi"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              Lihat Informasi
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── STATISTIK ─────────────────────────────────────────────────── */}
      <section className="bg-[#1B3A6B] py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                value: totalSiswa || 500,
                suffix: '+',
                label: 'Siswa Aktif',
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                value: 40,
                suffix: '+',
                label: 'Tenaga Pengajar',
              },
              {
                icon: <Trophy className="w-6 h-6" />,
                value: 120,
                suffix: '+',
                label: 'Prestasi & Penghargaan',
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                value: 35,
                suffix: ' Thn',
                label: 'Berdiri Sejak 1989',
              },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-[#E8A020] mb-3">
                  {stat.icon}
                </div>
                <div
                  className="text-white font-bold mb-1"
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  }}
                >
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/60 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INFORMASI TERBARU ──────────────────────────────────────────── */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#E8A020] text-xs font-semibold uppercase tracking-widest mb-2">
              Terbaru
            </p>
            <h2
              className="text-[#1B3A6B] font-bold"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              }}
            >
              Informasi &amp; Pengumuman
            </h2>
          </div>
          <Link
            href="/informasi"
            className="hidden sm:flex items-center gap-1.5 text-[#1B3A6B] text-sm font-semibold hover:text-[#E8A020] transition-colors group"
          >
            Lihat semua{' '}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {informasi.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {informasi.map((item) => (
              <InfoCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Belum ada informasi yang dipublikasikan.</p>
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/informasi"
            className="inline-flex items-center gap-1.5 text-[#1B3A6B] text-sm font-semibold"
          >
            Lihat semua informasi <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── KEGIATAN TERBARU ───────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#E8A020] text-xs font-semibold uppercase tracking-widest mb-2">
                Agenda
              </p>
              <h2
                className="text-[#1B3A6B] font-bold"
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                }}
              >
                Kegiatan Sekolah
              </h2>
            </div>
            <Link
              href="/kegiatan"
              className="hidden sm:flex items-center gap-1.5 text-[#1B3A6B] text-sm font-semibold hover:text-[#E8A020] transition-colors group"
            >
              Lihat semua{' '}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {kegiatan.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kegiatan.map((item) => (
                <KegiatanCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Belum ada kegiatan yang dicatat.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-r from-[#1B3A6B] to-[#2a5298]">
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#E8A020]/10" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2
            className="text-white font-bold mb-4"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            }}
          >
            Bergabunglah Bersama Kami
          </h2>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
            Daftarkan putra-putri Anda di SMPN 1 Wlingi dan wujudkan
            masa depan yang cerah bersama kami.
          </p>
          <Link
            href="/profil"
            className="inline-flex items-center gap-2 bg-[#E8A020] hover:bg-[#d4911c] text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-[#E8A020]/40 hover:-translate-y-0.5"
          >
            Pelajari Lebih Lanjut <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
