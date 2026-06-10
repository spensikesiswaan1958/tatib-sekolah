import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getHomeRoute } from '@/lib/rbac'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect(getHomeRoute(user.peran))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B3A6B] via-[#1e4080] to-[#2a5298] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SMPN 1 Wlingi</h1>
          <p className="text-white/60 text-sm mt-1">Sistem Tata Tertib Digital</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Masuk</h2>
          <p className="text-sm text-gray-400 mb-6">
            Login sesuai akun yang diberikan sekolah
          </p>
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          © 2026 UPT SMPN 1 Wlingi
        </p>
      </div>
    </div>
  )
}
