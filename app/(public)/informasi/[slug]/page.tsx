import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Calendar, User } from 'lucide-react'

type Props = { params: Promise<{ slug: string }> }

async function getArtikel(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('konten_informasi')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const artikel = await getArtikel(slug)
  return {
    title: artikel?.judul ?? 'Informasi',
    description: artikel?.ringkasan ?? '',
  }
}

export default async function DetailInformasiPage({ params }: Props) {
  const { slug } = await params
  const artikel = await getArtikel(slug)

  if (!artikel) notFound()

  const tanggal = new Date(artikel.created_at).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="pt-20">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-4 pt-8 mb-6">
        <Link
          href="/informasi"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B3A6B] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Informasi
        </Link>
      </div>

      <article className="max-w-3xl mx-auto px-4 pb-20">
        {/* Header artikel */}
        <header className="mb-8">
          {artikel.kategori && (
            <span className="inline-block bg-[#E8A020]/15 text-[#E8A020] text-xs font-semibold px-3 py-1 rounded-full mb-4">
              {artikel.kategori}
            </span>
          )}
          <h1
            className="text-[#1B3A6B] font-bold leading-tight mb-4"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            }}
          >
            {artikel.judul}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {tanggal}
            </span>
            {artikel.penulis && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {artikel.penulis}
              </span>
            )}
          </div>
        </header>

        {/* Thumbnail */}
        {artikel.thumbnail_url && (
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 bg-gray-100">
            <Image
              src={artikel.thumbnail_url}
              alt={artikel.judul}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Ringkasan (lead) */}
        {artikel.ringkasan && (
          <p
            className="text-[#2D2D2D] leading-relaxed mb-6 font-medium border-l-4 border-[#E8A020] pl-5 py-2 bg-[#E8A020]/5 rounded-r-lg text-sm sm:text-base"
          >
            {artikel.ringkasan}
          </p>
        )}

        {/* Konten utama */}
        {artikel.konten && (
          <div
            className="prose prose-sm sm:prose max-w-none text-[#2D2D2D]
              prose-headings:text-[#1B3A6B] prose-headings:font-bold
              prose-a:text-[#1B3A6B] prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-md
              prose-blockquote:border-[#E8A020] prose-blockquote:bg-[#E8A020]/5
              prose-strong:text-[#1B3A6B]"
            dangerouslySetInnerHTML={{ __html: artikel.konten }}
          />
        )}
      </article>
    </div>
  )
}
