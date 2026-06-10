// lib/rbac.ts — Pure helpers, aman untuk Client & Server Component

export const ROLES = {
  ADMIN: 'ADMIN',
  GURU: 'GURU',
  SISWA: 'SISWA',
} as const

export type Role = keyof typeof ROLES

export type { UserProfile } from '@/lib/auth'

export function isAdmin(peran: string | null): boolean {
  return peran === ROLES.ADMIN
}

export function isGuru(peran: string | null): boolean {
  return peran === ROLES.GURU
}

export function isSiswa(peran: string | null): boolean {
  return peran === ROLES.SISWA
}

export function isAdminOrGuru(peran: string | null): boolean {
  return peran === ROLES.ADMIN || peran === ROLES.GURU
}

export function getHomeRoute(peran: string | null): string {
  switch (peran) {
    case ROLES.ADMIN: return '/dashboard'
    case ROLES.GURU:  return '/dashboard'
    case ROLES.SISWA: return '/dashboard/portal'
    default:          return '/login'
  }
}

export function getRoleLabel(peran: string | null): string {
  switch (peran) {
    case ROLES.ADMIN: return 'Administrator'
    case ROLES.GURU:  return 'Guru / Kepala Sekolah'
    case ROLES.SISWA: return 'Siswa / Wali Murid'
    default:          return 'Pengguna'
  }
}

export function getRoleBadgeColor(peran: string | null): string {
  switch (peran) {
    case ROLES.ADMIN: return 'bg-red-100 text-red-700'
    case ROLES.GURU:  return 'bg-blue-100 text-blue-700'
    case ROLES.SISWA: return 'bg-green-100 text-green-700'
    default:          return 'bg-gray-100 text-gray-600'
  }
}
