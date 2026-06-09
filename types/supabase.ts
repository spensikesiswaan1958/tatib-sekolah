// ============================================================
// TYPES: Definisi interface untuk seluruh tabel Supabase
// Sesuaikan dengan skema tabel yang ada di Supabase dashboard
// ============================================================

export type PelanggaranKategori = 'RINGAN' | 'SEDANG' | 'BERAT'

export interface KategoriPelanggaran {
  id: string
  no_pelanggaran: number
  nama_pelanggaran: string
  poin: number
  kategori: PelanggaranKategori
  keterangan_tindakan: string
  created_at: string
}

export interface Siswa {
  id: string
  nama: string
  nis: string
  nisn: string
  kelas: string
  rombel: string
  jenis_kelamin: 'L' | 'P'
  nama_ortu: string | null
  no_hp_ortu: string | null
  foto_url: string | null
  total_poin: number
  status_aktif: boolean
  created_at: string
}

export interface LogPelanggaran {
  id: string
  siswa_id: string
  kategori_pelanggaran_id: string
  tanggal: string
  keterangan: string | null
  poin_diberikan: number
  dicatat_oleh: string | null
  guru_bk: string | null
  guru_wali: string | null
  created_at: string
}

export interface Absensi {
  id: string
  siswa_id: string
  tanggal: string
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPHA'
  keterangan: string | null
  created_at: string
}

export interface MasterReward {
  id: string
  nama_reward: string
  poin_dibutuhkan: number
  deskripsi: string | null
  aktif: boolean
  created_at: string
}

export interface AmbangBatasSanksi {
  id: string
  nama_sanksi: string
  poin_minimal: number
  poin_maksimal: number | null
  tindakan: string
  created_at: string
}