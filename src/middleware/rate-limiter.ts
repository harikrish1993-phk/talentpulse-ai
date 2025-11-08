import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger('RateLimiter');

interface RateLimitConfig {
  windowMs: number;
  max: number;
  skipDevelopment?: boolean;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skipDevelopment: true
};

// API endpoints with specific limits
const endpointLimits: Record<string, RateLimitConfig> = {
  '/api/parse': { windowMs: 60 * 1000, max: 10 }, // 10 requests per minute
  '/api/match': { windowMs: 2 * 60 * 1000, max: 20 }, // 20 requests per 2 minutes
  '/api/external-search': { windowMs: 5 * 60 * 1000, max: 5 }, // 5 requests per 5 minutes (expensive API)
  '/api/settings': { windowMs: 60 * 1000, max: 50 }
};

export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): Promise<NextResponse | null> {
  // Skip in development if configured
  if (config.skipDevelopment && process.env.NODE_ENV === 'development') {
    return null;
  }

  const pathname = request.nextUrl.pathname;
  const endpointConfig = endpointLimits[pathname] || config;
  
  const now = Date.now();
  const windowEnd = now + endpointConfig.windowMs;
  
  try {
    // Get client identifier (IP + user agent)
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const clientId = `${ip}-${userAgent.replace(/\W+/g, '')}`;
    
    // Check rate limit
    const { data: existing, error } = await db
      .from('api_rate_limits')
      .select('*')
      .eq('endpoint', pathname)
      .eq('ip_address', ip)
      .gte('reset_time', new Date().toISOString());
    
    if (error) {
      logger.error('Rate limit database error', error);
    }
    
    if (existing && existing.length > 0) {
      const record = existing[0];
      
      // Check if limit exceeded
      if (record.request_count >= endpointConfig.max) {
        logger.warn('Rate limit exceeded', {
          ip,
          endpoint: pathname,
          count: record.request_count
        });
        
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((new Date(record.reset_time).getTime() - Date.now()) / 1000)
          },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
      
      // Update count
      await db
        .from('api_rate_limits')
        .update({ request_count: record.request_count + 1 })
        .eq('id', record.id);
        
    } else {
      // Create new record
      await db
        .from('api_rate_limits')
        .insert({
          endpoint: pathname,
          ip_address: ip,
          request_count: 1,
          reset_time: new Date(windowEnd).toISOString()
        });
    }
    
    return null;
  } catch (error) {
    logger.error('Rate limiting error', error);
    // Fail open - don't block requests if rate limiting fails
    return null;
  }
}

// Wrapper for Next.js middleware
export default async function middleware(request: NextRequest) {
  const response = await rateLimitMiddleware(request);
  return response || NextResponse.next();
}