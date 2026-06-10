import Link from 'next/link'
import { MapPin, Phone, Mail, GraduationCap } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-[#1B3A6B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Kolom 1 - Identitas */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E8A020] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-base">SMPN 1 WLINGI</p>
                <p className="text-white/60 text-xs">Kabupaten Blitar</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Mencetak generasi yang cerdas, berkarakter, dan berdaya saing
              global berlandaskan nilai-nilai Pancasila.
            </p>
          </div>

          {/* Kolom 2 - Navigasi */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#E8A020] mb-4">
              Navigasi
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Beranda' },
                { href: '/profil', label: 'Profil Sekolah' },
                { href: '/informasi', label: 'Informasi' },
                { href: '/kegiatan', label: 'Kegiatan' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-[#E8A020] text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3 - Kontak */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#E8A020] mb-4">
              Kontak
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 text-[#E8A020] flex-shrink-0" />
                <span>Jl. Raya Wlingi, Kec. Wlingi,<br />Kabupaten Blitar, Jawa Timur</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Phone className="w-4 h-4 text-[#E8A020] flex-shrink-0" />
                <span>(0342) 691XXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="w-4 h-4 text-[#E8A020] flex-shrink-0" />
                <span>info@smpn1wlingi.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} SMP Negeri 1 Wlingi. Hak cipta dilindungi.
          </p>
          <Link
            href="/login"
            className="text-white/50 hover:text-[#E8A020] text-xs transition-colors"
          >
            Portal Staff & Guru →
          </Link>
        </div>
      </div>
    </footer>
  )
}
