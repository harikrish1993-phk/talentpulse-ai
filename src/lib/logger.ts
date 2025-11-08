// ============================================
// FILE: src/lib/logger.ts
// Structured Logging
// ============================================

// src/lib/logger.ts
import { config } from './config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private context: string;
  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(data && { data }),
    };

    // ✅ Now `config` is defined
    if (config.app.environment === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
  info(message: string, data?: any) {
    this.log('info', message, data);
  }
  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }
  error(message: string, error?: any) {
    this.log('error', message, {
      error: error?.message,
      stack: error?.stack,
      ...(error?.response && { response: error.response }),
    });
  }
}

export function createLogger(context: string) {
  return new Logger(context);
}