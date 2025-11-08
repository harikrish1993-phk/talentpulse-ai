// ============================================
// FILE: src/lib/db/candidates.ts
// Candidate Database Operations
// ============================================

import { db } from './client';
import { Candidate, ApiResponse } from '../types';
import { createLogger } from '../logger';

const logger = createLogger('CandidatesDB');

export async function saveCandidate(
  candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<Candidate>> {
  try {
    const { data, error } = await db
      .from('candidates')
      .insert({
        ...candidate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    logger.info('Candidate saved', { id: data.id, name: data.name });
    
    return { success: true, data };
  } catch (error: any) {
    logger.error('Failed to save candidate', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save candidate' 
    };
  }
}

export async function getCandidates(options: {
  limit?: number;
  offset?: number;
  status?: string;
  minConfidence?: number;
  source?: string; // ADD THIS LINE
  orderBy?: 'created_at' | 'parse_confidence' | 'name';
  orderDirection?: 'asc' | 'desc';
} = {}): Promise<ApiResponse<Candidate[]>> {
  try {
    const {
      limit = 100,
      offset = 0,
      status,
      minConfidence,
      source, // ADD THIS
      orderBy = 'created_at',
      orderDirection = 'desc',
    } = options;

    let query = db
      .from('candidates')
      .select('*')
      .is('deleted_at', null);

    if (status) {
      query = query.eq('parse_status', status);
    }

    if (minConfidence) {
      query = query.gte('parse_confidence', minConfidence);
    }

    // ADD source filtering
    if (source) {
      query = query.eq('source', source);
    }

    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    logger.error('Failed to get candidates', error);
    return { success: true, data: [] };
  }
}

export async function searchCandidates(
  searchQuery: string
): Promise<ApiResponse<Candidate[]>> {
  try {
    if (!searchQuery.trim()) {
      return getCandidates();
    }

    // Use full-text search or fallback to simple search
    const { data, error } = await db
      .from('candidates')
      .select('*')
      .or(`name.ilike.%${searchQuery}%,skills.cs.{${searchQuery}},title.ilike.%${searchQuery}%`)
      .is('deleted_at', null)
      .limit(50);

    if (error) {
      // Fallback to simple search
      const { data: fallbackData, error: fallbackError } = await db
        .from('candidates')
        .select('*')
        .is('deleted_at', null)
        .limit(50);

      if (fallbackError) throw fallbackError;

      // Manual filtering
      const filtered = fallbackData?.filter(candidate => 
        candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.skills?.some((skill: string) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ) || [];

      return { success: true, data: filtered };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    logger.error('Search failed', error);
    return { success: true, data: [] };
  }
}

export async function getCandidateById(
  id: string
): Promise<ApiResponse<Candidate>> {
  try {
    const { data, error } = await db
      .from('candidates')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;

    // Update last_viewed_at
    await db
      .from('candidates')
      .update({ last_viewed_at: new Date().toISOString() })
      .eq('id', id);

    return { success: true, data };
  } catch (error: any) {
    logger.error('Failed to get candidate', error);
    return { 
      success: false, 
      error: 'Candidate not found' 
    };
  }
}

export async function updateCandidate(
  id: string,
  updates: Partial<Candidate>
): Promise<ApiResponse<Candidate>> {
  try {
    const { data, error } = await db
      .from('candidates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    logger.info('Candidate updated', { id });
    
    return { success: true, data };
  } catch (error: any) {
    logger.error('Failed to update candidate', error);
    return { 
      success: false, 
      error: 'Failed to update candidate' 
    };
  }
}

export async function softDeleteCandidate(
  id: string
): Promise<ApiResponse<void>> {
  try {
    const { error } = await db
      .from('candidates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    logger.info('Candidate soft deleted', { id });
    
    return { success: true };
  } catch (error: any) {
    logger.error('Failed to delete candidate', error);
    return { 
      success: false, 
      error: 'Failed to delete candidate' 
    };
  }
}

export async function getStats(): Promise<ApiResponse<{
  total: number;
  recentWeek: number;
  highQuality: number;
  avgConfidence: number;
  byStatus: Record<string, number>;
}>> {
  try {
    const { count: total } = await db
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentWeek } = await db
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo)
      .is('deleted_at', null);

    const { count: highQuality } = await db
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .gte('parse_confidence', 80)
      .eq('parse_status', 'completed')
      .is('deleted_at', null);

    const { data: confidenceData } = await db
      .from('candidates')
      .select('parse_confidence')
      .is('deleted_at', null);

    const avgConfidence = confidenceData && confidenceData.length > 0
      ? Math.round(
          confidenceData.reduce((sum, c) => sum + c.parse_confidence, 0) / 
          confidenceData.length
        )
      : 0;

    const { data: statusData } = await db
      .from('candidates')
      .select('parse_status')
      .is('deleted_at', null);

    const byStatus = (statusData || []).reduce((acc: Record<string, number>, c) => {
      acc[c.parse_status] = (acc[c.parse_status] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        total: total || 0,
        recentWeek: recentWeek || 0,
        highQuality: highQuality || 0,
        avgConfidence,
        byStatus,
      },
    };
  } catch (error: any) {
    logger.error('Failed to get stats', error);
    return {
      success: true,
      data: {
        total: 0,
        recentWeek: 0,
        highQuality: 0,
        avgConfidence: 0,
        byStatus: {},
      },
    };
  }
}