import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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

  // PENTING: pakai getUser() bukan getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── Belum login → akses dashboard → redirect ke login ─────────────────────
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Sudah login → akses /login → redirect sesuai role ─────────────────────
  if (user && pathname === '/login') {
    // Ambil role dari tabel akun
    const { data: akun } = await supabase
      .from('akun')
      .select('peran')
      .eq('id', user.id)
      .single()

    const peran = akun?.peran ?? null

    if (peran === 'SISWA') {
      return NextResponse.redirect(new URL('/dashboard/portal', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── Siswa coba akses halaman non-portal → redirect ke portal ──────────────
  if (user && pathname.startsWith('/dashboard') && pathname !== '/dashboard/portal') {
    // Cek apakah siswa
    const { data: akun } = await supabase
      .from('akun')
      .select('peran')
      .eq('id', user.id)
      .single()

    if (akun?.peran === 'SISWA') {
      return NextResponse.redirect(new URL('/dashboard/portal', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}