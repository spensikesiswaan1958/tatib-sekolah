// app/(public)/layout.tsx
import type { Metadata } from 'next'
import PublicNavbar from '@/components/public/PublicNavbar'
import PublicFooter from '@/components/public/PublicFooter'

export const metadata: Metadata = {
  title: {
    default: 'SMPN 1 Wlingi',
    template: '%s | SMPN 1 Wlingi',
  },
  description:
    'Website resmi SMP Negeri 1 Wlingi — sekolah unggulan di Kabupaten Blitar yang mencetak generasi berprestasi, berkarakter, dan berdaya saing.',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
