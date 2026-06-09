import DashboardShell from '@/components/dashboard/DashboardShell'
import Topbar from '@/components/dashboard/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layout ini adalah Server Component.
  // Topbar di-render di sini, lalu dikirim sebagai prop ke DashboardShell (Client).
  // Ini pola resmi Next.js agar Server Component bisa hidup di dalam Client Component.
  return (
    <DashboardShell topbar={<Topbar />}>
      {children}
    </DashboardShell>
  )
}