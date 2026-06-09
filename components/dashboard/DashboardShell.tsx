'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

interface DashboardShellProps {
  children: React.ReactNode
  topbar: React.ReactNode
}

export default function DashboardShell({ children, topbar }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* Sidebar — selalu ada di DOM, hanya geser masuk/keluar */}
      <div
        className={`
          flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? 'w-64' : 'w-0'}
        `}
      >
        <Sidebar
          open={true}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Area kanan */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar row */}
        <div className="flex items-center border-b border-slate-200 bg-white shadow-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-4 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex-shrink-0"
            aria-label={sidebarOpen ? 'Tutup Menu' : 'Buka Menu'}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            {topbar}
          </div>
        </div>

        {/* Konten */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  )
}