'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, AlertTriangle, List,
  Gift, CalendarCheck, GraduationCap,
  PlusCircle, Settings,
} from 'lucide-react'

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/dashboard/siswa',
    label: 'Data Siswa',
    icon: Users,
  },
  {
    label: 'Pelanggaran',
    icon: AlertTriangle,
    children: [
      { href: '/dashboard/pelanggaran/tambah',  label: 'Input Pelanggaran', icon: PlusCircle },
      { href: '/dashboard/pelanggaran/log',      label: 'Log Pelanggaran',   icon: List },
      { href: '/dashboard/pelanggaran/kategori', label: 'Kategori',          icon: List },
    ],
  },
  {
    href: '/dashboard/reward',
    label: 'Reward Siswa',
    icon: Gift,
  },
  {
    href: '/dashboard/absensi',
    label: 'Absensi',
    icon: CalendarCheck,
  },
  {
    href: '/dashboard/pengaturan',
    label: 'Pengaturan',
    icon: Settings,
  },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const isGroupActive = (children: { href: string }[]) =>
    children.some((c) => pathname.startsWith(c.href))

  return (
    <aside className="w-64 h-full bg-slate-900 flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-white font-bold text-sm tracking-wide">Tatib Digital</p>
            <p className="text-slate-400 text-[10px] font-medium">SMPN 1 Wlingi</p>
          </div>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">
          Menu Utama
        </p>

        {navItems.map((item) => {
          // Item dengan children (grup)
          if ('children' in item && item.children) {
            const groupActive = isGroupActive(item.children)
            const Icon = item.icon
            return (
              <div key={item.label}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  ${groupActive ? 'text-slate-100' : 'text-slate-400'}`}>
                  <Icon size={18} className="flex-shrink-0" />
                  {item.label}
                </div>
                <div className="ml-4 space-y-0.5">
                  {item.children.map((child) => {
                    const ChildIcon = child.icon
                    const active = pathname.startsWith(child.href)
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium
                          transition-all duration-200
                          ${active
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                          }`}
                      >
                        <ChildIcon size={14} className="flex-shrink-0" />
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          }

          // Item biasa
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${active
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-[11px] text-slate-500 text-center font-medium">
          &copy; {new Date().getFullYear()} UPT SMPN 1 Wlingi
        </p>
      </div>
    </aside>
  )
}