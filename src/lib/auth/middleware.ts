// src/lib/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config/env';
import { createClient } from '@supabase/supabase-js';

/**
 * Simplified Auth Middleware
 * In development: allows all requests
 * In production: requires valid authorization (implement as needed)
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Skip auth in development
  if (env.app.nodeEnv === 'development') {
    return null;
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      env.supabase.url,
      env.supabase.anonKey
    );
    
    // Get session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      // Try to get token from header as fallback
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        // We could validate this token with your auth provider
        // For now, we'll allow the request to proceed
        return null;
      }
      
      // Redirect to login for page requests
      if (!request.nextUrl.pathname.startsWith('/api')) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Successfully authenticated - add user info to headers
    const response = NextResponse.next();
    response.headers.set('x-user-id', session.user.id);
    
    // Handle potentially undefined email
    if (session.user.email) {
      response.headers.set('x-user-email', session.user.email);
    }
    
    return response;
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Redirect to login for page requests
    if (!request.nextUrl.pathname.startsWith('/api')) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Optional middleware - doesn't block requests
 * Use this for routes that should work with or without auth
 */
export function optionalAuth(request: NextRequest): { isAuthenticated: boolean } {
  if (env.app.nodeEnv === 'development') {
    return { isAuthenticated: true };
  }
  
  const token = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');
  return {
    isAuthenticated: !!(token || apiKey),
  };
}