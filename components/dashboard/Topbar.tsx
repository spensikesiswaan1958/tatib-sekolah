'use client'

import Link from 'next/link'
import { Menu, User, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/rbac'

type TopbarProps = {
  onToggleSidebar: () => void
  user: {
    email: string
    nama: string | null          // ← nama
    peran: string | null
  }
}

export default function Topbar({ onToggleSidebar, user }: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const displayName = user.nama ?? user.email.split('@')[0] ?? 'Pengguna'

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0 z-30">
      <button
        onClick={onToggleSidebar}
        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <h1 className="font-semibold text-gray-800 text-sm">
          Sistem Tata Tertib Digital
        </h1>
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-800 leading-none">
              {displayName}
            </p>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${getRoleBadgeColor(user.peran)}`}
            >
              {getRoleLabel(user.peran)}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-semibold text-gray-800">{displayName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/logout"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
                  onClick={() => setDropdownOpen(false)}
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}