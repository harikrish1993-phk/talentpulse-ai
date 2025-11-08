// src/app/api/stats/route.ts - FIXED WITH EXTERNAL CANDIDATES
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger('StatsAPI');

export async function GET() {
  try {
    logger.info('Fetching dashboard statistics');

    // Get total candidates
    const { count: total } = await db
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Get recent week candidates
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentWeek } = await db
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo)
      .is('deleted_at', null);

    // Get high quality candidates (confidence >= 80)
    const { count: highQuality } = await db
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .gte('parse_confidence', 80)
      .eq('parse_status', 'completed')
      .is('deleted_at', null);

    // Get average confidence
    const { data: confidenceData } = await db
      .from('candidates')
      .select('parse_confidence')
      .is('deleted_at', null);

    const avgConfidence = confidenceData && confidenceData.length > 0
      ? Math.round(
          confidenceData.reduce((sum, c) => sum + (c.parse_confidence || 0), 0) / 
          confidenceData.length
        )
      : 0;

    // ✅ FIX: Get external candidates count (Apollo, etc.)
    const { count: externalCandidates } = await db
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'apollo')
      .is('deleted_at', null);

    // Get stats by source
    const { data: sourceData } = await db
      .from('candidates')
      .select('source')
      .is('deleted_at', null);

    const bySource = (sourceData || []).reduce((acc: Record<string, number>, c) => {
      acc[c.source] = (acc[c.source] || 0) + 1;
      return acc;
    }, {});

    // Get stats by status
    const { data: statusData } = await db
      .from('candidates')
      .select('parse_status')
      .is('deleted_at', null);

    const byStatus = (statusData || []).reduce((acc: Record<string, number>, c) => {
      acc[c.parse_status] = (acc[c.parse_status] || 0) + 1;
      return acc;
    }, {});

    logger.info('Stats fetched successfully', {
      total,
      recentWeek,
      highQuality,
      avgConfidence,
      externalCandidates
    });

    return NextResponse.json({
      success: true,
      data: {
        total: total || 0,
        recentWeek: recentWeek || 0,
        highQuality: highQuality || 0,
        avgConfidence,
        externalCandidates: externalCandidates || 0, // ✅ NOW INCLUDED
        bySource,
        byStatus
      }
    });

  } catch (error: any) {
    logger.error('Stats API error:', error);
    
    // Return safe defaults on error
    return NextResponse.json({
      success: true,
      data: {
        total: 0,
        recentWeek: 0,
        highQuality: 0,
        avgConfidence: 0,
        externalCandidates: 0,
        bySource: {},
        byStatus: {}
      }
    });
  }
}