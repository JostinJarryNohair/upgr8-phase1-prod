// src/middleware.ts (or middleware.ts at root)
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Remove all console.logs for production
const isDevelopment = process.env.NODE_ENV === 'development'

export async function middleware(req: NextRequest) {
  // Only log in development
  if (isDevelopment) {
    console.log('Middleware running for path:', req.nextUrl.pathname)
  }
  
  // Create a response that we can modify
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })
  
  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set({ name, value, ...options })
            res.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Check if this is a protected route
  const { pathname } = req.nextUrl
  const isProtectedRoute = 
    pathname.startsWith('/coach-dashboard') ||
    pathname.startsWith('/players-dashboard') ||
    pathname.startsWith('/scout-dashboard')

  if (isProtectedRoute) {
    try {
      // Get the user session
      const { data: { user }, error } = await supabase.auth.getUser()
      
      // If no user or error, redirect to login
      if (error || !user) {
        // Only log errors in development
        if (isDevelopment && error) {
          console.error('Auth error:', error.message)
        }
        
        const loginUrl = req.nextUrl.clone()
        loginUrl.pathname = '/login'
        loginUrl.searchParams.set('redirectTo', pathname)
        
        // Add cache control headers to prevent caching of redirect
        const redirectResponse = NextResponse.redirect(loginUrl)
        redirectResponse.headers.set('x-middleware-cache', 'no-cache')
        
        return redirectResponse
      }
      
      // Add user info to headers for server components
      res.headers.set('x-user-id', user.id)
      res.headers.set('x-user-email', user.email || '')
      
      // Security headers
      res.headers.set('x-frame-options', 'DENY')
      res.headers.set('x-content-type-options', 'nosniff')
      
    } catch (error) {
      // Log unexpected errors (consider using a proper error tracking service)
      if (isDevelopment) {
        console.error('Middleware error:', error)
      }
      
      // In production, you might want to track this error
      // Example: Sentry.captureException(error)
      
      // Redirect to login on unexpected errors
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('error', 'auth_error')
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return res
}

export const config = {
  matcher: [
    // Protected routes
    '/coach-dashboard/:path*',
    '/players-dashboard/:path*',
    '/scout-dashboard/:path*',
    // Optional: Add API routes that need protection
    // '/api/protected/:path*',
  ],
}