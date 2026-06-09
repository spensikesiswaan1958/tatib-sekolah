import { getCurrentUser, getDisplayName } from '@/lib/auth'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'

export default async function Topbar() {
  const userProfile = await getCurrentUser()
  const displayName = userProfile ? getDisplayName(userProfile) : 'Pengguna'
  const peran = userProfile?.peran ?? ''

  const roleLabel: Record<string, string> = {
    ADMIN:    'Administrator',
    GURU:     'Guru / Wali Kelas',
    GURU_BK:  'Guru BK',
    OPERATOR: 'Operator',
    SISWA:    'Siswa',
  }

  return (
    <header className="h-14 bg-white flex items-center justify-between px-4 flex-shrink-0">
      {/* Kiri */}
      <span className="text-sm font-bold text-slate-700 hidden sm:block">
        Sistem Tata Tertib Digital
      </span>

      {/* Kanan */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Chip user */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pl-1.5 pr-3 py-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-xs font-bold text-slate-700 max-w-[130px] truncate">
              {displayName}
            </p>
            {peran && (
              <p className="text-[10px] font-medium text-slate-500">
                {roleLabel[peran] ?? peran}
              </p>
            )}
          </div>
        </div>

        {/* Tombol logout */}
        <Link
          href="/logout"
          title="Keluar"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            text-slate-500 hover:text-red-600 hover:bg-red-50
            border border-transparent hover:border-red-200 transition-all"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Keluar</span>
        </Link>
      </div>
    </header>
  )
}