'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'

type DashboardShellProps = {
  children: React.ReactNode
  user: {
    email: string
    nama: string | null        // ← nama (bukan nama_lengkap)
    peran: string | null
  }
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <div className="w-64 h-full">
          <Sidebar
            peran={user.peran}
            nama={user.nama}           // ← nama
            email={user.email}
          />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}