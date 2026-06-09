import { createClient } from '@/lib/supabase/server'
import RewardClient from './RewardClient'

export default async function RewardPage() {
  const supabase = await createClient()

  const [
    { data: masterReward },
    { data: logReward },
  ] = await Promise.all([
    supabase
      .from('master_reward')
      .select('id, kondisi, pengurangan_poin, periode, verifikator_default')
      .order('pengurangan_poin', { ascending: false }),
    supabase
      .from('log_reward')
      .select(`
        id,
        siswa_id,
        reward_id,
        tanggal_klaim,
        keterangan,
        status_verifikasi,
        catatan_verifikator,
        created_at,
        siswa (
          nama_siswa,
          kelas,
          nis
        )
      `)
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  return (
    <RewardClient
      masterReward={masterReward ?? []}
      logReward={logReward ?? []}
    />
  )
}
