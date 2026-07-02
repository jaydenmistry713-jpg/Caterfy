import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE, adminToken, verifyAdminPassword, isAdminConfigured } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'Admin access is not configured. Set ADMIN_PASSWORD in the environment.' },
      { status: 503 }
    )
  }

  const { password } = await request.json().catch(() => ({ password: '' }))
  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })
  return res
}

// Logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
