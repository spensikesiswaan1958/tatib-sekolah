import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login — Tatib Digital SMPN 1 Wlingi',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">

      {/* Ornamen latar */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
      </div>

      {/* Card utama */}
      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>

    </div>
  )
}
