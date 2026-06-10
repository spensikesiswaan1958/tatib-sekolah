import { requireAdmin } from '@/lib/rbac-server'
import { createClient } from '@/lib/supabase/server'
import { Settings, Shield, Bell, Database, Info } from 'lucide-react'

export default async function PengaturanPage() {
  const user = await requireAdmin()
  const supabase = await createClient()

  const { data: ambang } = await supabase
    .from('ambang_batas_sanksi')
    .select('id, poin_minimal, sanksi')
    .order('poin_minimal', { ascending: true })

  const { data: profilSekolah } = await supabase
    .from('profil_sekolah')
    .select('*')
    .limit(1)
    .single()

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">

      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Pengaturan Sistem</h2>
      </div>

      {/* Info Sekolah */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 text-blue-500" />
            Informasi Sekolah
          </h3>
        </div>
        <div className="px-6 py-4 space-y-3">
          {profilSekolah ? (
            Object.entries(profilSekolah)
              .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
              .map(([key, val]) => (
                <div key={key} className="flex gap-4 text-sm">
                  <span className="w-40 text-gray-400 capitalize shrink-0">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-700 font-medium">{String(val ?? '-')}</span>
                </div>
              ))
          ) : (
            <p className="text-sm text-gray-400">Data profil sekolah belum tersedia.</p>
          )}
        </div>
      </div>

      {/* Ambang Batas Sanksi */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-red-500" />
            Ambang Batas Sanksi
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Konfigurasi poin minimum untuk setiap level sanksi.
          </p>
        </div>
        <div className="px-6 py-4 space-y-2">
          {(ambang ?? []).map((a, idx) => {
            const colors = [
              'bg-yellow-50 border-yellow-200 text-yellow-700',
              'bg-orange-50 border-orange-200 text-orange-700',
              'bg-red-50 border-red-200 text-red-700',
              'bg-red-100 border-red-300 text-red-800',
            ]
            return (
              <div key={a.id}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border ${colors[idx] ?? colors[3]}`}>
                <div>
                  <p className="text-sm font-semibold">{a.sanksi.split('–')[0].trim()}</p>
                  <p className="text-xs mt-0.5 opacity-75">
                    {a.sanksi.split('–').slice(1).join('–').trim() || a.sanksi}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-2xl font-bold">{a.poin_minimal}</p>
                  <p className="text-xs opacity-75">poin minimum</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info Sistem */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
            <Database className="w-4 h-4 text-green-500" />
            Info Sistem
          </h3>
        </div>
        <div className="px-6 py-4 space-y-3 text-sm">
          {[
            { label: 'Framework',  val: 'Next.js 15 App Router' },
            { label: 'Database',   val: 'Supabase (PostgreSQL)' },
            { label: 'Auth',       val: 'Supabase Auth (segera)' },
            { label: 'Versi',      val: '1.0.0-beta' },
            { label: 'Sekolah',    val: 'UPT SMPN 1 Wlingi' },
          ].map(item => (
            <div key={item.label} className="flex gap-4">
              <span className="w-32 text-gray-400 shrink-0">{item.label}</span>
              <span className="text-gray-700 font-medium">{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifikasi (placeholder) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
            <Bell className="w-4 h-4 text-yellow-500" />
            Notifikasi
          </h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-400 italic">
            Fitur notifikasi (WhatsApp/Email ke orang tua) akan tersedia setelah
            sistem autentikasi selesai diimplementasikan.
          </p>
        </div>
      </div>

    </div>
  )
}
