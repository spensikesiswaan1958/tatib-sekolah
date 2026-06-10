'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  List,
  Gift,
  CalendarCheck,
  Settings,
  GraduationCap,
  User,
  Shield,
} from 'lucide-react'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/rbac'

type SidebarProps = {
  peran: string | null
  nama: string | null          // ← nama (bukan namaLengkap)
  email: string
}

export default function Sidebar({ peran, nama, email }: SidebarProps) {
  const pathname = usePathname()
  const displayName = nama ?? email.split('@')[0] ?? 'Pengguna'

  type LinkItem = {
    type: 'link'
    href: string
    icon: React.ReactNode
    label: string
  }
  type GroupItem = {
    type: 'group'
    label: string
    icon: React.ReactNode
    children: { href: string; label: string }[]
  }
  type MenuItem = LinkItem | GroupItem

  const adminGuruMenu: MenuItem[] = [
    {
      type: 'link',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: 'Dashboard',
    },
    {
      type: 'link',
      href: '/dashboard/siswa',
      icon: <Users className="w-4 h-4" />,
      label: 'Data Siswa',
    },
    {
      type: 'group',
      label: 'Pelanggaran',
      icon: <AlertTriangle className="w-4 h-4" />,
      children: [
        { href: '/dashboard/pelanggaran/tambah', label: 'Input Pelanggaran' },
        { href: '/dashboard/pelanggaran/log', label: 'Log Pelanggaran' },
        ...(peran === 'ADMIN'
          ? [{ href: '/dashboard/pelanggaran/kategori', label: 'Kategori' }]
          : []),
      ],
    },
    {
      type: 'link',
      href: '/dashboard/reward',
      icon: <Gift className="w-4 h-4" />,
      label: 'Reward Siswa',
    },
    {
      type: 'link',
      href: '/dashboard/absensi',
      icon: <CalendarCheck className="w-4 h-4" />,
      label: 'Absensi',
    },
  ]

  const adminOnlyMenu: MenuItem[] = [
    {
      type: 'link',
      href: '/dashboard/konten',
      icon: <GraduationCap className="w-4 h-4" />,
      label: 'Kelola Konten Web',
    },
    {
      type: 'link',
      href: '/dashboard/laporan',
      icon: <List className="w-4 h-4" />,
      label: 'Laporan PDF/Excel',
    },
    {
      type: 'link',
      href: '/dashboard/pengaturan',
      icon: <Settings className="w-4 h-4" />,
      label: 'Pengaturan',
    },
  ]

  const siswaMenu: MenuItem[] = [
    {
      type: 'link',
      href: '/dashboard/portal',
      icon: <User className="w-4 h-4" />,
      label: 'Profil Saya',
    },
  ]

  let menuItems: MenuItem[] = []
  if (peran === 'ADMIN') {
    menuItems = [...adminGuruMenu, ...adminOnlyMenu]
  } else if (peran === 'GURU') {
    menuItems = adminGuruMenu
  } else if (peran === 'SISWA') {
    menuItems = siswaMenu
  }

  function renderItem(item: MenuItem, idx: number) {
    if (item.type === 'link') {
      const isActive =
        item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href)
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
            isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
              : 'text-white/65 hover:bg-white/[0.08] hover:text-white'
          }`}
        >
          <span className={isActive ? 'text-white' : 'text-white/50'}>
            {item.icon}
          </span>
          {item.label}
        </Link>
      )
    }

    if (item.type === 'group') {
      const isGroupActive = item.children.some((c) =>
        pathname.startsWith(c.href)
      )
      return (
        <div key={idx} className="mt-1">
          <div
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
              isGroupActive ? 'text-white/80' : 'text-white/35'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </div>
          <div className="space-y-0.5">
            {item.children.map((child) => {
              const isActive = pathname.startsWith(child.href)
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`flex items-center gap-3 pl-8 pr-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/80 text-white'
                      : 'text-white/55 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                  {child.label}
                </Link>
              )
            })}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <aside className="h-full flex flex-col bg-[#1a2332] text-white overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">Tatib Digital</p>
            <p className="text-white/50 text-xs truncate">SMPN 1 Wlingi</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white/60" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {displayName}
            </p>
            <span
              className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${getRoleBadgeColor(peran)}`}
            >
              {getRoleLabel(peran)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-2 mb-3">
          Menu Utama
        </p>
        {menuItems.map((item, idx) => renderItem(item, idx))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
        <p className="text-white/25 text-[10px] text-center">
          © 2026 UPT SMPN 1 Wlingi
        </p>
      </div>
    </aside>
  )
}