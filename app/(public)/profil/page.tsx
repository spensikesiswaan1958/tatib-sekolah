import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  BookOpen,
  Target,
  Eye,
  Award,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Profil Sekolah',
  description: 'Profil lengkap SMP Negeri 1 Wlingi — visi, misi, sejarah, dan struktur organisasi.',
}

async function getProfilData() {
  const supabase = await createClient()
  const [profilRes, strukturRes] = await Promise.all([
    supabase.from('profil_sekolah').select('*').limit(1).single(),
    supabase
      .from('struktur_organisasi')
      .select('*')
      .order('urutan', { ascending: true }),
  ])
  return {
    profil: profilRes.data,
    struktur: strukturRes.data ?? [],
  }
}

export default async function ProfilPage() {
  const { profil, struktur } = await getProfilData()

  // Data fallback jika tabel masih kosong
  const visi =
    profil?.visi ??
    'Terwujudnya generasi penerus bangsa yang beriman, berprestasi, berkarakter, dan berdaya saing global.'
  const misi: string[] = profil?.misi ?? [
    'Menyelenggarakan pendidikan berkualitas yang berpusat pada siswa.',
    'Menanamkan nilai-nilai keimanan dan budi pekerti luhur.',
    'Mengembangkan potensi akademik dan non-akademik siswa secara optimal.',
    'Membangun budaya sekolah yang bersih, tertib, dan kondusif.',
    'Menjalin kerjasama dengan orang tua, masyarakat, dan dunia usaha.',
  ]
  const namaSekolah = profil?.nama_sekolah ?? 'SMP Negeri 1 Wlingi'
  const alamat = profil?.alamat ?? 'Jl. Raya Wlingi, Kec. Wlingi, Kab. Blitar, Jawa Timur'
  const telepon = profil?.telepon ?? '(0342) 691XXX'
  const email = profil?.email ?? 'info@smpn1wlingi.sch.id'
  const website = profil?.website ?? 'www.smpn1wlingi.sch.id'

  return (
    <div className="pt-20">
      {/* ── PAGE HEADER ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2a5298] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#E8A020] text-xs font-semibold uppercase tracking-widest mb-3">
            Tentang Kami
          </p>
          <h1
            className="text-white font-bold"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            }}
          >
            Profil Sekolah
          </h1>
          <p className="text-white/70 mt-3 text-sm max-w-lg mx-auto">
            Mengenal lebih dekat {namaSekolah}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-14">
        {/* ── IDENTITAS SEKOLAH ─────────────────────────────────────── */}
        <section>
          <SectionLabel icon={<BookOpen className="w-4 h-4" />} label="Identitas Sekolah" />
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              <div className="p-6 space-y-4">
                <InfoRow label="Nama Sekolah" value={namaSekolah} />
                <InfoRow label="Status" value="Negeri" />
                <InfoRow label="Akreditasi" value={profil?.akreditasi ?? 'A (Unggul)'} />
                <InfoRow label="NPSN" value={profil?.npsn ?? '20517XXXX'} />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#E8A020] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Alamat</p>
                    <p className="text-sm text-[#2D2D2D] font-medium">{alamat}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#E8A020] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Telepon</p>
                    <p className="text-sm text-[#2D2D2D] font-medium">{telepon}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#E8A020] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <p className="text-sm text-[#2D2D2D] font-medium">{email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#E8A020] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Website</p>
                    <p className="text-sm text-[#2D2D2D] font-medium">{website}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VISI ──────────────────────────────────────────────────── */}
        <section>
          <SectionLabel icon={<Eye className="w-4 h-4" />} label="Visi" />
          <div className="mt-6 bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] rounded-2xl p-8 shadow-md">
            <p
              className="text-white text-center leading-relaxed"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              }}
            >
              &ldquo;{visi}&rdquo;
            </p>
          </div>
        </section>

        {/* ── MISI ──────────────────────────────────────────────────── */}
        <section>
          <SectionLabel icon={<Target className="w-4 h-4" />} label="Misi" />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Array.isArray(misi) ? misi : [misi]).map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex gap-4"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#E8A020]/15 text-[#E8A020] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-[#2D2D2D] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── STRUKTUR ORGANISASI ───────────────────────────────────── */}
        {struktur.length > 0 && (
          <section>
            <SectionLabel icon={<Award className="w-4 h-4" />} label="Struktur Organisasi" />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {struktur.map((org) => (
                <div
                  key={org.id}
                  className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1B3A6B]/10 mx-auto mb-3 flex items-center justify-center">
                    <span className="text-[#1B3A6B] font-bold text-sm">
                      {(org.nama as string)?.[0] ?? '?'}
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-[#2D2D2D]">{org.nama}</p>
                  <p className="text-xs text-[#E8A020] font-medium mt-1">{org.jabatan}</p>
                  {org.nip && (
                    <p className="text-xs text-gray-400 mt-0.5">NIP: {org.nip}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// ─── Sub-komponen ──────────────────────────────────────────────────────────────
function SectionLabel({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1B3A6B]/10 text-[#1B3A6B]">
        {icon}
      </div>
      <h2
        className="text-[#1B3A6B] font-bold"
        style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.25rem' }}
      >
        {label}
      </h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-[#2D2D2D] font-medium">{value}</p>
    </div>
  )
}
