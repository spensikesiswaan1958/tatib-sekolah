'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, GraduationCap } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/profil', label: 'Profil' },
  { href: '/informasi', label: 'Informasi' },
  { href: '/kegiatan', label: 'Kegiatan' },
]

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Tutup menu saat pindah halaman
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const isHome = pathname === '/'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-[#1B3A6B]/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#E8A020] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-white font-bold text-sm tracking-wide">
                SMPN 1 WLINGI
              </p>
              <p className="text-white/70 text-xs hidden sm:block">
                Kabupaten Blitar
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-[#E8A020]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E8A020]" />
                  )}
                </Link>
              )
            })}
            <Link
              href="/login"
              className="ml-4 px-5 py-2 bg-[#E8A020] hover:bg-[#d4911c] text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
            >
              Login
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#1B3A6B] border-t border-white/10 px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-[#E8A020]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <Link
            href="/login"
            className="block mt-2 px-4 py-2.5 bg-[#E8A020] hover:bg-[#d4911c] text-white text-sm font-semibold rounded-lg text-center transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  )
}
