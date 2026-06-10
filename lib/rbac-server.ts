// lib/rbac-server.ts
// ⚠️  HANYA import di Server Components, Route Handlers, atau Server Actions
// ❌  JANGAN import di file 'use client'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import type { UserProfile } from '@/lib/auth'
import { isAdmin, isAdminOrGuru, isSiswa } from '@/lib/rbac'

// ─── Guard: wajib login ────────────────────────────────────────────────────────
export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

// ─── Guard: wajib ADMIN ────────────────────────────────────────────────────────
export async function requireAdmin(): Promise<UserProfile> {
  const user = await requireAuth()
  if (!isAdmin(user.peran)) redirect('/dashboard/portal')
  return user
}

// ─── Guard: wajib ADMIN atau GURU ─────────────────────────────────────────────
export async function requireAdminOrGuru(): Promise<UserProfile> {
  const user = await requireAuth()
  if (!isAdminOrGuru(user.peran)) redirect('/dashboard/portal')
  return user
}

// ─── Guard: wajib SISWA ────────────────────────────────────────────────────────
export async function requireSiswa(): Promise<UserProfile> {
  const user = await requireAuth()
  if (!isSiswa(user.peran)) redirect('/dashboard')
  return user
}
