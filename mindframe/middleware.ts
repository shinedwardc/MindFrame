/*
Runs at the Edge before any page renders. Any route that isn't / or /api/auth/* requires a valid session;
unauthenticated users are redirected to the landing page.
*/
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isPublic = req.nextUrl.pathname === '/'
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')

  if (!isLoggedIn && !isPublic && !isAuthRoute) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
