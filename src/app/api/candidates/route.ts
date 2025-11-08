// src/app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCandidates, searchCandidates } from '@/lib/db/candidates';
import { createLogger } from '@/lib/logger';
export const dynamic = 'force-dynamic';
const logger = createLogger('CandidatesAPI');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status') || undefined;
    const minConfidence = parseInt(searchParams.get('minConfidence') || '0');
    const source = searchParams.get('source') || undefined;
    
    // Sort parameters
    const orderBy = (searchParams.get('orderBy') || 'created_at') as 'created_at' | 'parse_confidence' | 'name';
    const orderDirection = (searchParams.get('orderDirection') || 'desc') as 'asc' | 'desc';

    logger.info('Fetching candidates', { 
      page, 
      limit, 
      query, 
      status,
      minConfidence 
    });

    let result;
    
    if (query && query.trim().length > 0) {
      // Search mode
      result = await searchCandidates(query);
      
      // Apply filters to search results
      let filtered = result.data || [];
      
      if (status) {
        filtered = filtered.filter(c => c.parse_status === status);
      }
      
      if (minConfidence > 0) {
        filtered = filtered.filter(c => c.parse_confidence >= minConfidence);
      }
      
      if (source) {
        filtered = filtered.filter(c => c.source === source);
      }
      
      // Manual pagination for search results
      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);
      
      return NextResponse.json({
        success: true,
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: offset + limit < total,
          hasPrev: page > 1
        }
      });
      
    } else {
      // Normal list mode with database pagination
      // FIX: Remove 'source' from the options since it's not in the type
      result = await getCandidates({
        limit,
        offset,
        status,
        minConfidence,
        // Remove source from here since it's not in the type definition
        orderBy,
        orderDirection
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch candidates');
      }
      
      // Get total count for pagination
      const { db } = await import('@/lib/db/client');
      
      let countQuery = db
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);
      
      if (status) {
        countQuery = countQuery.eq('parse_status', status);
      }
      
      if (minConfidence > 0) {
        countQuery = countQuery.gte('parse_confidence', minConfidence);
      }
      
      if (source) {
        countQuery = countQuery.eq('source', source);
      }
      
      const { count: total } = await countQuery;
      
      return NextResponse.json({
        success: true,
        data: result.data || [],
        pagination: {
          page,
          limit,
          total: total || 0,
          totalPages: Math.ceil((total || 0) / limit),
          hasNext: offset + limit < (total || 0),
          hasPrev: page > 1
        }
      });
    }
    
  } catch (error: any) {
    logger.error('Candidates API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch candidates',
      details: error.message
    }, { status: 500 });
  }
}