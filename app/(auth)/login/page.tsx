import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  // Kalau sudah login, langsung ke dashboard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">

      {/* Header card */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-7 text-center">
        {/* Logo / Inisial sekolah */}
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
          <span className="text-blue-700 font-black text-xl leading-none">S1W</span>
        </div>
        <h1 className="text-white font-bold text-lg leading-tight">
          Sistem Tata Tertib Digital
        </h1>
        <p className="text-blue-200 text-sm mt-1">
          UPT SMP Negeri 1 Wlingi
        </p>
      </div>

      {/* Form area */}
      <div className="px-8 py-7">
        <p className="text-slate-500 text-sm text-center mb-6">
          Masuk dengan akun yang telah didaftarkan oleh administrator.
        </p>

        <LoginForm />
      </div>

      {/* Footer card */}
      <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-400">
          Hanya untuk staf yang berwenang. &copy; {new Date().getFullYear()} SMPN 1 Wlingi
        </p>
      </div>

    </div>
  )
}
