import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { withAuth } from "next-auth/middleware"

const protectedPaths = ['/upload', '/settings', '/profile']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  console.log('🔍 Middleware Debug:')
  console.log('Requested path:', path)
  console.log('Is protected path:', protectedPaths.some(protectedPath => path.startsWith(protectedPath)))
  
  if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
    console.log('✅ Protected path detected, checking auth...')
    return NextResponse.next()
  }

  console.log('✅ Public path, allowing access')
  return NextResponse.next()
}

export default withAuth(
  function middleware(req) {
    console.log('🛡️ WithAuth middleware executed for:', req.nextUrl.pathname)
    console.log('Token present:', !!req.nextauth.token)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        console.log('🔐 Authorization check:')
        console.log('Path:', pathname)
        console.log('Token:', !!token)
        
        if (pathname === "/settings" || pathname.startsWith("/settings/")) {
          const authorized = !!token
          console.log('Settings access authorized:', authorized)
          return authorized
        }
        
        if (pathname === "/profile" || pathname.startsWith("/profile/")) {
          const authorized = !!token
          console.log('Profile access authorized:', authorized)
          return authorized
        }
        
        if (pathname === "/upload" || pathname.startsWith("/upload/")) {
          const authorized = !!token
          console.log('Upload access authorized:', authorized)
          return authorized
        }
        
        console.log('Public path, access granted')
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/upload/:path*', 
    '/settings/:path*', 
    '/profile/:path*', 
    '/dashboard/:path*'
  ]
}