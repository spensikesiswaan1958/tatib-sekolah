'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'

export default function LoginForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email atau kata sandi salah. Silakan coba lagi.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Email belum dikonfirmasi. Hubungi administrator.')
        } else if (authError.message.includes('Too many requests')) {
          setError('Terlalu banyak percobaan. Coba lagi beberapa saat.')
        } else {
          setError(authError.message)
        }
        return
      }

      router.refresh()
      router.push('/dashboard')

    } catch {
      setError('Terjadi kesalahan. Periksa koneksi internet Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4" noValidate>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
          <span className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contoh@gmail.com"
          disabled={loading}
          className="
            w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-900
            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
            disabled:bg-slate-50 disabled:text-slate-400
            placeholder:text-slate-500
            bg-white transition-colors shadow-sm
          "
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">
          Kata Sandi
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan kata sandi"
            disabled={loading}
            className="
              w-full px-4 py-2.5 pr-11 rounded-lg border border-slate-300 text-sm font-medium text-slate-900
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
              disabled:bg-slate-50 disabled:text-slate-400
              placeholder:text-slate-500
              bg-white transition-colors shadow-sm
            "
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition-colors"
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Tombol login */}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="
          w-full flex items-center justify-center gap-2
          bg-blue-600 hover:bg-blue-700 active:bg-blue-800
          disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed
          text-white font-bold text-sm
          py-2.5 rounded-lg shadow-sm
          transition-all duration-150
          mt-3
        "
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <LogIn size={18} />
            Masuk Dashboard
          </>
        )}
      </button>

    </form>
  )
}
