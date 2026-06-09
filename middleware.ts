import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Buat Supabase client khusus middleware (wajib pakai pola ini agar cookie di-refresh)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // PENTING: Selalu gunakan getUser() (bukan getSession()) untuk keamanan
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Aturan redirect ─────────────────────────────────────────────────────────

  // 1. Akses /dashboard/* tanpa login → redirect ke /login
  if (pathname.startsWith('/dashboard') && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname) // simpan tujuan asli
    return NextResponse.redirect(loginUrl)
  }

  // 2. Akses /login sudah login → redirect ke /dashboard
  if (pathname.startsWith('/login') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Akses root "/" yang sudah login — biarkan, ini halaman publik
  // (halaman publik tetap bisa diakses siapa saja)

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua path KECUALI:
     * - _next/static  (file statis Next.js)
     * - _next/image   (optimisasi gambar)
     * - favicon.ico
     * - file gambar (.svg, .png, dll)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}