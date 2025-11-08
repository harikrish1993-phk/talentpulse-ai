import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { createLogger } from '../logger';

const logger = createLogger('Database');

let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    supabaseClient = createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'talentplus',
        },
      },
    });

    logger.info('Database client initialized');
  }

  return supabaseClient;
}

// Export the singleton instance
export const db = createClient();