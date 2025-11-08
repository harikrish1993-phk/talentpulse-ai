// ============================================
// Config File
// FILE: src/lib/config/env.ts
// ============================================

export const env = {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  };
  
  export function validateEnv() {
    const required = [
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];
  
    const missing = required.filter(key => {
      const value = process.env[key];
      return !value || value.includes('xxx') || value.includes('your-');
    });
  
    if (missing.length > 0 && env.app.nodeEnv === 'production') {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
  
    return true;
  }
  