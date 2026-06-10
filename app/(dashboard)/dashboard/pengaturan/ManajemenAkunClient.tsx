'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users, Plus, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Loader2, X
} from 'lucide-react'

type AkunItem = {
  id: string
  nama: string
  email: string
  peran: string
  created_at: string
}

type Props = {
  akunList: AkunItem[]
}

const PERAN_BADGE: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 border-red-200',
  GURU:  'bg-blue-100 text-blue-700 border-blue-200',
  SISWA: 'bg-green-100 text-green-700 border-green-200',
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export default function ManajemenAkunClient({ akunList }: Props) {
  const supabase = createClient()

  const [daftarAkun, setDaftarAkun] = useState<AkunItem[]>(akunList)
  const [showForm, setShowForm]     = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Form state
  const [nama, setNama]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [peran, setPeran]       = useState<'GURU' | 'SISWA'>('GURU')

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 5000)
  }

  const resetForm = () => {
    setNama('')
    setEmail('')
    setPassword('')
    setPeran('GURU')
    setShowForm(false)
    setShowPass(false)
  }

  const handleTambahAkun = async () => {
    // Validasi
    if (!nama.trim())           return showToast('error', 'Nama wajib diisi.')
    if (!email.trim())          return showToast('error', 'Email wajib diisi.')
    if (password.length < 6)    return showToast('error', 'Password minimal 6 karakter.')

    setSaving(true)

    try {
      // Step 1 — Daftar user baru via Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { nama: nama.trim() }
        }
      })

      if (signUpError) throw new Error(signUpError.message)
      if (!signUpData.user) throw new Error('User tidak terbuat.')

      const newUserId = signUpData.user.id

      // Step 2 — Insert ke tabel akun
      const { error: akunError } = await supabase
        .from('akun')
        .insert({
          id:    newUserId,
          email: email.trim(),
          nama:  nama.trim(),
          peran: peran,
          role:  peran.toLowerCase(),
        })

      if (akunError) throw new Error(`Akun terbuat tapi gagal simpan profil: ${akunError.message}`)

      // Update UI
      const akunBaru: AkunItem = {
        id:         newUserId,
        nama:       nama.trim(),
        email:      email.trim(),
        peran:      peran,
        created_at: new Date().toISOString(),
      }
      setDaftarAkun(prev => [akunBaru, ...prev])
      showToast('success', `Akun ${peran} untuk ${nama.trim()} berhasil dibuat.`)
      resetForm()

    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Gagal membuat akun.')
    } finally {
      setSaving(false)
    }
  }

  const guruCount  = daftarAkun.filter(a => a.peran === 'GURU').length
  const siswaCount = daftarAkun.filter(a => a.peran === 'SISWA').length
  const adminCount = daftarAkun.filter(a => a.peran === 'ADMIN').length

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-purple-500" />
            Manajemen Akun Pengguna
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {adminCount} Admin · {guruCount} Guru · {siswaCount} Siswa
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Batal' : 'Tambah Akun'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
          ${toast.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Form Tambah Akun */}
      {showForm && (
        <div className="mx-6 mt-4 p-5 bg-purple-50 border border-purple-100 rounded-2xl space-y-4">
          <p className="text-sm font-semibold text-purple-800">Form Tambah Akun Baru</p>

          {/* Peran */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Peran <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(['GURU', 'SISWA'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeran(p)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition
                    ${peran === p
                      ? p === 'GURU'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {p === 'GURU' ? '👨🏫 Guru' : '🎒 Siswa'}
                </button>
              ))}
            </div>
          </div>

          {/* Nama */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder={peran === 'GURU' ? 'Contoh: Budi Santoso, S.Pd.' : 'Contoh: Ahmad Fauzi'}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={peran === 'GURU' ? 'guru@smpn1wlingi.sch.id' : 'siswa@smpn1wlingi.sch.id'}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Password <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">(minimal 6 karakter)</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            onClick={handleTambahAkun}
            disabled={saving}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400
              text-white font-medium rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat akun...</>
              : <><Plus className="w-4 h-4" /> Buat Akun {peran}</>
            }
          </button>
        </div>
      )}

      {/* Daftar Akun */}
      <div className="divide-y divide-gray-50 mt-2">
        {daftarAkun.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400">
            Belum ada akun terdaftar.
          </div>
        ) : (
          daftarAkun.map(akun => (
            <div key={akun.id} className="px-6 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                  {akun.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{akun.nama}</p>
                  <p className="text-xs text-gray-400">{akun.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border
                  ${PERAN_BADGE[akun.peran] ?? 'bg-gray-100 text-gray-500'}`}>
                  {akun.peran}
                </span>
                <span className="text-xs text-gray-400 hidden sm:block">
                  {formatTanggal(akun.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
