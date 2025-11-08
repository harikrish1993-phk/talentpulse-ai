// src/app/api/match/route.ts - FIXED WITH HISTORY SAVE
import { NextRequest, NextResponse } from 'next/server';
import { getCandidates } from '@/lib/db/candidates';
import { analyzeJobDescription } from '@/lib/ai/jobAnalyzer';
import { matchCandidates } from '@/lib/ai/matcher';
import { createLogger } from '@/lib/logger';
import { db } from '@/lib/db/client';

const logger = createLogger('MatchAPI');

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, minScore = 40, maxResults = 50 } = await request.json();

    // Validation
    if (!jobDescription || jobDescription.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Job description too short (minimum 100 characters)' },
        { status: 400 }
      );
    }

    logger.info('Starting match process', { 
      descriptionLength: jobDescription.length,
      minScore,
      maxResults 
    });

    // Step 1: Analyze job description
    const jobAnalysis = await analyzeJobDescription(jobDescription);
    if (!jobAnalysis.success || !jobAnalysis.data) {
      return NextResponse.json(
        { success: false, error: 'Failed to analyze job description' },
        { status: 500 }
      );
    }

    logger.info('Job analyzed', { 
      title: jobAnalysis.data.title,
      requiredSkills: jobAnalysis.data.required_skills.length 
    });

    // Step 2: Get candidates from database
    const candidatesResult = await getCandidates({ 
      limit: 1000, // Get more, we'll filter after
      status: 'completed',
      minConfidence: 60 // Only include decent parses
    });

    if (!candidatesResult.success || !candidatesResult.data) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch candidates' },
        { status: 500 }
      );
    }

    logger.info('Candidates fetched', { count: candidatesResult.data.length });

    // Step 3: Match candidates
    const matchResult = await matchCandidates(
      candidatesResult.data, 
      jobAnalysis.data, 
      {
        useAI: false, // Use rule-based for speed
        minScore,
        maxResults
      }
    );

    if (!matchResult.success) {
      return NextResponse.json(
        { success: false, error: matchResult.error || 'Matching failed' },
        { status: 500 }
      );
    }

    const matches = matchResult.data || [];
    
    logger.info('Matching completed', { 
      matchesFound: matches.length,
      topScore: matches[0]?.overall_score || 0 
    });

    // ✅ FIX: Save match history to database
    try {
      await db.from('match_history').insert({
        job_title: jobAnalysis.data.title,
        job_description: jobDescription.substring(0, 2000), // Truncate for storage
        match_count: matches.length,
        top_matches: matches.slice(0, 10).map(m => m.candidate.id),
        filters: { minScore, maxResults },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      logger.info('Match history saved to database');
    } catch (historyError) {
      // Don't fail the request if history save fails
      logger.error('Failed to save match history', historyError);
    }

    // Return results
    return NextResponse.json({
      success: true,
      data: {
        jobAnalysis: jobAnalysis.data,
        matches
      },
      metadata: {
        candidatesAnalyzed: candidatesResult.data.length,
        matchesFound: matches.length,
        timestamp: new Date().toISOString(),
        ...matchResult.metadata
      }
    });

  } catch (error: any) {
    logger.error('Match API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Matching failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}