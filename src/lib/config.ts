// ============================================
// FILE: src/lib/config.ts
// Configuration Management
// ============================================

export const config = {
  ai: {
    // OpenAI GPT-4 - Best for complex parsing
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4-turbo-preview', // Most capable model
      maxTokens: 4096,
      temperature: 0.1, // Low for consistent parsing
    },
    // Anthropic Claude - Excellent for analysis
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-opus-20240229',
      maxTokens: 4096,
      temperature: 0.1,
    },
    // Fallback strategy
    fallbackChain: ['openai', 'anthropic', 'regex'],
  },
  
  parsing: {
    minConfidenceThreshold: 70,
    maxRetries: 3,
    timeoutMs: 30000,
    supportedFormats: ['pdf', 'docx', 'txt', 'rtf'],
    maxFileSizeMB: 10,
  },
  
  matching: {
    weights: {
      skills: 0.40,
      experience: 0.30,
      education: 0.15,
      location: 0.10,
      certifications: 0.05,
    },
    tierThresholds: {
      A: 85,
      B: 70,
      C: 50,
      D: 0,
    },
  },
  
  database: {
    maxConnections: 20,
    idleTimeoutMs: 30000,
    connectionTimeoutMs: 5000,
  },
  
  app: {
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};

// Validate configuration on startup
export function validateConfig() {
  const required = {
    'OPENAI_API_KEY': config.ai.openai.apiKey,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value || value.includes('your_'))
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}
