import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const logger = createLogger('APIErrorHandler');

export function handleApiError(
  error: unknown,
  context: string,
  options: {
    publicMessage?: string;
    includeStack?: boolean;
    status?: number;
  } = {}
) {
  const {
    publicMessage = 'An internal error occurred',
    includeStack = process.env.NODE_ENV === 'development',
    status = 500
  } = options;
  
  // Standardize error object
  const err = error instanceof Error ? error : new Error(String(error));
  
  // Log the error with context
  logger.error(`${context} failed`, {
    error: {
      message: err.message,
      stack: includeStack ? err.stack : undefined,
      name: err.name
    },
    context
  });
  
  // Prepare response
  const response = {
    success: false,
    error: publicMessage,
    ...(includeStack && { stack: err.stack }),
    timestamp: new Date().toISOString()
  };
  
  // For auth errors, use 401 status
  if (err.message.toLowerCase().includes('unauthorized') || 
      err.message.toLowerCase().includes('authentication')) {
    return NextResponse.json(response, { status: 401 });
  }
  
  // For validation errors, use 400 status
  if (err.message.toLowerCase().includes('validation') ||
      err.message.toLowerCase().includes('invalid') ||
      err.message.toLowerCase().includes('required')) {
    return NextResponse.json(response, { status: 400 });
  }
  
  // Default status
  return NextResponse.json(response, { status });
}

// Wrapper for API routes
export function withErrorHandler<T extends (...args: any[]) => any>(
  handler: T,
  context: string
) {
  return async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}